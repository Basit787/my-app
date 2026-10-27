import type { PageLayout } from "./page-layout.js";

// Text of a PDF: `ocrPages` of its pages had no text layer and were read with Tesseract; `pages` holds word positions
export type PdfText = {
  text: string;
  pageCount: number;
  ocrPages: number;
  pages: PageLayout[];
};
