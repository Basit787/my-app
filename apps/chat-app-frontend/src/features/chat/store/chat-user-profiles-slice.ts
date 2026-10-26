import type { StateCreator } from "zustand";
import type { ChatState } from "@/features/chat/store/chat-types";

export type ChatUserProfilesSlice = Pick<ChatState, "userProfileImages" | "mergeUserProfileImages">;

export const createChatUserProfilesSlice: StateCreator<ChatState, [], [], ChatUserProfilesSlice> = (set) => ({
  userProfileImages: {},
  mergeUserProfileImages: (images) =>
    set((s) => ({
      userProfileImages: { ...s.userProfileImages, ...images },
    })),
});
