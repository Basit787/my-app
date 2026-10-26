import type { Document } from "@app/db";
import type { DocumentDto } from "../dto/document.dto.js";

export const toDocumentDto = (document: Document): DocumentDto => ({
  id: document.id,
  filename: document.filename,
  size: document.size,
  status: document.status,
  summary: document.summary,
  createdAt: document.createdAt.toISOString(),
  updatedAt: document.updatedAt.toISOString(),
});
