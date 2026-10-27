import type { InvoiceDto } from "../dto/invoice.dto.js";
import type { UpdateInvoiceDto } from "../dto/update-invoice.dto.js";

// The invoice as it would be with `changes` saved; keys the client didn't send are undefined class fields and stay as stored
export const applyChanges = (invoice: InvoiceDto, changes: UpdateInvoiceDto): InvoiceDto => {
  const sent = Object.fromEntries(Object.entries(changes).filter(([, value]) => value !== undefined));
  return { ...invoice, ...sent };
};
