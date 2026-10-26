export const GENERAL_ROOM = "general";

const ROOM_PATTERN = /^[a-zA-Z0-9._-]{1,64}$/;
const DM_PREFIX = "dm..";
const GROUP_PREFIX = "group..";

export const MAX_ROOM_LENGTH = 256;

const encodeDmParticipant = (username: string) => encodeURIComponent(username);

const decodeDmParticipant = (encoded: string): string | null => {
  try {
    return decodeURIComponent(encoded);
  } catch {
    return null;
  }
};

export const isValidRoom = (room: string) => {
  if (room === "general") return true;
  if (room.length > MAX_ROOM_LENGTH) return false;
  if (room.startsWith(GROUP_PREFIX)) return ROOM_PATTERN.test(room);
  if (room.startsWith(DM_PREFIX)) return parseDmRoom(room) !== null;
  return ROOM_PATTERN.test(room);
};

export const groupRoomName = (groupId: string) => `${GROUP_PREFIX}${groupId}`;

export const parseGroupRoom = (room: string): string | null => {
  if (!room.startsWith(GROUP_PREFIX)) return null;
  const id = room.slice(GROUP_PREFIX.length);
  return id && ROOM_PATTERN.test(id) ? id : null;
};

export const isGroupRoom = (room: string) => room.startsWith(GROUP_PREFIX);

export const dmRoomName = (userA: string, userB: string) => {
  const [a, b] = [userA, userB].sort();
  return `${DM_PREFIX}${encodeDmParticipant(a)}..${encodeDmParticipant(b)}`;
};

/** Pre-encoding DM room id (legacy messages may still use this). */
export const legacyDmRoomName = (userA: string, userB: string) => {
  const [a, b] = [userA, userB].sort();
  return `${DM_PREFIX}${a}..${b}`;
};

export const dmRoomAliases = (userA: string, userB: string): string[] => {
  const canonical = dmRoomName(userA, userB);
  const legacy = legacyDmRoomName(userA, userB);
  return canonical === legacy ? [canonical] : [canonical, legacy];
};

export const dmRoomsMatch = (left: string, right: string): boolean => {
  if (left === right) return true;
  const leftParticipants = parseDmRoom(left);
  const rightParticipants = parseDmRoom(right);
  if (!leftParticipants || !rightParticipants) return false;
  return leftParticipants[0] === rightParticipants[0] && leftParticipants[1] === rightParticipants[1];
};

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

export const canAccessRoom = (room: string, username: string) => {
  if (room === "general") return true;
  const participants = parseDmRoom(room);
  if (!participants) return false;
  return participants.includes(username);
};

export const dmPeerFromRoom = (room: string, selfUsername: string) => {
  const participants = parseDmRoom(room);
  if (!participants) return null;
  return participants[0] === selfUsername ? participants[1] : participants[1] === selfUsername ? participants[0] : null;
};
