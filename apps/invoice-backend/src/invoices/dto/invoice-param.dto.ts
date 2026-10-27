import { ApiProperty } from "@nestjs/swagger";
import { IsUUID } from "class-validator";

export class InvoiceParamDto {
  @ApiProperty({ format: "uuid" })
  @IsUUID()
  invoiceId!: string;
}
