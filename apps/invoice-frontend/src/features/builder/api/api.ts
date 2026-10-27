import { createApiError, toApiError } from "frontend-common";
import type { Invoice } from "@/features/invoices/api/api";
import { apiClient } from "@/lib/api-client";
import type { BuilderBlock } from "../types/builder-block";
import type { BuilderData } from "../types/builder-data";
import { builderEndpoints } from "./endpoint";

// Mirrors ComposeInvoiceDto in apps/invoice-backend/src/invoices/dto/compose-invoice.dto.ts
export type ComposeInvoice = { blocks: BuilderBlock[]; data: BuilderData };

// Empty optional texts are left out, so the backend's optional checks (dates, lengths) skip them
const toBody = ({ blocks, data }: ComposeInvoice) => ({
  blocks,
  data: Object.fromEntries(Object.entries(data).filter(([, value]) => value !== "")),
});

// Saves the design as a new invoice in the list
export const composeInvoice = async (design: ComposeInvoice): Promise<Invoice> => {
  try {
    const response = await apiClient.post<Invoice>(builderEndpoints.compose(), toBody(design));
    if (!response.ok) throw createApiError(response.message, response.status);
    return response.data;
  } catch (error) {
    throw toApiError(error, "Failed to save the invoice");
  }
};

// The design as a PDF, without saving it
export const downloadComposedPdf = async (design: ComposeInvoice): Promise<Blob> => {
  try {
    const response = await apiClient.requestRaw<Blob>({
      method: "POST",
      url: builderEndpoints.composePdf(),
      data: toBody(design),
      responseType: "blob",
    });
    return response.data;
  } catch (error) {
    throw toApiError(error, "Failed to create the PDF");
  }
};
