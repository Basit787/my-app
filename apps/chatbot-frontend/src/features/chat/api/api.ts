import { createApiError, readStreamParts, toApiError } from "frontend-common";
import { apiClient } from "@/lib/api-client";
import { chatEndpoints } from "./endpoint";

// Mirrors ConversationDto in apps/chatbot-backend/src/conversations/dto/conversation.dto.ts
export type Conversation = {
  id: string;
  title: string;
  createdAt: string;
  updatedAt: string;
};

export type Source = {
  documentId: string;
  fileName: string;
  excerpt: string;
};

// Mirrors ChatMessageDto in the backend
export type ChatMessage = {
  id: string;
  role: "user" | "assistant";
  content: string;
  sources?: Source[];
};

export type DocumentItem = {
  id: string;
  fileName: string;
  contentType: string;
  size: number;
  chunkCount: number;
  createdAt: string;
};

// Mirrors ConversationDetailDto in the backend
export type ConversationDetail = {
  conversation: Conversation;
  messages: ChatMessage[];
};

// Mirrors ChatStreamEvent in apps/chatbot-backend/src/conversations/types/chat-stream-event.ts
export type ChatStreamEvent =
  | { type: "conversation"; conversation: Conversation }
  | { type: "sources"; sources: Source[] }
  | { type: "tool"; name: string; input: string }
  | { type: "delta"; text: string }
  | { type: "done"; message: ChatMessage; conversation: Conversation }
  | { type: "error"; error: string };

export const fetchConversations = async (): Promise<Conversation[]> => {
  try {
    const response = await apiClient.get<{ conversations: Conversation[] }>(chatEndpoints.conversations());
    if (!response.ok) throw createApiError(response.message, response.status);
    return response.data.conversations;
  } catch (error) {
    throw toApiError(error, "Failed to load chats");
  }
};

export const fetchConversation = async (id: string): Promise<ConversationDetail> => {
  try {
    const response = await apiClient.get<ConversationDetail>(chatEndpoints.conversation(id));
    if (!response.ok) throw createApiError(response.message, response.status);
    return response.data;
  } catch (error) {
    throw toApiError(error, "Failed to load the chat");
  }
};

export const createConversation = async (): Promise<Conversation> => {
  try {
    const response = await apiClient.post<Conversation>(chatEndpoints.conversations());
    if (!response.ok) throw createApiError(response.message, response.status);
    return response.data;
  } catch (error) {
    throw toApiError(error, "Failed to start a chat");
  }
};

export const renameConversation = async (id: string, title: string): Promise<Conversation> => {
  try {
    const response = await apiClient.patch<Conversation>(chatEndpoints.conversation(id), { title });
    if (!response.ok) throw createApiError(response.message, response.status);
    return response.data;
  } catch (error) {
    throw toApiError(error, "Failed to rename the chat");
  }
};

export const deleteConversation = async (id: string): Promise<void> => {
  try {
    const response = await apiClient.delete<{ ok: true }>(chatEndpoints.conversation(id));
    if (!response.ok) throw createApiError(response.message, response.status);
  } catch (error) {
    throw toApiError(error, "Failed to delete the chat");
  }
};

export const fetchDocuments = async (conversationId: string): Promise<DocumentItem[]> => {
  try {
    const response = await apiClient.get<{ documents: DocumentItem[] }>(chatEndpoints.documents(conversationId));
    if (!response.ok) throw createApiError(response.message, response.status);
    return response.data.documents;
  } catch (error) {
    throw toApiError(error, "Failed to load the documents");
  }
};

export const uploadDocument = async (conversationId: string, file: File): Promise<DocumentItem> => {
  const body = new FormData();
  body.append("file", file);
  try {
    const response = await apiClient.requestRaw<DocumentItem>({
      method: "POST",
      url: chatEndpoints.documents(conversationId),
      data: body,
      timeout: 0,
    });
    return response.data;
  } catch (error) {
    throw toApiError(error, "Failed to upload the document");
  }
};

export const deleteDocument = async (conversationId: string, documentId: string): Promise<void> => {
  try {
    const response = await apiClient.delete<{ ok: true }>(chatEndpoints.document(conversationId, documentId));
    if (!response.ok) throw createApiError(response.message, response.status);
  } catch (error) {
    throw toApiError(error, "Failed to remove the document");
  }
};

// Sends a message and reads the NDJSON reply stream (one event per line) until it ends or `signal` aborts
export const streamReply = async (
  conversationId: string,
  content: string,
  signal: AbortSignal,
  onEvent: (event: ChatStreamEvent) => void,
) => {
  try {
    const response = await apiClient.requestRaw<ReadableStream<Uint8Array>>({
      method: "POST",
      url: chatEndpoints.messages(conversationId),
      data: { content },
      adapter: "fetch",
      responseType: "stream",
      timeout: 0,
      signal,
    });

    // One JSON event per line
    await readStreamParts(response.data, "\n", (line) => {
      if (line.trim()) onEvent(JSON.parse(line) as ChatStreamEvent);
    });
  } catch (error) {
    throw toApiError(error, "Could not get a reply");
  }
};
