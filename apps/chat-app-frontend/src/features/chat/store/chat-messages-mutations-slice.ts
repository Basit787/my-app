import { messageKey } from "@/lib/messages";
import { normalizeDmRoom } from "@/lib/rooms";
import type { StateCreator } from "zustand";
import type { ChatState } from "@/features/chat/store/chat-types";
import type { ChatMessage } from "@/features/chat/api/api";

const withCanonicalRoom = (message: ChatMessage): ChatMessage => {
  const canonical = normalizeDmRoom(message.room);
  return canonical ? { ...message, room: canonical } : message;
};

export type ChatMessagesMutationsSlice = Pick<ChatState, "addMessage" | "removeMessage">;

export const createChatMessagesMutationsSlice: StateCreator<ChatState, [], [], ChatMessagesMutationsSlice> = (set) => ({
  addMessage: (message) =>
    set((s) => {
      const normalized = withCanonicalRoom(message);
      const key = messageKey(normalized);
      if (s.messages.some((m) => messageKey(m) === key)) {
        return s;
      }
      return { messages: [...s.messages, normalized].sort((a, b) => a.at.localeCompare(b.at)) };
    }),
  removeMessage: (id) =>
    set((s) => ({
      messages: s.messages.filter((m) => m.id !== id),
    })),
});
