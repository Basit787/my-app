export type MessageFile = {
  id: string;
  name: string;
  mimeType: string;
  size: number;
};

export type MessageDeliveryStatus = "sent" | "delivered" | "read";

export type ChatMessage = {
  id?: string;
  room: string;
  user: string;
  text: string;
  at: string;
  type?: "text" | "file";
  file?: MessageFile;
  deleted?: boolean;
  // Delivery status from the server, only present on your own messages
  status?: MessageDeliveryStatus;
};

export type CallType = "audio" | "video";

export type GroupCallState = {
  room: string;
  callType: CallType;
  host: string;
  participants: string[];
};

export type CallStatus = "completed" | "missed" | "rejected" | "cancelled";

export type CallHistoryEntry = {
  id: string;
  caller: string;
  callee: string;
  callType: CallType;
  status: CallStatus;
  startedAt: string;
  endedAt: string;
  durationSeconds?: number;
};

export type ChatGroup = {
  id: string;
  name: string;
  description: string;
  image: string;
  room: string;
  members: string[];
  createdBy: string;
  createdAt: string;
  updatedAt: string;
};

export type CreateGroupPayload = {
  name: string;
  members: string[];
  description?: string;
};

export type UpdateGroupPayload = {
  name?: string;
  description?: string;
};

export type ContactProfile = {
  name: string;
  image: string;
};

export type PresenceStatus = "online" | "away" | "busy" | "offline";

export type UserStatus = PresenceStatus;

export type Conversation = {
  id: string;
  name: string;
  type: "channel" | "dm" | "group";
  room: string;
  lastMessage?: string;
  lastAt?: string;
  online?: boolean;
  presenceStatus?: UserStatus;
  unreadCount?: number;
};

export type IceServersResponse = { iceServers: RTCIceServerConfig[] };

// Structural copy of the DOM's RTCIceServer, so React Native code can use it without DOM types
export type RTCIceServerConfig = {
  urls: string | string[];
  username?: string;
  credential?: string;
};
