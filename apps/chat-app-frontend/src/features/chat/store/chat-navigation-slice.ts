import type { StateCreator } from "zustand";
import type { ChatState } from "@/features/chat/store/chat-types";

export type ChatNavigationSlice = Pick<ChatState, "setActiveConversation" | "setSidebarView" | "closeMobileChat">;

export const createChatNavigationSlice: StateCreator<ChatState, [], [], ChatNavigationSlice> = (set, get) => ({
  setActiveConversation: (id) => {
    get().clearUnread(id);
    get().exitMessageSelection();
    set({ activeConversationId: id, mobileChatOpen: true, typingUser: null, typingRoom: null });
  },
  setSidebarView: (view) => set({ sidebarView: view }),
  closeMobileChat: () => {
    get().exitMessageSelection();
    set({ mobileChatOpen: false });
  },
});
