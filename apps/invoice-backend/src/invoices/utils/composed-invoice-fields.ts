import type { ComposeDataDto } from "../dto/compose-data.dto.js";
import type { InvoiceFields } from "../types/invoice-fields.js";
import { computeComposedTotals } from "./compute-composed-totals.js";

const textOrNull = (value: string | undefined) => value?.trim() || null;

// The builder's values as invoice fields: known exactly, so the file is never sent to the model
export const composedInvoiceFields = (data: ComposeDataDto): InvoiceFields => ({
  invoiceNumber: textOrNull(data.invoiceNumber),
  invoiceDate: textOrNull(data.invoiceDate),
  dueDate: textOrNull(data.dueDate),
  vendorName: textOrNull(data.vendorName),
  vendorAddress: textOrNull(data.vendorAddress),
  vendorTaxId: textOrNull(data.vendorTaxId),
  customerName: textOrNull(data.customerName),
  customerAddress: textOrNull(data.customerAddress),
  currency: data.currency,
  ...computeComposedTotals(data),
  lineItems: data.lineItems.map((line) => ({
    description: line.description,
    quantity: line.quantity,
    unitPrice: line.unitPrice,
    amount: Math.round(line.quantity * line.unitPrice * 100) / 100,
  })),
});
