import type { InvoiceLineItem } from "./invoice-line-item.js";

// The data read from an invoice; null where the file doesn't say
export type InvoiceFields = {
  invoiceNumber: string | null;
  invoiceDate: string | null;
  dueDate: string | null;
  vendorName: string | null;
  vendorAddress: string | null;
  vendorTaxId: string | null;
  customerName: string | null;
  customerAddress: string | null;
  currency: string | null;
  subtotal: number | null;
  taxAmount: number | null;
  totalAmount: number | null;
  lineItems: InvoiceLineItem[];
};
