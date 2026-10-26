import type { StateCreator } from "zustand";
import type { ChatState } from "@/features/chat/store/chat-types";

export type ChatGroupCallSlice = Pick<
  ChatState,
  | "incomingGroupCall"
  | "dismissedGroupCallRooms"
  | "setIncomingGroupCall"
  | "dismissIncomingGroupCall"
  | "clearIncomingGroupCall"
>;

export const createChatGroupCallSlice: StateCreator<ChatState, [], [], ChatGroupCallSlice> = (set) => ({
  incomingGroupCall: null,
  dismissedGroupCallRooms: new Set(),
  setIncomingGroupCall: (call) =>
    set((s) => {
      if (s.dismissedGroupCallRooms.has(call.room)) return s;
      return { incomingGroupCall: call };
    }),
  dismissIncomingGroupCall: (room) =>
    set((s) => ({
      incomingGroupCall: s.incomingGroupCall?.room === room ? null : s.incomingGroupCall,
      dismissedGroupCallRooms: new Set(s.dismissedGroupCallRooms).add(room),
    })),
  clearIncomingGroupCall: (room) =>
    set((s) => ({
      incomingGroupCall: s.incomingGroupCall?.room === room ? null : s.incomingGroupCall,
      dismissedGroupCallRooms: (() => {
        const next = new Set(s.dismissedGroupCallRooms);
        next.delete(room);
        return next;
      })(),
    })),
});
