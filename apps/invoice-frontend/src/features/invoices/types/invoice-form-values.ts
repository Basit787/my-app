import type { LineItemFormValues } from "./line-item-form-values";

// The invoice as the form edits it: every value a string, empty when unknown
export type InvoiceFormValues = {
  invoiceNumber: string;
  invoiceDate: string;
  dueDate: string;
  vendorName: string;
  vendorAddress: string;
  vendorTaxId: string;
  customerName: string;
  customerAddress: string;
  currency: string;
  subtotal: string;
  taxAmount: string;
  totalAmount: string;
  notes: string;
  lineItems: LineItemFormValues[];
};
