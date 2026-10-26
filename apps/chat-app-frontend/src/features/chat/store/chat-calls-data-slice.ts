import type { StateCreator } from "zustand";
import type { ChatState } from "@/features/chat/store/chat-types";

export type ChatCallsDataSlice = Pick<ChatState, "setCallHistory" | "mergeCallHistory">;

export const createChatCallsDataSlice: StateCreator<ChatState, [], [], ChatCallsDataSlice> = (set) => ({
  setCallHistory: (calls) => set({ callHistory: calls }),
  mergeCallHistory: (calls) =>
    set((s) => {
      const byId = new Map(s.callHistory.map((c) => [c.id, c]));
      calls.forEach((c) => byId.set(c.id, c));
      return { callHistory: [...byId.values()].sort((a, b) => b.startedAt.localeCompare(a.startedAt)) };
    }),
});
