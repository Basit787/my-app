import type { Invoice } from "@/features/invoices/api/api";

// How the fields were read, in words
export const INVOICE_SOURCE_LABEL: Record<NonNullable<Invoice["source"]>, string> = {
  XML: "XML e-invoice (exact)",
  TEXT: "PDF text layer",
  OCR: "OCR (Tesseract)",
};
