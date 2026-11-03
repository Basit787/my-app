import type { Document } from "@langchain/core/documents";
import type { ChunkMetadata } from "../types/chunk-metadata.js";
import type { Source } from "../types/source.js";

export const toSource = (chunk: Document): Source => {
  const metadata = chunk.metadata as ChunkMetadata;
  return { documentId: metadata.documentId, fileName: metadata.fileName, excerpt: chunk.pageContent };
};
