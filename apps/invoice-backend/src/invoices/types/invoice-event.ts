import type { InvoiceDto } from "../dto/invoice.dto.js";

// Pushed to the owner's event streams; the frontend drops `invoice` straight into its list
export type InvoiceEvent = { type: "invoice.updated"; invoice: InvoiceDto } | { type: "invoice.deleted"; id: string };
