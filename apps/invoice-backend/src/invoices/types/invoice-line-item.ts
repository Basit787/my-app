// One billed line, as stored in `invoices.line_items`
export type InvoiceLineItem = {
  description: string;
  quantity: number | null;
  unitPrice: number | null;
  amount: number | null;
};
