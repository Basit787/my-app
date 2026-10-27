import path from "node:path";
import { CONTENT_TYPES } from "./content-types.js";

// Images Tesseract reads directly
const IMAGE_TYPES: Record<string, string> = {
  ".png": "image/png",
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".tif": "image/tiff",
  ".tiff": "image/tiff",
};

// What the file really is, from its first bytes and its extension; null for anything that isn't an invoice file
export const detectContentType = (filename: string, buffer: Buffer): string | null => {
  const extension = path.extname(filename).toLowerCase();
  const head = buffer.subarray(0, 1024);
  if (head.includes("%PDF")) return CONTENT_TYPES.pdf;

  const text = head
    .toString("utf8")
    .replace(/^\uFEFF/, "")
    .trimStart();
  if (text.startsWith("<?xml") || (extension === ".xml" && text.startsWith("<"))) return CONTENT_TYPES.xml;
  return IMAGE_TYPES[extension] ?? null;
};
