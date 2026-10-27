import type { Invoice } from "@/features/invoices/api/api";

// "INV-2024-031.pdf", or the uploaded file's name when the number is unknown
export const editedPdfName = (invoice: Invoice): string => {
  const base = invoice.invoiceNumber ?? invoice.filename.replace(/\.[^.]+$/, "");
  return `${base.replace(/[^\w.-]+/g, "_")}.pdf`;
};
