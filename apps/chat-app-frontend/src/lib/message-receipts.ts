import { useEffect, useMemo, useRef } from "react";
import type { Socket } from "socket.io-client";
import type { ChatMessage, MessageDeliveryStatus } from "@/features/chat/api/api";
import { conversationToRoom } from "@/lib/rooms";
import { isMobileLayout, MOBILE_LAYOUT_QUERY, useMediaQuery, usePageVisible } from "frontend-common";
import { useAuthStore } from "@/lib/auth-store";
import { useChatStore } from "@/features/chat/store/chat-store";
import { furthestStatus } from "@/features/chat/store/chat-message-status-slice";

/** The furthest-along of the status loaded with the message and any live update since. */
export const resolveDeliveryStatus = (message: ChatMessage, live: MessageDeliveryStatus | undefined) =>
  furthestStatus(message.status ?? "sent", live ?? "sent");

/** On phones the chat pane is hidden while the conversation list is showing. */
const isChatPaneShown = (isMobile: boolean, mobileChatOpen: boolean) => !isMobile || mobileChatOpen;

/** Room the user is looking at, or null when the phone layout is showing the conversation list. */
export const visibleChatRoom = (username: string): string | null => {
  const { activeConversationId, mobileChatOpen } = useChatStore.getState();
  return isChatPaneShown(isMobileLayout(), mobileChatOpen) ? conversationToRoom(activeConversationId, username) : null;
};

export const handleIncomingMessageReceipts = (socket: Socket, message: ChatMessage) => {
  const username = useAuthStore.getState().username;
  if (!username || !message.id) return;

  if (message.user === username) {
    useChatStore.getState().setMessageStatus(message.id, "sent");
    return;
  }

  socket.emit("message:ack", { messageId: message.id, room: message.room });
};

/**
 * Sends a read receipt for the open conversation's newest peer message once it is actually on screen
 * (chat pane visible and the tab in the foreground).
 */
export const useReadReceipts = (socket: Socket | null, room: string, messages: ChatMessage[], username: string) => {
  const mobileChatOpen = useChatStore((s) => s.mobileChatOpen);
  const isMobile = useMediaQuery(MOBILE_LAYOUT_QUERY);
  const pageVisible = usePageVisible();
  const onScreen = pageVisible && isChatPaneShown(isMobile, mobileChatOpen);
  const lastSentRef = useRef<string | null>(null);

  const latestId = useMemo(() => {
    for (let i = messages.length - 1; i >= 0; i--) {
      const m = messages[i];
      if (m.user !== username && m.id && !m.deleted) return m.id;
    }
    return undefined;
  }, [messages, username]);

  useEffect(() => {
    if (!socket || !latestId || !onScreen || lastSentRef.current === latestId) return;
    lastSentRef.current = latestId;
    socket.emit("room:read", { room, messageId: latestId });
  }, [latestId, onScreen, room, socket]);
};
