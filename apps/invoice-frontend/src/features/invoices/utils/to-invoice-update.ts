import type { InvoiceUpdate } from "../api/api";
import type { InvoiceFormValues } from "../types/invoice-form-values";

const text = (value: string) => value.trim() || null;
const number = (value: string) => (value.trim() === "" ? null : Number(value));

// Form values as the PATCH body; empty fields are sent as null to clear them
export const toInvoiceUpdate = (values: InvoiceFormValues): InvoiceUpdate => ({
  invoiceNumber: text(values.invoiceNumber),
  invoiceDate: text(values.invoiceDate),
  dueDate: text(values.dueDate),
  vendorName: text(values.vendorName),
  vendorAddress: text(values.vendorAddress),
  vendorTaxId: text(values.vendorTaxId),
  customerName: text(values.customerName),
  customerAddress: text(values.customerAddress),
  currency: text(values.currency.toUpperCase()),
  subtotal: number(values.subtotal),
  taxAmount: number(values.taxAmount),
  totalAmount: number(values.totalAmount),
  notes: text(values.notes),
  lineItems: values.lineItems
    .filter((line) => line.description.trim() || line.amount.trim())
    .map((line) => ({
      description: line.description.trim(),
      quantity: number(line.quantity),
      unitPrice: number(line.unitPrice),
      amount: number(line.amount),
    })),
});
