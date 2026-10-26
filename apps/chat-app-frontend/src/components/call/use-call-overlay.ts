import { useEffect, useState } from "react";
import { useCallTimer, useDraggablePanel, useMediaQuery, MOBILE_LAYOUT_QUERY } from "frontend-common";
import { useIncomingCallAlerts } from "@/lib/useIncomingCallAlerts";
import { startRingback } from "@/lib/call-sounds";
import { useChatRoom } from "@/features/chat/context/use-chat-room";
import { useChatStore } from "@/features/chat/store/chat-store";

const MINIMIZED_WIDTH = 288;
const MINIMIZED_HEIGHT = 72;
const AUDIO_WIDTH = 360;
const AUDIO_HEIGHT = 520;
const VIDEO_WIDTH = 640;
const VIDEO_HEIGHT = 540;
// Height of the "return to call" bar shown on phones while the call is minimized
export const MOBILE_CALL_BAR_HEIGHT = "40px";

const RINGING_LABELS: Record<string, string> = { calling: "Calling…", ringing: "Ringing…" };

// Everything the call overlay shows: which call (1:1 or group, incoming or active), its title/status,
// mute/camera state and the panel size; also plays the ringback and raises incoming-call alerts
export const useCallOverlay = () => {
  const { username: selfUsername, remoteParticipants, dmCall, groupCall, actions } = useChatRoom();
  const groups = useChatStore((s) => s.groups);
  const isMobile = useMediaQuery(MOBILE_LAYOUT_QUERY);

  const dmIncoming = dmCall.incomingCall;
  const dmInCall = dmCall.inCall;
  const groupIncoming = groupCall.roomCall;
  const groupInCall = groupCall.inGroupCall;

  // An active call hides incoming ones; a 1:1 invite wins over a group one
  const inActiveCall = dmInCall || groupInCall;
  const showDmIncoming = !!dmIncoming && !inActiveCall;
  const showGroupIncoming = !!groupIncoming && !inActiveCall && !dmIncoming;
  const isGroupCall = groupInCall || showGroupIncoming;
  const visible = showDmIncoming || showGroupIncoming || inActiveCall;

  const groupRoom = groupInCall ? groupCall.activeRoom : groupIncoming?.room;
  const group = groups.find((g) => g.room === groupRoom);
  const groupLabel = group?.name ?? "Group call";

  const callPeer = dmCall.callPeer;
  const localStream = groupInCall ? groupCall.localStream : dmCall.localStream;
  const remoteStream = dmCall.remoteStream;
  const groupCallType = groupInCall ? groupCall.callType : (groupIncoming?.callType ?? "audio");
  const dmStatus = dmCall.callStatus;
  const connected = groupInCall || (dmInCall && dmStatus === "connected");
  const outgoingRinging = dmInCall && (dmStatus === "calling" || dmStatus === "ringing");

  const [minimized, setMinimized] = useState(false);
  const [micMuted, setMicMuted] = useState(false);
  const [cameraOff, setCameraOff] = useState(false);
  const { label: durationLabel } = useCallTimer(connected);

  const isVideo = (isGroupCall ? groupCallType : (callPeer?.callType ?? dmIncoming?.callType)) === "video";

  const panelWidth = minimized ? MINIMIZED_WIDTH : isVideo ? VIDEO_WIDTH : AUDIO_WIDTH;
  const panelHeight = minimized ? MINIMIZED_HEIGHT : isVideo ? VIDEO_HEIGHT : AUDIO_HEIGHT;
  const panel = useDraggablePanel({ enabled: visible && !isMobile, panelWidth, panelHeight });

  const alertTitle = showDmIncoming
    ? `Call from ${dmIncoming?.username ?? "someone"}`
    : showGroupIncoming
      ? `Group call in ${groupLabel}`
      : "";
  const alertBody = showDmIncoming
    ? `Incoming ${dmIncoming?.callType === "video" ? "video" : "voice"} call`
    : showGroupIncoming
      ? `Started by ${groupIncoming?.host ?? "someone"}`
      : "";
  useIncomingCallAlerts(showDmIncoming || showGroupIncoming, alertTitle, alertBody);

  useEffect(() => {
    if (outgoingRinging) return startRingback();
  }, [outgoingRinging]);

  useEffect(() => {
    if (!visible) setMinimized(false);
  }, [visible]);

  useEffect(() => {
    if (inActiveCall) return;
    setMicMuted(false);
    setCameraOff(false);
  }, [inActiveCall]);

  // Re-applied whenever the stream changes (e.g. after switching camera)
  useEffect(() => {
    localStream?.getAudioTracks().forEach((track) => (track.enabled = !micMuted));
    localStream?.getVideoTracks().forEach((track) => (track.enabled = !cameraOff));
  }, [localStream, micMuted, cameraOff]);

  // On phones a minimized call becomes a bar above the app; reserve room for it so it doesn't cover the header
  const showMobileBar = visible && isMobile && minimized && inActiveCall;
  useEffect(() => {
    document.documentElement.style.setProperty("--call-bar-h", showMobileBar ? MOBILE_CALL_BAR_HEIGHT : "0px");
    return () => document.documentElement.style.setProperty("--call-bar-h", "0px");
  }, [showMobileBar]);

  const title = isGroupCall ? groupLabel : (callPeer?.username ?? dmIncoming?.username ?? "");
  const callKind = isVideo ? "video" : "voice";
  const status = showDmIncoming
    ? `Incoming ${callKind} call`
    : showGroupIncoming
      ? `Group ${callKind} call · ${groupIncoming?.participants.length ?? 0} in call`
      : outgoingRinging
        ? RINGING_LABELS[dmStatus]
        : durationLabel;

  return {
    selfUsername,
    remoteParticipants,
    dmCall,
    groupCall,
    actions,
    isMobile,
    visible,
    inActiveCall,
    isGroupCall,
    isVideo,
    connected,
    showDmIncoming,
    showGroupIncoming,
    showMobileBar,
    group,
    title,
    status,
    localStream,
    remoteStream,
    minimized,
    setMinimized,
    micMuted,
    setMicMuted,
    cameraOff,
    setCameraOff,
    panel,
    panelWidth,
    panelHeight,
  };
};
