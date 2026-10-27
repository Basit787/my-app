import { ApiProperty } from "@nestjs/swagger";
import { Type } from "class-transformer";
import { IsInt, IsUUID, Min } from "class-validator";

export class InvoicePageParamDto {
  @ApiProperty({ format: "uuid" })
  @IsUUID()
  invoiceId!: string;

  @ApiProperty({ example: 1, description: "1-based page number" })
  @Type(() => Number)
  @IsInt()
  @Min(1)
  page!: number;
}
