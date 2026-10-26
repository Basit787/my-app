import { GENERAL_ROOM, dmPeerFromRoom, dmRoomName, normalizeDmRoom, messageMatchesConversation } from "./rooms";
import { messageKey, messagePreview } from "./messages";
import { effectivePresenceStatus } from "./presence";
import type { CallHistoryEntry, ChatGroup, ChatMessage, Conversation, UserStatus } from "./types";

export const buildConversations = (
  messages: ChatMessage[],
  onlineUsers: string[],
  selfUsername: string,
  groups: ChatGroup[] = [],
  callHistory: CallHistoryEntry[] = [],
  knownContacts: string[] = [],
  userStatuses: Record<string, UserStatus> = {},
  unreadByConversation: Record<string, number> = {},
): Conversation[] => {
  const generalMessages = messages.filter((m) => m.room === GENERAL_ROOM);
  const generalLast = generalMessages.at(-1);
  const general: Conversation = {
    id: GENERAL_ROOM,
    name: "General",
    type: "channel",
    room: GENERAL_ROOM,
    lastMessage: generalLast ? messagePreview(generalLast) : undefined,
    lastAt: generalLast?.at,
    unreadCount: unreadByConversation[GENERAL_ROOM] ?? 0,
  };

  const groupConversations: Conversation[] = groups.map((group) => {
    const thread = messages.filter((m) => m.room === group.room);
    const last = thread.at(-1);
    return {
      id: group.room,
      name: group.name,
      type: "group" as const,
      room: group.room,
      lastMessage: last ? messagePreview(last) : undefined,
      lastAt: last?.at,
      unreadCount: unreadByConversation[group.room] ?? 0,
    };
  });

  const dmRooms = new Set<string>();
  messages.forEach((m) => {
    const canonical = normalizeDmRoom(m.room);
    if (canonical) dmRooms.add(canonical);
  });
  callHistory.forEach((call) => {
    const peer = call.caller === selfUsername ? call.callee : call.caller;
    if (peer !== selfUsername) dmRooms.add(dmRoomName(selfUsername, peer));
  });
  knownContacts.forEach((peer) => {
    if (peer !== selfUsername) dmRooms.add(dmRoomName(selfUsername, peer));
  });
  onlineUsers.forEach((u) => {
    if (u !== selfUsername) dmRooms.add(dmRoomName(selfUsername, u));
  });

  const dms: Conversation[] = Array.from(dmRooms).map((room) => {
    const peer = dmPeerFromRoom(room, selfUsername) ?? "Unknown";
    const thread = messages.filter((m) => normalizeDmRoom(m.room) === room || m.room === room);
    const last = thread.at(-1);
    const presenceStatus = effectivePresenceStatus(peer, onlineUsers, userStatuses);
    return {
      id: peer,
      name: peer,
      type: "dm" as const,
      room,
      online: presenceStatus === "online",
      presenceStatus,
      lastMessage: last ? messagePreview(last) : undefined,
      lastAt: last?.at,
      unreadCount: unreadByConversation[peer] ?? 0,
    };
  });

  const sorted = [...groupConversations, ...dms].sort((a, b) => {
    const aTime = a.lastAt ? new Date(a.lastAt).getTime() : 0;
    const bTime = b.lastAt ? new Date(b.lastAt).getTime() : 0;
    return bTime - aTime;
  });

  return [general, ...sorted];
};

export const callsForConversation = (calls: CallHistoryEntry[], conversationId: string, selfUsername: string) => {
  if (conversationId === GENERAL_ROOM) return [];
  return calls.filter(
    (c) =>
      (c.caller === selfUsername && c.callee === conversationId) ||
      (c.caller === conversationId && c.callee === selfUsername),
  );
};

export const messagesForConversation = (
  messages: ChatMessage[],
  conversationId: string,
  selfUsername: string,
  hiddenMessageIds: Set<string> = new Set(),
) =>
  messages.filter(
    (m) => messageMatchesConversation(m.room, conversationId, selfUsername) && !hiddenMessageIds.has(messageKey(m)),
  );
