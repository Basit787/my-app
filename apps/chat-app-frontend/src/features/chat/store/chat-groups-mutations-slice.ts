import type { StateCreator } from "zustand";
import type { ChatState } from "@/features/chat/store/chat-types";

export type ChatGroupsMutationsSlice = Pick<ChatState, "addGroup" | "updateGroup">;

export const createChatGroupsMutationsSlice: StateCreator<ChatState, [], [], ChatGroupsMutationsSlice> = (set) => ({
  addGroup: (group) =>
    set((s) => {
      if (s.groups.some((g) => g.id === group.id)) return s;
      return { groups: [group, ...s.groups] };
    }),
  updateGroup: (group) =>
    set((s) => ({
      groups: s.groups.map((g) => (g.id === group.id ? group : g)),
    })),
});
