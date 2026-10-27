import { ApiProperty } from "@nestjs/swagger";
import { LineItemDto } from "./line-item.dto.js";

export class InvoiceDto {
  @ApiProperty({ format: "uuid" })
  id!: string;

  @ApiProperty({ example: "invoice-2024-031.pdf" })
  filename!: string;

  @ApiProperty({ example: "application/pdf" })
  contentType!: string;

  @ApiProperty({ example: 184320 })
  size!: number;

  @ApiProperty({ enum: ["UPLOADED", "PROCESSING", "COMPLETED", "FAILED"] })
  status!: "UPLOADED" | "PROCESSING" | "COMPLETED" | "FAILED";

  @ApiProperty({ enum: ["XML", "TEXT", "OCR"], nullable: true, description: "How the fields were read" })
  source!: "XML" | "TEXT" | "OCR" | null;

  @ApiProperty({ type: Number, nullable: true })
  pageCount!: number | null;

  @ApiProperty({ type: String, nullable: true, description: "Why the last extraction failed" })
  error!: string | null;

  @ApiProperty({ type: String, nullable: true, example: "INV-2024-031" })
  invoiceNumber!: string | null;

  @ApiProperty({ type: String, nullable: true, example: "2024-03-05" })
  invoiceDate!: string | null;

  @ApiProperty({ type: String, nullable: true, example: "2024-04-04" })
  dueDate!: string | null;

  @ApiProperty({ type: String, nullable: true })
  vendorName!: string | null;

  @ApiProperty({ type: String, nullable: true })
  vendorAddress!: string | null;

  @ApiProperty({ type: String, nullable: true })
  vendorTaxId!: string | null;

  @ApiProperty({ type: String, nullable: true })
  customerName!: string | null;

  @ApiProperty({ type: String, nullable: true })
  customerAddress!: string | null;

  @ApiProperty({ type: String, nullable: true, example: "USD" })
  currency!: string | null;

  @ApiProperty({ type: Number, nullable: true })
  subtotal!: number | null;

  @ApiProperty({ type: Number, nullable: true })
  taxAmount!: number | null;

  @ApiProperty({ type: Number, nullable: true })
  totalAmount!: number | null;

  @ApiProperty({ type: [LineItemDto] })
  lineItems!: LineItemDto[];

  @ApiProperty({ type: String, nullable: true })
  notes!: string | null;

  @ApiProperty({ type: String, format: "date-time", nullable: true, description: "Set while the invoice is archived" })
  archivedAt!: string | null;

  @ApiProperty({ format: "date-time" })
  createdAt!: string;

  @ApiProperty({ format: "date-time" })
  updatedAt!: string;
}
