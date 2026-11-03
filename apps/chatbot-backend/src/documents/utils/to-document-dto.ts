import type { Document } from "@app/db";
import type { DocumentDto } from "../dto/document.dto.js";

export const toDocumentDto = (document: Document): DocumentDto => ({
  id: document.id,
  fileName: document.fileName,
  contentType: document.contentType,
  size: document.size,
  chunkCount: document.chunkCount,
  createdAt: document.createdAt.toISOString(),
});
