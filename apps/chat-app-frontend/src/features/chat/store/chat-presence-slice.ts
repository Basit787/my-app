import type { StateCreator } from "zustand";
import type { ChatState } from "@/features/chat/store/chat-types";

export type ChatPresenceSlice = Pick<ChatState, "setOnlineUsers" | "mergeUserStatuses">;

export const createChatPresenceSlice: StateCreator<ChatState, [], [], ChatPresenceSlice> = (set) => ({
  setOnlineUsers: (users) => set({ onlineUsers: users }),
  mergeUserStatuses: (statuses) =>
    set((s) => ({
      userStatuses: { ...s.userStatuses, ...statuses },
    })),
});
