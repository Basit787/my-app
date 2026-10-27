import { ApiProperty } from "@nestjs/swagger";

// Multipart body of POST /invoices/upload: one PDF, XML or image file under `file`
export class UploadInvoiceDto {
  @ApiProperty({ type: "string", format: "binary" })
  file?: unknown;
}
