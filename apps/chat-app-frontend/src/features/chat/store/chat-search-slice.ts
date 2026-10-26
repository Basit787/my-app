import type { StateCreator } from "zustand";
import type { ChatState } from "@/features/chat/store/chat-types";

export type ChatSearchSlice = Pick<ChatState, "setSearchQuery" | "setTypingUser">;

export const createChatSearchSlice: StateCreator<ChatState, [], [], ChatSearchSlice> = (set) => ({
  setSearchQuery: (query) => set({ searchQuery: query }),
  setTypingUser: (room, user) => set({ typingRoom: room, typingUser: user }),
});
