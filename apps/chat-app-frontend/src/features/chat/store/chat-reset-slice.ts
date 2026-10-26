import { GENERAL_ROOM } from "@/features/chat/api/api";
import type { StateCreator } from "zustand";
import type { ChatState } from "@/features/chat/store/chat-types";

export type ChatResetSlice = Pick<ChatState, "reset">;

export const createChatResetSlice: StateCreator<ChatState, [], [], ChatResetSlice> = (set) => ({
  reset: () =>
    set({
      activeConversationId: GENERAL_ROOM,
      sidebarView: "conversations",
      mobileChatOpen: false,
      onlineUsers: [],
      userStatuses: {},
      typingUser: null,
      typingRoom: null,
      userStatus: "online",
      messages: [],
      groups: [],
      knownContacts: [],
      userProfileImages: {},
      callHistory: [],
      hiddenMessageIds: new Set(),
      messageStatus: {},
      unreadByConversation: {},
      messageSelectionMode: false,
      selectedMessageKeys: [],
      incomingGroupCall: null,
      dismissedGroupCallRooms: new Set(),
      replyTo: null,
      forwardMessage: null,
      forwardBatch: [],
      searchQuery: "",
    }),
});
