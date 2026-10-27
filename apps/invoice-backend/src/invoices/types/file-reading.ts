import type { InvoiceSource } from "@app/db";
import type { PageLayout } from "@app/ocr";
import type { InvoiceFields } from "./invoice-fields.js";

// What reading a file gave: its text, word positions per page (none for XML), and the fields when XML states them exactly
export type FileReading = {
  source: InvoiceSource;
  pageCount: number | null;
  text: string;
  fields: InvoiceFields | null;
  layout: PageLayout[] | null;
};
