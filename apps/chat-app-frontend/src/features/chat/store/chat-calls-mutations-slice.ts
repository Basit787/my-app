import type { StateCreator } from "zustand";
import type { ChatState } from "@/features/chat/store/chat-types";

export type ChatCallsMutationsSlice = Pick<ChatState, "addCallHistory">;

export const createChatCallsMutationsSlice: StateCreator<ChatState, [], [], ChatCallsMutationsSlice> = (set) => ({
  addCallHistory: (call) =>
    set((s) => {
      if (s.callHistory.some((c) => c.id === call.id)) return s;
      return { callHistory: [call, ...s.callHistory].sort((a, b) => b.startedAt.localeCompare(a.startedAt)) };
    }),
});
