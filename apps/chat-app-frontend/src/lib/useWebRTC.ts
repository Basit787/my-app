import { useCallback, useEffect, useRef, useState } from "react";
import type { Socket } from "socket.io-client";
import type { CallType } from "@/features/chat/api/api";
import { getUserMedia, switchCamera as switchLocalCamera } from "@/lib/media";
import { toastError } from "@/lib/toast";
import { attachRemoteTrack } from "@/lib/webrtc/attach-remote-track";
import { subscribeSocket } from "@/lib/webrtc/subscribe-socket";
import { useIceServers } from "@/lib/webrtc/use-ice-servers";

type CallPeer = {
  username: string;
  callType: CallType;
};

/** calling: invite sent · ringing: callee's app received it · connected: callee answered */
export type DmCallStatus = "idle" | "calling" | "ringing" | "connected";

const NO_ANSWER_TIMEOUT_MS = 45_000;

type UseWebRTCOptions = {
  socket: Socket | null;
  selfUsername: string;
  enabled: boolean;
};

// One-to-one call: invite → offer/answer → ICE, with the callee's answer bound to this device
export const useWebRTC = ({ socket, selfUsername, enabled }: UseWebRTCOptions) => {
  const [callPeer, setCallPeer] = useState<CallPeer | null>(null);
  const [incomingCall, setIncomingCall] = useState<CallPeer | null>(null);
  const [inCall, setInCall] = useState(false);
  const [callStatus, setCallStatus] = useState<DmCallStatus>("idle");
  const pcRef = useRef<RTCPeerConnection | null>(null);
  const localStreamRef = useRef<MediaStream | null>(null);
  const remoteStreamRef = useRef<MediaStream | null>(null);
  const [localStream, setLocalStream] = useState<MediaStream | null>(null);
  const [remoteStream, setRemoteStream] = useState<MediaStream | null>(null);
  const { iceServersRef, ensureIceServers } = useIceServers(enabled);
  const pendingOfferRef = useRef<{ from: string; sdp: RTCSessionDescriptionInit } | null>(null);
  // The caller trickles ICE candidates right after its offer, long before the callee answers
  const pendingIceRef = useRef<RTCIceCandidateInit[]>([]);

  const cleanupCall = useCallback(() => {
    pcRef.current?.close();
    pcRef.current = null;
    localStreamRef.current?.getTracks().forEach((track) => track.stop());
    localStreamRef.current = null;
    remoteStreamRef.current = null;
    setLocalStream(null);
    setRemoteStream(null);
    setInCall(false);
    setCallStatus("idle");
    setCallPeer(null);
    setIncomingCall(null);
    pendingOfferRef.current = null;
    pendingIceRef.current = [];
  }, []);

  const applyRemoteDescription = useCallback(async (pc: RTCPeerConnection, sdp: RTCSessionDescriptionInit) => {
    await pc.setRemoteDescription(new RTCSessionDescription(sdp));
    for (const candidate of pendingIceRef.current.splice(0)) await pc.addIceCandidate(candidate);
  }, []);

  const createPeerConnection = useCallback(
    (peer: string) => {
      const pc = new RTCPeerConnection({ iceServers: iceServersRef.current });
      pc.onicecandidate = (event) => {
        if (event.candidate && socket) {
          socket.emit("call:ice-candidate", { to: peer, candidate: event.candidate });
        }
      };
      pc.ontrack = (event) => {
        attachRemoteTrack(event, remoteStreamRef, setRemoteStream);
      };
      pcRef.current = pc;
      return pc;
    },
    [iceServersRef, socket],
  );

  const attachLocalMedia = useCallback(async (callType: CallType) => {
    const stream = await getUserMedia({
      audio: true,
      video: callType === "video",
    });
    localStreamRef.current = stream;
    setLocalStream(stream);
    stream.getTracks().forEach((track) => pcRef.current?.addTrack(track, stream));
    return stream;
  }, []);

  const startCall = useCallback(
    async (peer: string, callType: CallType) => {
      if (!socket || peer === selfUsername || inCall) return;
      let invited = false;
      try {
        await ensureIceServers();
        setCallPeer({ username: peer, callType });
        setCallStatus("calling");
        const pc = createPeerConnection(peer);
        await attachLocalMedia(callType);
        socket.emit("call:invite", { to: peer, callType });
        invited = true;
        const offer = await pc.createOffer();
        await pc.setLocalDescription(offer);
        socket.emit("call:offer", { to: peer, sdp: offer });
        setInCall(true);
      } catch (error) {
        console.error(error);
        toastError(error, "Could not start call");
        if (invited) socket.emit("call:end", { to: peer });
        cleanupCall();
      }
    },
    [attachLocalMedia, cleanupCall, createPeerConnection, ensureIceServers, inCall, selfUsername, socket],
  );

  const acceptCall = useCallback(async () => {
    if (!socket || !incomingCall) return;
    const offer = pendingOfferRef.current;
    if (!offer || offer.from !== incomingCall.username) return;

    try {
      await ensureIceServers();
      const peer = incomingCall.username;
      setCallPeer(incomingCall);
      setIncomingCall(null);
      pendingOfferRef.current = null;

      const pc = createPeerConnection(peer);
      await attachLocalMedia(incomingCall.callType);
      await applyRemoteDescription(pc, offer.sdp);
      const answer = await pc.createAnswer();
      await pc.setLocalDescription(answer);
      socket.emit("call:answer", { to: peer, sdp: answer });
      setInCall(true);
      setCallStatus("connected");
    } catch (error) {
      console.error(error);
      toastError(error, "Could not answer call");
      socket.emit("call:reject", { to: incomingCall.username });
      cleanupCall();
    }
  }, [
    applyRemoteDescription,
    attachLocalMedia,
    cleanupCall,
    createPeerConnection,
    ensureIceServers,
    incomingCall,
    socket,
  ]);

  const rejectCall = useCallback(() => {
    if (socket && incomingCall) {
      socket.emit("call:reject", { to: incomingCall.username });
    }
    setIncomingCall(null);
    pendingOfferRef.current = null;
    pendingIceRef.current = [];
  }, [incomingCall, socket]);

  const endCall = useCallback(() => {
    if (socket && callPeer) {
      socket.emit("call:end", { to: callPeer.username });
    }
    cleanupCall();
  }, [callPeer, cleanupCall, socket]);

  useEffect(() => {
    if (!socket) return;

    const onIncoming = ({ from, callType }: { from: string; callType: CallType }) => {
      if (inCall) {
        socket.emit("call:reject", { to: from });
        return;
      }
      setIncomingCall({ username: from, callType });
    };

    const onOffer = ({ from, sdp }: { from: string; sdp: RTCSessionDescriptionInit }) => {
      pendingOfferRef.current = { from, sdp };
    };

    const onAnswer = async ({ sdp }: { sdp: RTCSessionDescriptionInit }) => {
      setCallStatus("connected");
      if (pcRef.current) await applyRemoteDescription(pcRef.current, sdp);
    };

    const onRinging = () => setCallStatus((status) => (status === "calling" ? "ringing" : status));

    const onIce = async ({ candidate }: { candidate: RTCIceCandidateInit }) => {
      if (!candidate) return;
      const pc = pcRef.current;
      if (pc?.remoteDescription) await pc.addIceCandidate(candidate);
      else pendingIceRef.current.push(candidate);
    };

    return subscribeSocket(socket, {
      "call:incoming": onIncoming,
      "call:offer": onOffer,
      "call:answer": onAnswer,
      "call:ice-candidate": onIce,
      "call:end": () => cleanupCall(),
      "call:reject": () => cleanupCall(),
      "call:ringing": onRinging,
    });
  }, [applyRemoteDescription, cleanupCall, inCall, socket]);

  // Give up on unanswered outgoing calls, like a phone would
  useEffect(() => {
    if (callStatus !== "calling" && callStatus !== "ringing") return;
    const id = window.setTimeout(endCall, NO_ANSWER_TIMEOUT_MS);
    return () => window.clearTimeout(id);
  }, [callStatus, endCall]);

  const switchCamera = useCallback(
    () => switchLocalCamera(localStreamRef, setLocalStream, pcRef.current ? [pcRef.current] : []),
    [],
  );

  return {
    callPeer,
    incomingCall,
    inCall,
    callStatus,
    switchCamera,
    localStream,
    remoteStream,
    startCall,
    acceptCall,
    rejectCall,
    endCall,
  };
};
