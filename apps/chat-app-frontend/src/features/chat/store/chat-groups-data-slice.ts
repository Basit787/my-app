import type { StateCreator } from "zustand";
import type { ChatState } from "@/features/chat/store/chat-types";

export type ChatGroupsDataSlice = Pick<ChatState, "setGroups" | "setKnownContacts">;

export const createChatGroupsDataSlice: StateCreator<ChatState, [], [], ChatGroupsDataSlice> = (set) => ({
  setGroups: (groups) => set({ groups }),
  setKnownContacts: (contacts) => set({ knownContacts: contacts }),
});
