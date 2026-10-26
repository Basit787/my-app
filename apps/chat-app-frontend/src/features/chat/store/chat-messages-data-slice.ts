import { dmRoomAliases, normalizeDmRoom, parseDmRoom } from "@/lib/rooms";
import type { StateCreator } from "zustand";
import type { ChatState } from "@/features/chat/store/chat-types";

const roomAliases = (room: string): Set<string> => {
  const participants = parseDmRoom(room);
  if (!participants) return new Set([room]);
  return new Set(dmRoomAliases(participants[0], participants[1]));
};

export type ChatMessagesDataSlice = Pick<ChatState, "setMessages" | "mergeMessages">;

export const createChatMessagesDataSlice: StateCreator<ChatState, [], [], ChatMessagesDataSlice> = (set) => ({
  setMessages: (messages) => set({ messages }),
  mergeMessages: (room, roomMessages) =>
    set((s) => {
      const aliases = roomAliases(room);
      const others = s.messages.filter((m) => !aliases.has(m.room));
      const normalized = roomMessages.map((message) => {
        const canonical = normalizeDmRoom(message.room);
        return canonical ? { ...message, room: canonical } : message;
      });
      return { messages: [...others, ...normalized].sort((a, b) => a.at.localeCompare(b.at)) };
    }),
});
