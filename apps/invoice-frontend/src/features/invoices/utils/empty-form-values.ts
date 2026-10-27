import type { InvoiceFormValues } from "../types/invoice-form-values";

// Shape for withForm's typing and for a brand-new form; real values come from toFormValues
export const EMPTY_FORM_VALUES: InvoiceFormValues = {
  invoiceNumber: "",
  invoiceDate: "",
  dueDate: "",
  vendorName: "",
  vendorAddress: "",
  vendorTaxId: "",
  customerName: "",
  customerAddress: "",
  currency: "",
  subtotal: "",
  taxAmount: "",
  totalAmount: "",
  notes: "",
  lineItems: [],
};
