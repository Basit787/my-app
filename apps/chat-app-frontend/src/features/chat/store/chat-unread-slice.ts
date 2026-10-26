import type { StateCreator } from "zustand";
import type { ChatState } from "@/features/chat/store/chat-types";

export type ChatUnreadSlice = Pick<ChatState, "unreadByConversation" | "incrementUnread" | "clearUnread">;

export const createChatUnreadSlice: StateCreator<ChatState, [], [], ChatUnreadSlice> = (set) => ({
  unreadByConversation: {},
  incrementUnread: (conversationId) =>
    set((s) => ({
      unreadByConversation: {
        ...s.unreadByConversation,
        [conversationId]: (s.unreadByConversation[conversationId] ?? 0) + 1,
      },
    })),
  clearUnread: (conversationId) =>
    set((s) => {
      if (!s.unreadByConversation[conversationId]) return s;
      const rest = { ...s.unreadByConversation };
      delete rest[conversationId];
      return { unreadByConversation: rest };
    }),
});
