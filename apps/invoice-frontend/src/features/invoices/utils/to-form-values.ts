import type { Invoice } from "../api/api";
import type { InvoiceFormValues } from "../types/invoice-form-values";

const text = (value: string | null) => value ?? "";
const number = (value: number | null) => (value === null ? "" : String(value));

export const toFormValues = (invoice: Invoice): InvoiceFormValues => ({
  invoiceNumber: text(invoice.invoiceNumber),
  invoiceDate: text(invoice.invoiceDate),
  dueDate: text(invoice.dueDate),
  vendorName: text(invoice.vendorName),
  vendorAddress: text(invoice.vendorAddress),
  vendorTaxId: text(invoice.vendorTaxId),
  customerName: text(invoice.customerName),
  customerAddress: text(invoice.customerAddress),
  currency: text(invoice.currency),
  subtotal: number(invoice.subtotal),
  taxAmount: number(invoice.taxAmount),
  totalAmount: number(invoice.totalAmount),
  notes: text(invoice.notes),
  lineItems: invoice.lineItems.map((line) => ({
    description: line.description,
    quantity: number(line.quantity),
    unitPrice: number(line.unitPrice),
    amount: number(line.amount),
  })),
});
