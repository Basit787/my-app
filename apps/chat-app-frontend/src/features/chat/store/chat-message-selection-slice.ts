import type { StateCreator } from "zustand";
import type { ChatState } from "@/features/chat/store/chat-types";

export type ChatMessageSelectionSlice = Pick<
  ChatState,
  | "messageSelectionMode"
  | "selectedMessageKeys"
  | "enterMessageSelection"
  | "exitMessageSelection"
  | "toggleMessageKey"
  | "setSelectedMessageKeys"
>;

export const createChatMessageSelectionSlice: StateCreator<ChatState, [], [], ChatMessageSelectionSlice> = (set) => ({
  messageSelectionMode: false,
  selectedMessageKeys: [],
  enterMessageSelection: (key) =>
    set({
      messageSelectionMode: true,
      selectedMessageKeys: key ? [key] : [],
    }),
  exitMessageSelection: () =>
    set({
      messageSelectionMode: false,
      selectedMessageKeys: [],
    }),
  toggleMessageKey: (key) =>
    set((s) => {
      const selected = new Set(s.selectedMessageKeys);
      if (selected.has(key)) selected.delete(key);
      else selected.add(key);
      return { selectedMessageKeys: [...selected] };
    }),
  setSelectedMessageKeys: (keys) => set({ selectedMessageKeys: keys }),
});
