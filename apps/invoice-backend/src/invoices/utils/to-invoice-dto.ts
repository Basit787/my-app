import type { Invoice, Prisma } from "@app/db";
import type { InvoiceDto } from "../dto/invoice.dto.js";
import type { InvoiceLineItem } from "../types/invoice-line-item.js";

const toNumberOrNull = (value: Prisma.Decimal | null) => (value === null ? null : Number(value));

export const toInvoiceDto = (invoice: Invoice): InvoiceDto => ({
  id: invoice.id,
  filename: invoice.filename,
  contentType: invoice.contentType,
  size: invoice.size,
  status: invoice.status,
  source: invoice.source,
  pageCount: invoice.pageCount,
  error: invoice.error,
  invoiceNumber: invoice.invoiceNumber,
  invoiceDate: invoice.invoiceDate,
  dueDate: invoice.dueDate,
  vendorName: invoice.vendorName,
  vendorAddress: invoice.vendorAddress,
  vendorTaxId: invoice.vendorTaxId,
  customerName: invoice.customerName,
  customerAddress: invoice.customerAddress,
  currency: invoice.currency,
  subtotal: toNumberOrNull(invoice.subtotal),
  taxAmount: toNumberOrNull(invoice.taxAmount),
  totalAmount: toNumberOrNull(invoice.totalAmount),
  lineItems: Array.isArray(invoice.lineItems) ? (invoice.lineItems as InvoiceLineItem[]) : [],
  notes: invoice.notes,
  archivedAt: invoice.archivedAt?.toISOString() ?? null,
  createdAt: invoice.createdAt.toISOString(),
  updatedAt: invoice.updatedAt.toISOString(),
});
