import { CONTENT_TYPES } from "./content-types.js";

// Originals pdf-lib can draw on: PDFs, and PNG/JPEG images (wrapped in a PDF page)
export const EDITABLE_CONTENT_TYPES = [CONTENT_TYPES.pdf, "image/png", "image/jpeg"];
