import { createApiError, readStreamParts, toApiError } from "frontend-common";
import { apiClient } from "@/lib/api-client";
import { invoiceEndpoints } from "./endpoint";

// Mirrors LineItemDto in apps/invoice-backend/src/invoices/dto/line-item.dto.ts
export type InvoiceLineItem = {
  description: string;
  quantity: number | null;
  unitPrice: number | null;
  amount: number | null;
};

// Mirrors InvoiceDto in apps/invoice-backend/src/invoices/dto/invoice.dto.ts
export type Invoice = {
  id: string;
  filename: string;
  contentType: string;
  size: number;
  status: "UPLOADED" | "PROCESSING" | "COMPLETED" | "FAILED";
  source: "XML" | "TEXT" | "OCR" | null;
  pageCount: number | null;
  error: string | null;
  invoiceNumber: string | null;
  invoiceDate: string | null;
  dueDate: string | null;
  vendorName: string | null;
  vendorAddress: string | null;
  vendorTaxId: string | null;
  customerName: string | null;
  customerAddress: string | null;
  currency: string | null;
  subtotal: number | null;
  taxAmount: number | null;
  totalAmount: number | null;
  lineItems: InvoiceLineItem[];
  notes: string | null;
  archivedAt: string | null;
  createdAt: string;
  updatedAt: string;
};

// Mirrors InvoiceDetailDto in apps/invoice-backend/src/invoices/dto/invoice-detail.dto.ts
export type InvoiceDetail = Invoice & { extractedText: string | null };

// Mirrors UpdateInvoiceDto: a missing key stays as it is, null clears it
export type InvoiceUpdate = Partial<
  Omit<
    Invoice,
    "id" | "filename" | "contentType" | "size" | "status" | "source" | "pageCount" | "error" | "createdAt" | "updatedAt"
  >
>;

// Mirrors EditPlacementDto in apps/invoice-backend/src/invoices/dto/edit-placement.dto.ts (page units, top-left origin)
export type EditPlacement = {
  field: string;
  page: number;
  cover: { x: number; y: number; width: number; height: number; color: string }[];
  lines: string[];
  x: number;
  y: number;
  align: "left" | "right";
  fontSize: number;
  font: "sans" | "serif" | "mono";
  bold: boolean;
  italic: boolean;
  color: string;
  boxHeight: number;
  lineHeight: number;
};

// Mirrors EditPlanDto in apps/invoice-backend/src/invoices/dto/edit-plan.dto.ts
export type EditPlan = {
  supported: boolean;
  reason: string | null;
  pages: { width: number; height: number }[];
  placements: EditPlacement[];
  unplaced: string[];
};

export const fetchInvoices = async (): Promise<Invoice[]> => {
  try {
    const response = await apiClient.get<Invoice[]>(invoiceEndpoints.list());
    if (!response.ok) throw createApiError(response.message, response.status);
    return response.data;
  } catch (error) {
    throw toApiError(error, "Failed to load invoices");
  }
};

export const fetchInvoice = async (id: string): Promise<InvoiceDetail> => {
  try {
    const response = await apiClient.get<InvoiceDetail>(invoiceEndpoints.detail(id));
    if (!response.ok) throw createApiError(response.message, response.status);
    return response.data;
  } catch (error) {
    throw toApiError(error, "Failed to load the invoice");
  }
};

export const downloadInvoiceFile = async (id: string): Promise<Blob> => {
  try {
    const response = await apiClient.getBlob(invoiceEndpoints.file(id));
    if (!response.ok) throw createApiError(response.message, response.status);
    return response.data;
  } catch (error) {
    throw toApiError(error, "Failed to load the invoice file");
  }
};

// One page of an uploaded PDF as a JPEG image
export const downloadInvoicePage = async (id: string, page: number): Promise<Blob> => {
  try {
    const response = await apiClient.getBlob(invoiceEndpoints.page(id, page));
    if (!response.ok) throw createApiError(response.message, response.status);
    return response.data;
  } catch (error) {
    throw toApiError(error, "Failed to load the page");
  }
};

// A PDF generated from the current fields, including the user's corrections
export const downloadInvoicePdf = async (id: string): Promise<Blob> => {
  try {
    const response = await apiClient.getBlob(invoiceEndpoints.pdf(id));
    if (!response.ok) throw createApiError(response.message, response.status);
    return response.data;
  } catch (error) {
    throw toApiError(error, "Failed to generate the invoice PDF");
  }
};

// Where the form's current values would be drawn on the original; nothing is saved
export const fetchEditPlan = async (id: string, changes: InvoiceUpdate): Promise<EditPlan> => {
  try {
    const response = await apiClient.post<EditPlan>(invoiceEndpoints.editPlan(id), changes);
    if (!response.ok) throw createApiError(response.message, response.status);
    return response.data;
  } catch (error) {
    throw toApiError(error, "Failed to preview the changes");
  }
};

// A PDF with the form's unsaved changes applied, for downloading what the user sees; nothing is saved
export const downloadInvoicePdfWithChanges = async (id: string, changes: InvoiceUpdate): Promise<Blob> => {
  try {
    const response = await apiClient.requestRaw<Blob>({
      method: "POST",
      url: invoiceEndpoints.pdf(id),
      data: changes,
      responseType: "blob",
    });
    return response.data;
  } catch (error) {
    throw toApiError(error, "Failed to generate the invoice PDF");
  }
};

export const uploadInvoice = async (file: File): Promise<Invoice> => {
  const body = new FormData();
  body.append("file", file);
  try {
    const response = await apiClient.postForm<Invoice>(invoiceEndpoints.upload(), body);
    if (!response.ok) throw createApiError(response.message, response.status);
    return response.data;
  } catch (error) {
    throw toApiError(error, "Failed to upload invoice");
  }
};

export const updateInvoice = async ({ id, changes }: { id: string; changes: InvoiceUpdate }): Promise<Invoice> => {
  try {
    const response = await apiClient.patch<Invoice>(invoiceEndpoints.detail(id), changes);
    if (!response.ok) throw createApiError(response.message, response.status);
    return response.data;
  } catch (error) {
    throw toApiError(error, "Failed to save the invoice");
  }
};

// Reads the file again; replaces the current fields
export const reextractInvoice = async (id: string): Promise<Invoice> => {
  try {
    const response = await apiClient.post<Invoice>(invoiceEndpoints.extract(id));
    if (!response.ok) throw createApiError(response.message, response.status);
    return response.data;
  } catch (error) {
    throw toApiError(error, "Failed to read the invoice again");
  }
};

export const archiveInvoice = async (id: string): Promise<Invoice> => {
  try {
    const response = await apiClient.post<Invoice>(invoiceEndpoints.archive(id));
    if (!response.ok) throw createApiError(response.message, response.status);
    return response.data;
  } catch (error) {
    throw toApiError(error, "Failed to archive invoice");
  }
};

export const restoreInvoice = async (id: string): Promise<Invoice> => {
  try {
    const response = await apiClient.post<Invoice>(invoiceEndpoints.restore(id));
    if (!response.ok) throw createApiError(response.message, response.status);
    return response.data;
  } catch (error) {
    throw toApiError(error, "Failed to restore invoice");
  }
};

export const deleteInvoice = async (id: string): Promise<void> => {
  try {
    const response = await apiClient.delete<{ message: string }>(invoiceEndpoints.detail(id));
    if (!response.ok) throw createApiError(response.message, response.status);
  } catch (error) {
    throw toApiError(error, "Failed to delete invoice");
  }
};

// Mirrors InvoiceEvent in apps/invoice-backend/src/invoices/types/invoice-event.ts
export type InvoiceEvent = { type: "invoice.updated"; invoice: Invoice } | { type: "invoice.deleted"; id: string };

// One event block ("data: {...}" lines); keep-alive pings (": ping") have no data and give null
const parseEventBlock = (block: string): InvoiceEvent | null => {
  const dataLines = block
    .split("\n")
    .filter((line) => line.startsWith("data:"))
    .map((line) => line.slice("data:".length).trim());
  if (dataLines.length === 0) return null;
  return JSON.parse(dataLines.join("\n")) as InvoiceEvent;
};

// Reads the server-sent event stream until it closes or `signal` aborts.
// Not EventSource: it cannot send the bearer token, apiClient can.
export const streamInvoiceEvents = async (
  signal: AbortSignal,
  onOpen: () => void,
  onEvent: (event: InvoiceEvent) => void,
) => {
  try {
    const response = await apiClient.requestRaw<ReadableStream<Uint8Array>>({
      url: invoiceEndpoints.events(),
      adapter: "fetch",
      responseType: "stream",
      timeout: 0,
      signal,
    });
    onOpen();

    // Events end with a blank line
    await readStreamParts(response.data, "\n\n", (block) => {
      const event = parseEventBlock(block);
      if (event) onEvent(event);
    });
  } catch (error) {
    throw toApiError(error, "Invoice events disconnected");
  }
};
