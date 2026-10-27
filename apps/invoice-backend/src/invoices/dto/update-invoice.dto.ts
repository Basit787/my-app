import { ApiPropertyOptional } from "@nestjs/swagger";
import { Type } from "class-transformer";
import {
  ArrayMaxSize,
  IsArray,
  IsNumber,
  IsOptional,
  IsString,
  Matches,
  MaxLength,
  ValidateNested,
} from "class-validator";
import { LineItemDto } from "./line-item.dto.js";

const ISO_DATE = /^\d{4}-\d{2}-\d{2}$/;

// Fields corrected by the user; a missing key stays as it is, null clears it
export class UpdateInvoiceDto {
  @ApiPropertyOptional({ type: String, nullable: true })
  @IsOptional()
  @IsString()
  @MaxLength(100)
  invoiceNumber?: string | null;

  @ApiPropertyOptional({ type: String, nullable: true, example: "2024-03-05" })
  @IsOptional()
  @Matches(ISO_DATE, { message: "invoiceDate must be YYYY-MM-DD" })
  invoiceDate?: string | null;

  @ApiPropertyOptional({ type: String, nullable: true, example: "2024-04-04" })
  @IsOptional()
  @Matches(ISO_DATE, { message: "dueDate must be YYYY-MM-DD" })
  dueDate?: string | null;

  @ApiPropertyOptional({ type: String, nullable: true })
  @IsOptional()
  @IsString()
  @MaxLength(255)
  vendorName?: string | null;

  @ApiPropertyOptional({ type: String, nullable: true })
  @IsOptional()
  @IsString()
  @MaxLength(500)
  vendorAddress?: string | null;

  @ApiPropertyOptional({ type: String, nullable: true })
  @IsOptional()
  @IsString()
  @MaxLength(100)
  vendorTaxId?: string | null;

  @ApiPropertyOptional({ type: String, nullable: true })
  @IsOptional()
  @IsString()
  @MaxLength(255)
  customerName?: string | null;

  @ApiPropertyOptional({ type: String, nullable: true })
  @IsOptional()
  @IsString()
  @MaxLength(500)
  customerAddress?: string | null;

  @ApiPropertyOptional({ type: String, nullable: true, example: "USD" })
  @IsOptional()
  @Matches(/^[A-Z]{3}$/, { message: "currency must be a 3-letter code such as USD" })
  currency?: string | null;

  @ApiPropertyOptional({ type: Number, nullable: true })
  @IsOptional()
  @IsNumber()
  subtotal?: number | null;

  @ApiPropertyOptional({ type: Number, nullable: true })
  @IsOptional()
  @IsNumber()
  taxAmount?: number | null;

  @ApiPropertyOptional({ type: Number, nullable: true })
  @IsOptional()
  @IsNumber()
  totalAmount?: number | null;

  @ApiPropertyOptional({ type: [LineItemDto] })
  @IsOptional()
  @IsArray()
  @ArrayMaxSize(500)
  @ValidateNested({ each: true })
  @Type(() => LineItemDto)
  lineItems?: LineItemDto[];

  @ApiPropertyOptional({ type: String, nullable: true })
  @IsOptional()
  @IsString()
  @MaxLength(5000)
  notes?: string | null;
}
