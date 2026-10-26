import type { StateCreator } from "zustand";
import type { ChatState } from "@/features/chat/store/chat-types";

export type ChatMessagesDeleteSlice = Pick<ChatState, "markMessageDeleted" | "restoreMessage">;

export const createChatMessagesDeleteSlice: StateCreator<ChatState, [], [], ChatMessagesDeleteSlice> = (set) => ({
  markMessageDeleted: (message) =>
    set((s) => ({
      messages: s.messages.map((m) =>
        m.id === message.id ? { ...m, ...message, deleted: true, text: "", file: undefined, type: "text" as const } : m,
      ),
    })),
  restoreMessage: (message) =>
    set((s) => ({
      messages: s.messages.map((m) => (m.id === message.id ? message : m)),
    })),
});
