export const GENERAL_ROOM = "general";
const GROUP_PREFIX = "group..";
const DM_PREFIX = "dm..";

const encodeDmParticipant = (username: string) => encodeURIComponent(username);

const decodeDmParticipant = (encoded: string): string | null => {
  try {
    return decodeURIComponent(encoded);
  } catch {
    return null;
  }
};

export const dmRoomName = (userA: string, userB: string) => {
  const [a, b] = [userA, userB].sort();
  return `${DM_PREFIX}${encodeDmParticipant(a)}..${encodeDmParticipant(b)}`;
};

/** Pre-encoding DM room id (legacy messages may still use this). */
export const legacyDmRoomName = (userA: string, userB: string) => {
  const [a, b] = [userA, userB].sort();
  return `${DM_PREFIX}${a}..${b}`;
};

export const normalizeDmRoom = (room: string): string | null => {
  const participants = parseDmRoom(room);
  if (!participants) return null;
  return dmRoomName(participants[0], participants[1]);
};

export const dmRoomAliases = (userA: string, userB: string): string[] => {
  const canonical = dmRoomName(userA, userB);
  const legacy = legacyDmRoomName(userA, userB);
  return canonical === legacy ? [canonical] : [canonical, legacy];
};

export const roomsForConversation = (conversationId: string, selfUsername: string): Set<string> => {
  if (conversationId === GENERAL_ROOM) return new Set([GENERAL_ROOM]);
  if (isGroupRoom(conversationId)) return new Set([conversationId]);
  return new Set(dmRoomAliases(selfUsername, conversationId));
};

export const messageMatchesConversation = (
  messageRoom: string,
  conversationId: string,
  selfUsername: string,
): boolean => roomsForConversation(conversationId, selfUsername).has(messageRoom);

export const parseDmRoom = (room: string): [string, string] | null => {
  if (!room.startsWith(DM_PREFIX)) return null;
  const payload = room.slice(DM_PREFIX.length);
  const splitIndex = payload.indexOf("..");
  if (splitIndex <= 0) return null;

  const first = decodeDmParticipant(payload.slice(0, splitIndex));
  const second = decodeDmParticipant(payload.slice(splitIndex + 2));
  if (!first || !second) return null;
  return [first, second];
};

export const isGroupRoom = (roomOrId: string) => roomOrId.startsWith(GROUP_PREFIX);

export const conversationToRoom = (conversationId: string, selfUsername: string) => {
  if (conversationId === GENERAL_ROOM) return GENERAL_ROOM;
  if (isGroupRoom(conversationId)) return conversationId;
  return dmRoomName(selfUsername, conversationId);
};

export const dmPeerFromRoom = (room: string, selfUsername: string) => {
  const participants = parseDmRoom(room);
  if (!participants) return null;
  return participants[0] === selfUsername ? participants[1] : participants[1] === selfUsername ? participants[0] : null;
};

export const roomToConversationId = (room: string, selfUsername: string) => {
  if (room === GENERAL_ROOM) return GENERAL_ROOM;
  if (isGroupRoom(room)) return room;
  return dmPeerFromRoom(room, selfUsername) ?? room;
};

export const isDmConversation = (conversationId: string) =>
  conversationId !== GENERAL_ROOM && !isGroupRoom(conversationId);
