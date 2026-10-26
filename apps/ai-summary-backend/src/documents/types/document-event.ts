import type { DocumentDto } from "../dto/document.dto.js";

// Pushed to the owner's event streams; the frontend drops `document` straight into its list
export type DocumentEvent =
  { type: "document.updated"; document: DocumentDto } | { type: "document.deleted"; id: string };
