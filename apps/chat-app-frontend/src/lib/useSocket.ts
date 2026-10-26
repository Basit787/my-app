import { useEffect, useRef, useState } from "react";
import { io, type Socket } from "socket.io-client";
import { toast } from "sonner";
import type { ChatMessage, CallHistoryEntry, GroupCallState } from "@/features/chat/api/api";
import { GENERAL_ROOM } from "@/features/chat/api/api";
import { conversationToRoom, dmPeerFromRoom, roomToConversationId } from "@/lib/rooms";
import { messagePreview } from "@/lib/messages";
import { handleIncomingMessageReceipts, visibleChatRoom } from "@/lib/message-receipts";
import { useChatStore, type UserStatus } from "@/features/chat/store/chat-store";
import { authClient } from "@/lib/auth";
import { useAuthStore } from "@/lib/auth-store";
import { SOCKET_URL } from "@/lib/utils";

const notifyIncomingMessage = (message: ChatMessage) => {
  const username = useAuthStore.getState().username;
  if (!username || message.user === username) return;

  const { groups } = useChatStore.getState();
  if (message.room === visibleChatRoom(username)) return;

  const dmPeer = dmPeerFromRoom(message.room, username);
  const label =
    message.room === GENERAL_ROOM
      ? "General"
      : (dmPeer ?? groups.find((g) => g.room === message.room)?.name ?? "New message");
  const preview = messagePreview(message);

  toast(`${label}: ${preview}`);
};

const trackUnreadMessage = (message: ChatMessage) => {
  const username = useAuthStore.getState().username;
  if (!username || message.deleted || message.user === username) return;

  if (message.room === visibleChatRoom(username)) return;

  const { incrementUnread } = useChatStore.getState();

  incrementUnread(roomToConversationId(message.room, username));
};

const notifyIncomingGroupCall = (state: GroupCallState) => {
  const username = useAuthStore.getState().username;
  if (!username || state.participants.includes(username)) return;

  const { groups } = useChatStore.getState();
  const groupName = groups.find((g) => g.room === state.room)?.name ?? "Group";
  const callLabel = state.callType === "video" ? "video" : "audio";
  toast(`Incoming group ${callLabel} call in ${groupName}`);
};

const handleIncomingGroupCall = (state: GroupCallState) => {
  const username = useAuthStore.getState().username;
  if (!username || state.participants.includes(username)) return;

  useChatStore.getState().setIncomingGroupCall(state);
  notifyIncomingGroupCall(state);
};

const handleGroupCallState = (state: GroupCallState) => {
  const username = useAuthStore.getState().username;
  if (!username) return;

  const store = useChatStore.getState();
  if (state.participants.includes(username)) {
    if (store.incomingGroupCall?.room === state.room) {
      store.clearIncomingGroupCall(state.room);
    }
    return;
  }

  store.setIncomingGroupCall(state);
};

const handleGroupCallEnded = ({ room }: { room: string }) => {
  useChatStore.getState().clearIncomingGroupCall(room);
};

export const useSocket = (): Socket | null => {
  const username = useAuthStore((s) => s.username);
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  const activeConversationId = useChatStore((s) => s.activeConversationId);
  const addMessage = useChatStore((s) => s.addMessage);
  const addCallHistory = useChatStore((s) => s.addCallHistory);
  const markMessageDeleted = useChatStore((s) => s.markMessageDeleted);
  const setOnlineUsers = useChatStore((s) => s.setOnlineUsers);
  const mergeUserStatuses = useChatStore((s) => s.mergeUserStatuses);
  const setTypingUser = useChatStore((s) => s.setTypingUser);
  const setMessageStatus = useChatStore((s) => s.setMessageStatus);
  const [socket, setSocket] = useState<Socket | null>(null);
  const joinedDmRoom = useRef<string | null>(null);

  useEffect(() => {
    if (!isAuthenticated || !username) {
      setSocket(null);
      return;
    }

    // Each (re)connect sends the current token in the handshake
    const s = io(SOCKET_URL || undefined, {
      auth: (cb) => cb({ token: authClient.getToken() }),
    });
    setSocket(s);

    s.on("message", (message: ChatMessage) => {
      addMessage(message);
      handleIncomingMessageReceipts(s, message);
      trackUnreadMessage(message);
      notifyIncomingMessage(message);
    });
    s.on("message:status", ({ messageId, status }: { messageId: string; status: "delivered" | "read" }) => {
      setMessageStatus(messageId, status);
    });
    s.on("message_deleted", (message: ChatMessage) => markMessageDeleted(message));
    s.on("call:history", (call: CallHistoryEntry) => addCallHistory(call));
    s.on("presence", (p: { room?: string; count: number; users: string[]; statuses?: Record<string, string> }) => {
      if (!p.room || p.room === GENERAL_ROOM) {
        setOnlineUsers(p.users ?? []);
        if (p.statuses) mergeUserStatuses(p.statuses as Record<string, UserStatus>);
      }
    });
    s.on("typing", (p: { room: string; username: string }) => {
      setTypingUser(p.room, p.username);
      setTimeout(() => setTypingUser(p.room, null), 1500);
    });
    s.on("group-call:incoming", handleIncomingGroupCall);
    s.on("group-call:state", handleGroupCallState);
    s.on("group-call:ended", handleGroupCallEnded);

    return () => {
      s.off("group-call:incoming", handleIncomingGroupCall);
      s.off("group-call:state", handleGroupCallState);
      s.off("group-call:ended", handleGroupCallEnded);
      s.disconnect();
      setSocket(null);
      joinedDmRoom.current = null;
    };
  }, [
    addCallHistory,
    addMessage,
    isAuthenticated,
    markMessageDeleted,
    mergeUserStatuses,
    setMessageStatus,
    setOnlineUsers,
    setTypingUser,
    username,
  ]);

  useEffect(() => {
    if (!socket || !username) return;

    const activeRoom = conversationToRoom(activeConversationId, username);
    if (activeRoom === GENERAL_ROOM) {
      if (joinedDmRoom.current) {
        socket.emit("room:leave", { room: joinedDmRoom.current });
        joinedDmRoom.current = null;
      }
      return;
    }

    if (joinedDmRoom.current && joinedDmRoom.current !== activeRoom) {
      socket.emit("room:leave", { room: joinedDmRoom.current });
    }

    socket.emit("room:join", { room: activeRoom });
    joinedDmRoom.current = activeRoom;
  }, [activeConversationId, socket, username]);

  return socket;
};
