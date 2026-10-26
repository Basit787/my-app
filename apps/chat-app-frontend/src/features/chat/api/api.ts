import { apiClient } from "@/lib/api-client";
import { createApiError, toApiError } from "frontend-common";
import { chatEndpoints } from "./endpoint";
import type {
  CallHistoryEntry,
  ChatGroup,
  ChatMessage,
  ContactProfile,
  CreateGroupPayload,
  UpdateGroupPayload,
} from "frontend-common";

export type {
  MessageFile,
  ChatMessage,
  MessageDeliveryStatus,
  CallType,
  GroupCallState,
  CallStatus,
  CallHistoryEntry,
  ChatGroup,
  CreateGroupPayload,
  UpdateGroupPayload,
  ContactProfile,
} from "frontend-common";
export { GENERAL_ROOM } from "frontend-common";

export const fetchMessages = async (room: string): Promise<ChatMessage[]> => {
  try {
    const response = await apiClient.get<{ messages: ChatMessage[] }>(chatEndpoints.messages(room));
    if (!response.ok) throw createApiError(response.message, response.status);
    return response.data.messages ?? [];
  } catch (error) {
    throw toApiError(error, "Failed to load messages");
  }
};

export const uploadFile = async (room: string, file: File, caption?: string): Promise<ChatMessage> => {
  const body = new FormData();
  body.append("file", file);
  if (caption) body.append("caption", caption);
  try {
    const response = await apiClient.postForm<ChatMessage>(chatEndpoints.files(room), body);
    if (!response.ok) throw createApiError(response.message, response.status);
    return response.data;
  } catch (error) {
    throw toApiError(error, "Failed to upload file");
  }
};

export const downloadFile = async (room: string, fileId: string): Promise<Blob> => {
  try {
    const response = await apiClient.getBlob(chatEndpoints.file(room, fileId));
    if (!response.ok) throw createApiError(response.message, response.status);
    return response.data;
  } catch (error) {
    throw toApiError(error, "Failed to download file");
  }
};

export const fileDownloadUrl = (room: string, fileId: string) => {
  const base = import.meta.env.VITE_API_URL ?? "/api";
  return `${base}${chatEndpoints.file(room, fileId)}`;
};

export const fetchIceServers = async (): Promise<{ iceServers: RTCIceServer[] }> => {
  try {
    const response = await apiClient.get<{ iceServers: RTCIceServer[] }>(chatEndpoints.webrtcConfig());
    if (!response.ok) throw createApiError(response.message, response.status);
    return response.data;
  } catch (error) {
    throw toApiError(error, "Failed to load WebRTC config");
  }
};

export const fetchCallHistory = async (peer?: string): Promise<CallHistoryEntry[]> => {
  try {
    const response = await apiClient.get<{ calls: CallHistoryEntry[] }>(
      chatEndpoints.callHistory(),
      peer ? { peer } : undefined,
    );
    if (!response.ok) throw createApiError(response.message, response.status);
    return response.data.calls ?? [];
  } catch (error) {
    throw toApiError(error, "Failed to load call history");
  }
};

export const deleteMessage = async (room: string, messageId: string): Promise<void> => {
  try {
    const response = await apiClient.delete<null>(`${chatEndpoints.messages(room)}/${messageId}`);
    if (!response.ok) throw createApiError(response.message, response.status);
  } catch (error) {
    throw toApiError(error, "Failed to delete message");
  }
};

export const fetchGroups = async (): Promise<ChatGroup[]> => {
  try {
    const response = await apiClient.get<{ groups: ChatGroup[] }>(chatEndpoints.groups());
    if (!response.ok) throw createApiError(response.message, response.status);
    return response.data.groups ?? [];
  } catch (error) {
    throw toApiError(error, "Failed to load groups");
  }
};

export const fetchContacts = async (): Promise<ContactProfile[]> => {
  try {
    const response = await apiClient.get<{ contacts: ContactProfile[] }>(chatEndpoints.contacts());
    if (!response.ok) throw createApiError(response.message, response.status);
    return response.data.contacts ?? [];
  } catch (error) {
    throw toApiError(error, "Failed to load contacts");
  }
};

export const createGroup = async (payload: CreateGroupPayload): Promise<ChatGroup> => {
  try {
    const response = await apiClient.post<ChatGroup>(chatEndpoints.groups(), {
      name: payload.name,
      members: payload.members,
      description: payload.description ?? "",
    });
    if (!response.ok) throw createApiError(response.message, response.status);
    return response.data;
  } catch (error) {
    throw toApiError(error, "Failed to create group");
  }
};

export const fetchGroup = async (groupId: string): Promise<ChatGroup> => {
  try {
    const response = await apiClient.get<ChatGroup>(chatEndpoints.group(groupId));
    if (!response.ok) throw createApiError(response.message, response.status);
    return response.data;
  } catch (error) {
    throw toApiError(error, "Failed to load group");
  }
};

export const updateGroup = async (groupId: string, body: UpdateGroupPayload): Promise<ChatGroup> => {
  try {
    const response = await apiClient.patch<ChatGroup>(chatEndpoints.group(groupId), body);
    if (!response.ok) throw createApiError(response.message, response.status);
    return response.data;
  } catch (error) {
    throw toApiError(error, "Failed to update group");
  }
};

export const uploadGroupPhoto = async (groupId: string, file: File): Promise<string> => {
  const body = new FormData();
  body.append("photo", file);
  try {
    const response = await apiClient.postForm<{ image: string }>(chatEndpoints.groupAvatar(groupId), body);
    if (!response.ok) throw createApiError(response.message, response.status);
    return response.data.image;
  } catch (error) {
    throw toApiError(error, "Failed to upload group photo");
  }
};

export const removeGroupPhoto = async (groupId: string): Promise<void> => {
  try {
    const response = await apiClient.delete<null>(chatEndpoints.groupAvatar(groupId));
    if (!response.ok) throw createApiError(response.message, response.status);
  } catch (error) {
    throw toApiError(error, "Failed to remove group photo");
  }
};
