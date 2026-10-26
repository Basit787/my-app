import type { StateCreator } from "zustand";
import type { ChatState } from "@/features/chat/store/chat-types";

export type ChatUserStatusSlice = Pick<ChatState, "setUserStatus">;

export const createChatUserStatusSlice: StateCreator<ChatState, [], [], ChatUserStatusSlice> = (set) => ({
  setUserStatus: (status) => set({ userStatus: status }),
});
