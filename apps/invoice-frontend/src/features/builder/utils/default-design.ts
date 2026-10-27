import type { BuilderBlock } from "../types/builder-block";
import type { BuilderData } from "../types/builder-data";
import { createBlock } from "./create-block";

const isoDate = (offsetDays: number) => {
  const date = new Date();
  date.setDate(date.getDate() + offsetDays);
  return date.toISOString().slice(0, 10);
};

// What a new invoice starts from: a classic layout the user can rearrange, extend or clear
export const defaultDesign = (): { blocks: BuilderBlock[]; data: BuilderData } => {
  const title = createBlock("title", 300, 45);
  const blocks = [
    createBlock("logo", 50, 40),
    { ...title, style: { ...title.style, align: "right" as const } },
    createBlock("details", 300, 90),
    createBlock("from", 50, 150),
    createBlock("billTo", 315, 150),
    createBlock("lineItems", 50, 250),
    createBlock("totals", 300, 380),
    createBlock("notes", 50, 470),
  ];
  const data: BuilderData = {
    invoiceNumber: "INV-0001",
    invoiceDate: isoDate(0),
    dueDate: isoDate(30),
    currency: "USD",
    vendorName: "",
    vendorAddress: "",
    vendorTaxId: "",
    customerName: "",
    customerAddress: "",
    taxRate: 0,
    notes: "Thank you for your business.",
    lineItems: [{ description: "Service", quantity: 1, unitPrice: 100 }],
  };
  return { blocks, data };
};
