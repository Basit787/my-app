import type { StateCreator } from "zustand";
import type { ChatState } from "@/features/chat/store/chat-types";

export type ChatComposeSlice = Pick<ChatState, "setReplyTo" | "setForwardMessage" | "setForwardBatch" | "forwardBatch">;

export const createChatComposeSlice: StateCreator<ChatState, [], [], ChatComposeSlice> = (set) => ({
  forwardBatch: [],
  setReplyTo: (message) => set({ replyTo: message, forwardMessage: null, forwardBatch: [] }),
  setForwardMessage: (message) =>
    set({ forwardMessage: message, replyTo: null, forwardBatch: message ? [message] : [] }),
  setForwardBatch: (messages) => set({ forwardBatch: messages, forwardMessage: messages[0] ?? null, replyTo: null }),
});
