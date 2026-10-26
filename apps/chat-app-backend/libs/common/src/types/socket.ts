import type { CallType } from "./api.js";
import type { PresenceStatus, Role } from "./auth-user.js";

export interface SocketUser {
  id: string;
  role: Role;
  username: string;
}

export type { PresenceStatus };

export interface PresencePayload {
  room?: string;
  count: number;
  users: string[];
  statuses: Record<string, PresenceStatus>;
}

export interface TypingPayload {
  room: string;
  username: string;
}

export interface MessageDeletedPayload {
  id: string;
}

export interface CallIncomingPayload {
  from: string;
  callType: CallType;
}

export interface CallSignalPayload {
  from: string;
  sdp?: unknown;
  candidate?: unknown;
}

export interface CallFromPayload {
  from: string;
}

export interface CallInvitePayload {
  to: string;
  callType: CallType;
}

export interface CallRelayPayload {
  to: string;
}

export interface CallOfferPayload extends CallRelayPayload {
  sdp: unknown;
}

export interface CallAnswerPayload extends CallRelayPayload {
  sdp: unknown;
}

export interface CallIceCandidatePayload extends CallRelayPayload {
  candidate: unknown;
}

export interface GroupCallState {
  room: string;
  callType: CallType;
  host: string;
  participants: string[];
}

export interface GroupCallRelayPayload {
  room: string;
  to: string;
}

export interface GroupCallOfferPayload extends GroupCallRelayPayload {
  from: string;
  sdp: unknown;
}

export interface GroupCallAnswerPayload extends GroupCallRelayPayload {
  from: string;
  sdp: unknown;
}

export interface GroupCallIcePayload extends GroupCallRelayPayload {
  from: string;
  candidate: unknown;
}
