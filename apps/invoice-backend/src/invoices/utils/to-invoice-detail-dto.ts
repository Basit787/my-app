import type { Invoice } from "@app/db";
import type { InvoiceDetailDto } from "../dto/invoice-detail.dto.js";
import { toInvoiceDto } from "./to-invoice-dto.js";

export const toInvoiceDetailDto = (invoice: Invoice): InvoiceDetailDto => ({
  ...toInvoiceDto(invoice),
  extractedText: invoice.extractedText,
});
