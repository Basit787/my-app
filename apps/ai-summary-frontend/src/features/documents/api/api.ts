import { createApiError, readStreamParts, toApiError } from "frontend-common";
import { apiClient } from "@/lib/api-client";
import { documentEndpoints } from "./endpoint";

// Mirrors DocumentDto in apps/ai-summary-backend/src/documents/dto/document.dto.ts
export type SummaryDocument = {
  id: string;
  filename: string;
  size: number;
  status: "UPLOADED" | "PROCESSING" | "COMPLETED" | "FAILED";
  summary: string | null;
  createdAt: string;
  updatedAt: string;
};

export const fetchDocuments = async (): Promise<SummaryDocument[]> => {
  try {
    const response = await apiClient.get<SummaryDocument[]>(documentEndpoints.list());
    if (!response.ok) throw createApiError(response.message, response.status);
    return response.data;
  } catch (error) {
    throw toApiError(error, "Failed to load documents");
  }
};

export const uploadDocument = async (file: File): Promise<SummaryDocument> => {
  const body = new FormData();
  body.append("file", file);
  try {
    const response = await apiClient.postForm<SummaryDocument>(documentEndpoints.upload(), body);
    if (!response.ok) throw createApiError(response.message, response.status);
    return response.data;
  } catch (error) {
    throw toApiError(error, "Failed to upload document");
  }
};

// Only a failed summary can be requested again
export const retrySummary = async (id: string): Promise<SummaryDocument> => {
  try {
    const response = await apiClient.post<SummaryDocument>(documentEndpoints.summarize(id));
    if (!response.ok) throw createApiError(response.message, response.status);
    return response.data;
  } catch (error) {
    throw toApiError(error, "Failed to restart the summary");
  }
};

export const deleteDocument = async (id: string): Promise<void> => {
  try {
    const response = await apiClient.delete<{ message: string }>(documentEndpoints.remove(id));
    if (!response.ok) throw createApiError(response.message, response.status);
  } catch (error) {
    throw toApiError(error, "Failed to delete document");
  }
};

// Mirrors DocumentEvent in apps/ai-summary-backend/src/documents/types/document-event.ts
export type DocumentEvent =
  { type: "document.updated"; document: SummaryDocument } | { type: "document.deleted"; id: string };

// One event block ("data: {...}" lines); keep-alive pings (": ping") have no data and give null
const parseEventBlock = (block: string): DocumentEvent | null => {
  const dataLines = block
    .split("\n")
    .filter((line) => line.startsWith("data:"))
    .map((line) => line.slice("data:".length).trim());
  if (dataLines.length === 0) return null;
  return JSON.parse(dataLines.join("\n")) as DocumentEvent;
};

// Reads the server-sent event stream until it closes or `signal` aborts.
// Not EventSource: it cannot send the bearer token, apiClient can.
export const streamDocumentEvents = async (
  signal: AbortSignal,
  onOpen: () => void,
  onEvent: (event: DocumentEvent) => void,
) => {
  try {
    const response = await apiClient.requestRaw<ReadableStream<Uint8Array>>({
      url: documentEndpoints.events(),
      adapter: "fetch",
      responseType: "stream",
      timeout: 0,
      signal,
    });
    onOpen();

    // Events end with a blank line
    await readStreamParts(response.data, "\n\n", (block) => {
      const event = parseEventBlock(block);
      if (event) onEvent(event);
    });
  } catch (error) {
    throw toApiError(error, "Document events disconnected");
  }
};
