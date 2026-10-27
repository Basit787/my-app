import type { BuilderLineItem } from "./builder-line-item";

// The invoice's values, shown by the blocks; mirrors ComposeDataDto
export type BuilderData = {
  invoiceNumber: string;
  invoiceDate: string;
  dueDate: string;
  currency: string;
  vendorName: string;
  vendorAddress: string;
  vendorTaxId: string;
  customerName: string;
  customerAddress: string;
  taxRate: number;
  notes: string;
  lineItems: BuilderLineItem[];
};
