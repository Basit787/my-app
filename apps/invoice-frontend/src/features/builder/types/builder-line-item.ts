// Mirrors ComposeLineItemDto; the amount is quantity × unit price
export type BuilderLineItem = {
  description: string;
  quantity: number;
  unitPrice: number;
};
