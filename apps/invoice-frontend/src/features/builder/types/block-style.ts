// Mirrors ComposeBlockStyleDto in apps/invoice-backend/src/invoices/dto/compose-block-style.dto.ts
export type BlockStyle = {
  fontSize: number;
  color: string;
  bold: boolean;
  italic: boolean;
  align: "left" | "center" | "right";
  font: "sans" | "serif" | "mono";
};
