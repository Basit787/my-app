import type { InvoiceDto } from "../dto/invoice.dto.js";
import type { InvoiceFields } from "../types/invoice-fields.js";

// The editable fields of a reply, to compare with the fields as first read
export const pickInvoiceFields = (invoice: InvoiceDto): InvoiceFields => ({
  invoiceNumber: invoice.invoiceNumber,
  invoiceDate: invoice.invoiceDate,
  dueDate: invoice.dueDate,
  vendorName: invoice.vendorName,
  vendorAddress: invoice.vendorAddress,
  vendorTaxId: invoice.vendorTaxId,
  customerName: invoice.customerName,
  customerAddress: invoice.customerAddress,
  currency: invoice.currency,
  subtotal: invoice.subtotal,
  taxAmount: invoice.taxAmount,
  totalAmount: invoice.totalAmount,
  lineItems: invoice.lineItems.map(({ description, quantity, unitPrice, amount }) => ({
    description,
    quantity,
    unitPrice,
    amount,
  })),
});
