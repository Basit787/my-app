import { useCallback, useEffect, useMemo, useRef, useState, type ReactNode } from "react";
import { useChat } from "@/features/chat/api/hooks";
import { useSocket } from "@/lib/useSocket";
import { useReadReceipts } from "@/lib/message-receipts";
import { useWebRTC } from "@/lib/useWebRTC";
import { useGroupWebRTC } from "@/lib/useGroupWebRTC";
import { conversationToRoom, isDmConversation, isGroupRoom } from "@/lib/rooms";
import { callsForConversation, messagesForConversation, useChatStore } from "@/features/chat/store/chat-store";
import { useAuthStore } from "@/lib/auth-store";
import {
  ChatRoomContext,
  type ChatRoomActions,
  type ChatRoomContextValue,
} from "@/features/chat/context/use-chat-room";

export const ChatRoomProvider = ({ children }: { children: ReactNode }) => {
  const username = useAuthStore((s) => s.username);
  const messages = useChatStore((s) => s.messages);
  const callHistory = useChatStore((s) => s.callHistory);
  const groups = useChatStore((s) => s.groups);
  const hiddenMessageIds = useChatStore((s) => s.hiddenMessageIds);
  const activeConversationId = useChatStore((s) => s.activeConversationId);
  const setActiveConversation = useChatStore((s) => s.setActiveConversation);

  const room = conversationToRoom(activeConversationId, username);
  const isDm = isDmConversation(activeConversationId);
  const isCustomGroup = isGroupRoom(activeConversationId);
  const isGroup = isCustomGroup;

  useChat();
  const socket = useSocket();
  const dmCall = useWebRTC({ socket, selfUsername: username, enabled: !!socket });
  const groupCall = useGroupWebRTC({ socket, selfUsername: username, enabled: !!socket });

  const bottomRef = useRef<HTMLDivElement>(null);
  const prevConversationRef = useRef(activeConversationId);
  const [groupInfoOpen, setGroupInfoOpen] = useState(false);
  const [contactInfoUser, setContactInfoUser] = useState<string | null>(null);

  const visibleMessages = useMemo(
    () => messagesForConversation(messages, activeConversationId, username, hiddenMessageIds),
    [messages, activeConversationId, username, hiddenMessageIds],
  );

  useReadReceipts(socket, room, visibleMessages, username);

  const visibleCalls = useMemo(
    () => callsForConversation(callHistory, activeConversationId, username),
    [callHistory, activeConversationId, username],
  );

  const callPeer = isDm ? activeConversationId : null;
  const inCall = dmCall.inCall || groupCall.inGroupCall;

  const remoteParticipants = useMemo(
    () =>
      [...groupCall.remoteStreams.entries()].map(([name, stream]) => ({
        username: name,
        stream,
      })),
    [groupCall.remoteStreams],
  );

  const activeGroup = groups.find((g) => g.room === activeConversationId);
  const groupLabel = activeConversationId === "general" ? "# General" : (activeGroup?.name ?? activeConversationId);
  const showGroupInfo = isGroupRoom(activeConversationId) && !!activeGroup;

  const startAudioCall = useCallback(() => {
    if (isDm && callPeer) {
      dmCall.startCall(callPeer, "audio");
      return;
    }
    if (!isCustomGroup) return;
    if (groupCall.roomCall) {
      groupCall.joinGroupCall(room);
      return;
    }
    groupCall.startGroupCall(room, "audio");
  }, [callPeer, dmCall, groupCall, isCustomGroup, isDm, room]);

  const startVideoCall = useCallback(() => {
    if (isDm && callPeer) {
      dmCall.startCall(callPeer, "video");
      return;
    }
    if (!isCustomGroup) return;
    if (groupCall.roomCall) {
      groupCall.joinGroupCall(room);
      return;
    }
    groupCall.startGroupCall(room, "video");
  }, [callPeer, dmCall, groupCall, isCustomGroup, isDm, room]);

  const endCall = useCallback(() => {
    if (dmCall.inCall) dmCall.endCall();
    if (groupCall.inGroupCall) groupCall.leaveGroupCall();
  }, [dmCall, groupCall]);

  const acceptIncomingDmCall = useCallback(() => {
    const peer = dmCall.incomingCall?.username;
    if (peer) setActiveConversation(peer);
    void dmCall.acceptCall();
  }, [dmCall, setActiveConversation]);

  const acceptIncomingGroupCall = useCallback(() => {
    const callRoom = groupCall.roomCall?.room;
    if (!callRoom) return;
    const group = groups.find((g) => g.room === callRoom);
    if (group) setActiveConversation(group.room);
    groupCall.joinGroupCall(callRoom);
  }, [groupCall, groups, setActiveConversation]);

  const openGroupInfo = useCallback(() => setGroupInfoOpen(true), []);
  const closeGroupInfo = useCallback(() => setGroupInfoOpen(false), []);
  const openContactInfo = useCallback(
    (user?: string) => {
      const target = user ?? (isDm ? activeConversationId : null);
      if (target && target !== username) setContactInfoUser(target);
    },
    [activeConversationId, isDm, username],
  );
  const closeContactInfo = useCallback(() => setContactInfoUser(null), []);

  const actions = useMemo<ChatRoomActions>(
    () => ({
      startAudioCall,
      startVideoCall,
      endCall,
      acceptIncomingDmCall,
      acceptIncomingGroupCall,
      openGroupInfo,
      closeGroupInfo,
      openContactInfo,
      closeContactInfo,
    }),
    [
      startAudioCall,
      startVideoCall,
      endCall,
      acceptIncomingDmCall,
      acceptIncomingGroupCall,
      openGroupInfo,
      closeGroupInfo,
      openContactInfo,
      closeContactInfo,
    ],
  );

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [visibleMessages.length, visibleCalls.length]);

  // Calls keep running while you browse other chats (the call UI stays up / minimized)
  useEffect(() => {
    const prev = prevConversationRef.current;
    prevConversationRef.current = activeConversationId;
    if (prev === activeConversationId) return;
    setGroupInfoOpen(false);
    setContactInfoUser(null);
  }, [activeConversationId]);

  const value = useMemo<ChatRoomContextValue>(
    () => ({
      username,
      socket,
      room,
      activeConversationId,
      isDm,
      isGroup,
      inCall,
      groupLabel,
      activeGroup,
      showGroupInfo,
      groupInfoOpen,
      contactInfoUser,
      visibleMessages,
      visibleCalls,
      remoteParticipants,
      dmCall,
      groupCall,
      actions,
      bottomRef,
    }),
    [
      username,
      socket,
      room,
      activeConversationId,
      isDm,
      isGroup,
      inCall,
      groupLabel,
      activeGroup,
      showGroupInfo,
      groupInfoOpen,
      contactInfoUser,
      visibleMessages,
      visibleCalls,
      remoteParticipants,
      dmCall,
      groupCall,
      actions,
    ],
  );

  return <ChatRoomContext.Provider value={value}>{children}</ChatRoomContext.Provider>;
};
