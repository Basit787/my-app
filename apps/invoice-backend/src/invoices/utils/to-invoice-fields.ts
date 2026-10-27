import type { InvoiceFields } from "../types/invoice-fields.js";
import { toAmount } from "./to-amount.js";
import { toCurrency } from "./to-currency.js";
import { toIsoDate } from "./to-iso-date.js";
import { toLineItem } from "./to-line-item.js";
import { toText } from "./to-text.js";

// The model's JSON as typed fields; every value is checked, so a wrong type becomes null instead of bad data
export const toInvoiceFields = (raw: Record<string, unknown>): InvoiceFields => {
  const rawLines = Array.isArray(raw.lineItems) ? raw.lineItems : [];
  const lineItems = rawLines
    .filter((line): line is Record<string, unknown> => !!line && typeof line === "object")
    .map(toLineItem)
    .filter((line) => line.description || line.amount !== null);

  return {
    invoiceNumber: toText(raw.invoiceNumber, 100),
    invoiceDate: toIsoDate(raw.invoiceDate),
    dueDate: toIsoDate(raw.dueDate),
    vendorName: toText(raw.vendorName, 255),
    vendorAddress: toText(raw.vendorAddress, 500),
    vendorTaxId: toText(raw.vendorTaxId, 100),
    customerName: toText(raw.customerName, 255),
    customerAddress: toText(raw.customerAddress, 500),
    currency: toCurrency(raw.currency),
    subtotal: toAmount(raw.subtotal),
    taxAmount: toAmount(raw.taxAmount),
    totalAmount: toAmount(raw.totalAmount),
    lineItems,
  };
};
