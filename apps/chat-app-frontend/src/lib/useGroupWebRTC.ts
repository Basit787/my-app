import { useCallback, useEffect, useRef, useState } from "react";
import type { Socket } from "socket.io-client";
import type { CallType, GroupCallState } from "@/features/chat/api/api";
import { useChatStore } from "@/features/chat/store/chat-store";
import { getUserMedia, switchCamera as switchLocalCamera } from "@/lib/media";
import { toastError } from "@/lib/toast";
import { subscribeSocket } from "@/lib/webrtc/subscribe-socket";
import { useIceServers } from "@/lib/webrtc/use-ice-servers";
import { useLatestRef } from "@/lib/webrtc/use-latest-ref";

type UseGroupWebRTCOptions = {
  socket: Socket | null;
  selfUsername: string;
  enabled: boolean;
};

export type { GroupCallState };

// Group call: a mesh where every participant keeps one peer connection per other participant
export const useGroupWebRTC = ({ socket, selfUsername, enabled }: UseGroupWebRTCOptions) => {
  const roomCall = useChatStore((s) => s.incomingGroupCall);
  const clearIncomingGroupCall = useChatStore((s) => s.clearIncomingGroupCall);
  const dismissIncomingGroupCall = useChatStore((s) => s.dismissIncomingGroupCall);

  const [inGroupCall, setInGroupCall] = useState(false);
  const [activeRoom, setActiveRoom] = useState<string | null>(null);
  const [callType, setCallType] = useState<CallType>("audio");
  const [participants, setParticipants] = useState<string[]>([]);
  const [localStream, setLocalStream] = useState<MediaStream | null>(null);
  const [remoteStreams, setRemoteStreams] = useState<Map<string, MediaStream>>(new Map());

  const { iceServersRef, ensureIceServers } = useIceServers(enabled);
  const localStreamRef = useRef<MediaStream | null>(null);
  const pcsRef = useRef<Map<string, RTCPeerConnection>>(new Map());
  // Latest values for the socket handlers below
  const activeRoomRef = useLatestRef(activeRoom);
  const inGroupCallRef = useLatestRef(inGroupCall);
  const participantsRef = useLatestRef(participants);

  const cleanupPeer = useCallback((peer: string) => {
    pcsRef.current.get(peer)?.close();
    pcsRef.current.delete(peer);
    setRemoteStreams((prev) => {
      const next = new Map(prev);
      next.delete(peer);
      return next;
    });
  }, []);

  const cleanupAll = useCallback(() => {
    for (const peer of [...pcsRef.current.keys()]) cleanupPeer(peer);
    localStreamRef.current?.getTracks().forEach((track) => track.stop());
    localStreamRef.current = null;
    setLocalStream(null);
    setRemoteStreams(new Map());
    setInGroupCall(false);
    setActiveRoom(null);
    setParticipants([]);
  }, [cleanupPeer]);

  const attachLocalMedia = useCallback(async (type: CallType) => {
    const stream = await getUserMedia({
      audio: true,
      video: type === "video",
    });
    localStreamRef.current = stream;
    setLocalStream(stream);
    for (const pc of pcsRef.current.values()) {
      stream.getTracks().forEach((track) => pc.addTrack(track, stream));
    }
    return stream;
  }, []);

  const createPeerConnection = useCallback(
    (peer: string, callRoom: string) => {
      let pc = pcsRef.current.get(peer);
      if (pc) return pc;

      pc = new RTCPeerConnection({ iceServers: iceServersRef.current });
      pc.onicecandidate = (event) => {
        if (event.candidate && socket) {
          socket.emit("group-call:ice-candidate", {
            room: callRoom,
            to: peer,
            candidate: event.candidate,
          });
        }
      };
      pc.ontrack = (event) => {
        const track = event.track;
        if (!track) return;
        setRemoteStreams((prev) => {
          const next = new Map(prev);
          const existing = next.get(peer);
          const stream = existing ? new MediaStream(existing.getTracks()) : new MediaStream();
          if (!stream.getTracks().some((t) => t.id === track.id)) {
            stream.addTrack(track);
          }
          next.set(peer, stream);
          return next;
        });
      };

      localStreamRef.current?.getTracks().forEach((track) => {
        if (localStreamRef.current) pc!.addTrack(track, localStreamRef.current);
      });

      pcsRef.current.set(peer, pc);
      return pc;
    },
    [iceServersRef, socket],
  );

  const connectToPeers = useCallback(
    async (callRoom: string, peers: string[]) => {
      if (!socket) return;
      for (const peer of peers) {
        if (peer === selfUsername || pcsRef.current.has(peer)) continue;
        const pc = createPeerConnection(peer, callRoom);
        const offer = await pc.createOffer();
        await pc.setLocalDescription(offer);
        socket.emit("group-call:offer", { room: callRoom, to: peer, sdp: offer });
      }
    },
    [createPeerConnection, selfUsername, socket],
  );

  const enterCall = useCallback(
    async (state: GroupCallState) => {
      await ensureIceServers();
      clearIncomingGroupCall(state.room);
      setActiveRoom(state.room);
      setCallType(state.callType);
      setParticipants(state.participants);
      setInGroupCall(true);

      if (!localStreamRef.current) {
        await attachLocalMedia(state.callType);
      }

      const existing = new Set(participantsRef.current);
      const peersToConnect = state.participants.filter((p) => p !== selfUsername && !existing.has(p));
      await connectToPeers(state.room, peersToConnect);
    },
    [attachLocalMedia, clearIncomingGroupCall, connectToPeers, ensureIceServers, participantsRef, selfUsername],
  );

  const startGroupCall = useCallback(
    async (callRoom: string, type: CallType) => {
      if (!socket || inGroupCallRef.current) return;
      try {
        await ensureIceServers();
        clearIncomingGroupCall(callRoom);
        setCallType(type);
        setActiveRoom(callRoom);
        setInGroupCall(true);
        setParticipants([selfUsername]);
        await attachLocalMedia(type);
        socket.emit("group-call:start", { room: callRoom, callType: type });
      } catch (error) {
        console.error(error);
        toastError(error, "Could not start call");
        cleanupAll();
      }
    },
    [attachLocalMedia, cleanupAll, clearIncomingGroupCall, ensureIceServers, inGroupCallRef, selfUsername, socket],
  );

  const joinGroupCall = useCallback(
    (callRoom: string) => {
      if (!socket || inGroupCallRef.current) return;
      clearIncomingGroupCall(callRoom);
      socket.emit("group-call:join", { room: callRoom });
    },
    [clearIncomingGroupCall, inGroupCallRef, socket],
  );

  const leaveGroupCall = useCallback(() => {
    if (socket && activeRoomRef.current) {
      socket.emit("group-call:leave", { room: activeRoomRef.current });
    }
    cleanupAll();
  }, [activeRoomRef, cleanupAll, socket]);

  const dismissIncoming = useCallback(() => {
    if (roomCall) dismissIncomingGroupCall(roomCall.room);
  }, [dismissIncomingGroupCall, roomCall]);

  useEffect(() => {
    if (!socket) return;

    const onState = (state: GroupCallState) => {
      if (!inGroupCallRef.current) {
        if (state.participants.includes(selfUsername)) {
          enterCall(state).catch((error) => {
            console.error(error);
            toastError(error, "Could not join call");
            socket.emit("group-call:leave", { room: state.room });
            cleanupAll();
          });
        }
        return;
      }

      if (state.room !== activeRoomRef.current) return;

      const previous = participantsRef.current;
      setParticipants(state.participants);
      setCallType(state.callType);

      const newPeers = state.participants.filter((p) => p !== selfUsername && !previous.includes(p));
      if (newPeers.length > 0) void connectToPeers(state.room, newPeers);

      for (const peer of previous) {
        if (!state.participants.includes(peer)) cleanupPeer(peer);
      }
    };

    const onEnded = ({ room: endedRoom }: { room: string }) => {
      if (endedRoom === activeRoomRef.current) cleanupAll();
    };

    const onOffer = async ({
      from,
      room: offerRoom,
      sdp,
    }: {
      from: string;
      room: string;
      sdp: RTCSessionDescriptionInit;
    }) => {
      if (!inGroupCallRef.current || offerRoom !== activeRoomRef.current) return;
      const pc = createPeerConnection(from, offerRoom);
      await pc.setRemoteDescription(new RTCSessionDescription(sdp));
      const answer = await pc.createAnswer();
      await pc.setLocalDescription(answer);
      socket.emit("group-call:answer", { room: offerRoom, to: from, sdp: answer });
    };

    const onAnswer = async ({ from, sdp }: { from: string; sdp: RTCSessionDescriptionInit }) => {
      const pc = pcsRef.current.get(from);
      if (!pc) return;
      await pc.setRemoteDescription(new RTCSessionDescription(sdp));
    };

    const onIce = async ({ from, candidate }: { from: string; candidate: RTCIceCandidateInit }) => {
      const pc = pcsRef.current.get(from);
      if (!pc || !candidate) return;
      await pc.addIceCandidate(new RTCIceCandidate(candidate));
    };

    return subscribeSocket(socket, {
      "group-call:state": onState,
      "group-call:ended": onEnded,
      "group-call:offer": onOffer,
      "group-call:answer": onAnswer,
      "group-call:ice-candidate": onIce,
    });
  }, [
    activeRoomRef,
    cleanupAll,
    cleanupPeer,
    connectToPeers,
    createPeerConnection,
    enterCall,
    inGroupCallRef,
    participantsRef,
    selfUsername,
    socket,
  ]);

  const switchCamera = useCallback(
    () => switchLocalCamera(localStreamRef, setLocalStream, pcsRef.current.values()),
    [],
  );

  return {
    switchCamera,
    inGroupCall,
    activeRoom,
    callType,
    participants,
    roomCall,
    localStream,
    remoteStreams,
    startGroupCall,
    joinGroupCall,
    leaveGroupCall,
    dismissIncoming,
  };
};
