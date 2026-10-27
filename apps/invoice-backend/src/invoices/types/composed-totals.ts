// Amounts of a builder invoice, computed from its lines and tax rate
export type ComposedTotals = {
  subtotal: number;
  taxAmount: number;
  totalAmount: number;
};
