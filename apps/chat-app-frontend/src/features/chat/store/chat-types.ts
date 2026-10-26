import type {
  CallHistoryEntry,
  ChatMessage,
  ChatGroup,
  GroupCallState,
  MessageDeliveryStatus,
} from "@/features/chat/api/api";
import type { Conversation, UserStatus } from "frontend-common";

export type { Conversation, UserStatus };

export type { MessageDeliveryStatus };

export type SidebarView = "conversations" | "profile" | "calls";

export type ChatState = {
  activeConversationId: string;
  sidebarView: SidebarView;
  /** On small screens, whether the chat pane is shown instead of the conversation list. */
  mobileChatOpen: boolean;
  onlineUsers: string[];
  userStatuses: Record<string, UserStatus>;
  typingUser: string | null;
  typingRoom: string | null;
  userStatus: UserStatus;
  searchQuery: string;
  messages: ChatMessage[];
  groups: ChatGroup[];
  knownContacts: string[];
  userProfileImages: Record<string, string>;
  callHistory: CallHistoryEntry[];
  hiddenMessageIds: Set<string>;
  messageStatus: Record<string, MessageDeliveryStatus>;
  unreadByConversation: Record<string, number>;
  messageSelectionMode: boolean;
  selectedMessageKeys: string[];
  incomingGroupCall: GroupCallState | null;
  dismissedGroupCallRooms: Set<string>;
  replyTo: ChatMessage | null;
  forwardMessage: ChatMessage | null;
  forwardBatch: ChatMessage[];
  setActiveConversation: (id: string) => void;
  setSidebarView: (view: SidebarView) => void;
  closeMobileChat: () => void;
  setOnlineUsers: (users: string[]) => void;
  mergeUserStatuses: (statuses: Record<string, UserStatus>) => void;
  setTypingUser: (room: string, user: string | null) => void;
  setUserStatus: (status: UserStatus) => void;
  setSearchQuery: (query: string) => void;
  setMessages: (messages: ChatMessage[]) => void;
  setGroups: (groups: ChatGroup[]) => void;
  setKnownContacts: (contacts: string[]) => void;
  mergeUserProfileImages: (images: Record<string, string>) => void;
  addGroup: (group: ChatGroup) => void;
  updateGroup: (group: ChatGroup) => void;
  mergeMessages: (room: string, messages: ChatMessage[]) => void;
  addMessage: (message: ChatMessage) => void;
  setMessageStatus: (messageId: string, status: MessageDeliveryStatus) => void;
  incrementUnread: (conversationId: string) => void;
  clearUnread: (conversationId: string) => void;
  enterMessageSelection: (key?: string) => void;
  exitMessageSelection: () => void;
  toggleMessageKey: (key: string) => void;
  setSelectedMessageKeys: (keys: string[]) => void;
  setIncomingGroupCall: (call: GroupCallState) => void;
  dismissIncomingGroupCall: (room: string) => void;
  clearIncomingGroupCall: (room: string) => void;
  setCallHistory: (calls: CallHistoryEntry[]) => void;
  mergeCallHistory: (calls: CallHistoryEntry[]) => void;
  addCallHistory: (call: CallHistoryEntry) => void;
  removeMessage: (id: string) => void;
  markMessageDeleted: (message: ChatMessage) => void;
  restoreMessage: (message: ChatMessage) => void;
  hideMessageForMe: (id: string) => void;
  unhideMessageForMe: (id: string) => void;
  setReplyTo: (message: ChatMessage | null) => void;
  setForwardMessage: (message: ChatMessage | null) => void;
  setForwardBatch: (messages: ChatMessage[]) => void;
  reset: () => void;
};
