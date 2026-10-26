export interface MessageFileDto {
  id: string;
  name: string;
  mimeType: string;
  size: number;
}

export type MessageType = "text" | "file";

export type MessageDeliveryStatus = "sent" | "delivered" | "read";

export interface ChatMessageDto {
  id: string;
  room: string;
  user: string;
  text: string;
  type: MessageType;
  file?: MessageFileDto;
  deleted?: boolean;
  /** Delivery status, only included on the sender's own messages */
  status?: MessageDeliveryStatus;
  at: string;
}

export interface MessagesResponse {
  messages: ChatMessageDto[];
}

export interface OkResponse {
  ok: true;
}

export interface ProfileAvatarResponse {
  image: string;
}

export type PresenceStatusDto = "online" | "away" | "busy" | "offline";

export interface ProfileStatusResponse {
  status: PresenceStatusDto;
}

export type { ApiErrorResponse } from "backend-common";

export interface IceServerDto {
  urls: string | string[];
  username?: string;
  credential?: string;
}

export interface WebRTCConfigResponse {
  iceServers: IceServerDto[];
}

export type CallStatus = "completed" | "missed" | "rejected" | "cancelled";
export type CallType = "audio" | "video";

export interface CallHistoryDto {
  id: string;
  caller: string;
  callee: string;
  callType: CallType;
  status: CallStatus;
  startedAt: string;
  endedAt: string;
  durationSeconds?: number;
}

export interface CallHistoryListResponse {
  calls: CallHistoryDto[];
}

export interface ChatGroupDto {
  id: string;
  name: string;
  description: string;
  image: string;
  room: string;
  members: string[];
  createdBy: string;
  createdAt: string;
  updatedAt: string;
}

export interface ChatGroupsResponse {
  groups: ChatGroupDto[];
}

export interface ContactDto {
  name: string;
  image: string;
}

export interface ContactsResponse {
  contacts: ContactDto[];
}
