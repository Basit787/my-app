import { ApiProperty } from "@nestjs/swagger";
import { InvoiceDto } from "./invoice.dto.js";

// One invoice with the text read from its file, for checking the fields against it
export class InvoiceDetailDto extends InvoiceDto {
  @ApiProperty({ type: String, nullable: true })
  extractedText!: string | null;
}
