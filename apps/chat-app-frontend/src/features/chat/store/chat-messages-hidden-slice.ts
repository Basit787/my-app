import { hideMessageId, unhideMessageId } from "@/lib/hidden-messages";
import type { StateCreator } from "zustand";
import type { ChatState } from "@/features/chat/store/chat-types";

export type ChatMessagesHiddenSlice = Pick<ChatState, "hideMessageForMe" | "unhideMessageForMe">;

export const createChatMessagesHiddenSlice: StateCreator<ChatState, [], [], ChatMessagesHiddenSlice> = (set) => ({
  hideMessageForMe: (id) =>
    set(() => ({
      hiddenMessageIds: hideMessageId(id),
    })),
  unhideMessageForMe: (id) =>
    set(() => ({
      hiddenMessageIds: unhideMessageId(id),
    })),
});
