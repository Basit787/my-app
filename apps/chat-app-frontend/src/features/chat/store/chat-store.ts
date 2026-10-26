import { create } from "zustand";
import { GENERAL_ROOM } from "@/features/chat/api/api";
import { getHiddenMessageIds } from "@/lib/hidden-messages";
import { createChatCallsDataSlice } from "@/features/chat/store/chat-calls-data-slice";
import { createChatCallsMutationsSlice } from "@/features/chat/store/chat-calls-mutations-slice";
import { createChatComposeSlice } from "@/features/chat/store/chat-compose-slice";
import { createChatGroupsDataSlice } from "@/features/chat/store/chat-groups-data-slice";
import { createChatGroupsMutationsSlice } from "@/features/chat/store/chat-groups-mutations-slice";
import { createChatMessagesDataSlice } from "@/features/chat/store/chat-messages-data-slice";
import { createChatMessagesDeleteSlice } from "@/features/chat/store/chat-messages-delete-slice";
import { createChatMessagesHiddenSlice } from "@/features/chat/store/chat-messages-hidden-slice";
import { createChatMessageStatusSlice } from "@/features/chat/store/chat-message-status-slice";
import { createChatMessagesMutationsSlice } from "@/features/chat/store/chat-messages-mutations-slice";
import { createChatNavigationSlice } from "@/features/chat/store/chat-navigation-slice";
import { createChatPresenceSlice } from "@/features/chat/store/chat-presence-slice";
import { createChatResetSlice } from "@/features/chat/store/chat-reset-slice";
import { createChatSearchSlice } from "@/features/chat/store/chat-search-slice";
import { createChatUserStatusSlice } from "@/features/chat/store/chat-user-status-slice";
import { createChatUnreadSlice } from "@/features/chat/store/chat-unread-slice";
import { createChatGroupCallSlice } from "@/features/chat/store/chat-group-call-slice";
import { createChatUserProfilesSlice } from "@/features/chat/store/chat-user-profiles-slice";
import { createChatMessageSelectionSlice } from "@/features/chat/store/chat-message-selection-slice";
import type { ChatState } from "@/features/chat/store/chat-types";

export type {
  ChatState,
  Conversation,
  MessageDeliveryStatus,
  SidebarView,
  UserStatus,
} from "@/features/chat/store/chat-types";

export {
  buildConversations,
  callsForConversation,
  messagesForConversation,
} from "@/features/chat/store/conversation-utils";

export const useChatStore = create<ChatState>()((...args) => ({
  activeConversationId: GENERAL_ROOM,
  sidebarView: "conversations",
  mobileChatOpen: false,
  onlineUsers: [],
  userStatuses: {},
  typingUser: null,
  typingRoom: null,
  userStatus: "online",
  searchQuery: "",
  messages: [],
  groups: [],
  knownContacts: [],
  callHistory: [],
  hiddenMessageIds: getHiddenMessageIds(),
  replyTo: null,
  forwardMessage: null,
  ...createChatNavigationSlice(...args),
  ...createChatSearchSlice(...args),
  ...createChatComposeSlice(...args),
  ...createChatResetSlice(...args),
  ...createChatPresenceSlice(...args),
  ...createChatUserStatusSlice(...args),
  ...createChatMessagesDataSlice(...args),
  ...createChatMessagesMutationsSlice(...args),
  ...createChatMessageStatusSlice(...args),
  ...createChatUnreadSlice(...args),
  ...createChatGroupCallSlice(...args),
  ...createChatUserProfilesSlice(...args),
  ...createChatMessageSelectionSlice(...args),
  ...createChatMessagesDeleteSlice(...args),
  ...createChatMessagesHiddenSlice(...args),
  ...createChatGroupsDataSlice(...args),
  ...createChatGroupsMutationsSlice(...args),
  ...createChatCallsDataSlice(...args),
  ...createChatCallsMutationsSlice(...args),
}));
