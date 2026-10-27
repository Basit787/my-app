// Same numbers as apps/invoice-backend/src/invoices/utils/render-composed-pdf.ts, so the canvas matches the PDF
export const BUILDER_LOOK = {
  lineHeight: 1.25,
  labelColor: "#666666",
  labelScale: 0.8,
  nameScale: 1.1,
  totalScale: 1.15,
  // Line items columns as shares of the block width: description, quantity, unit price, amount
  columns: [0.5, 0.12, 0.19, 0.19],
  fontFamilies: {
    sans: "Helvetica, Arial, 'Liberation Sans', sans-serif",
    serif: "'Times New Roman', Times, 'Liberation Serif', serif",
    mono: "'Courier New', Courier, 'Liberation Mono', monospace",
  },
};
