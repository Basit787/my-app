import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";
import { Type } from "class-transformer";
import {
  ArrayMaxSize,
  IsArray,
  IsNumber,
  IsOptional,
  IsString,
  Matches,
  Max,
  MaxLength,
  Min,
  ValidateNested,
} from "class-validator";
import { ComposeLineItemDto } from "./compose-line-item.dto.js";

const ISO_DATE = /^\d{4}-\d{2}-\d{2}$/;

// The invoice's own values; blocks show them (amounts are computed from the lines and the tax rate)
export class ComposeDataDto {
  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @MaxLength(100)
  invoiceNumber?: string;

  @ApiPropertyOptional({ example: "2024-03-05" })
  @IsOptional()
  @Matches(ISO_DATE, { message: "invoiceDate must be YYYY-MM-DD" })
  invoiceDate?: string;

  @ApiPropertyOptional({ example: "2024-04-04" })
  @IsOptional()
  @Matches(ISO_DATE, { message: "dueDate must be YYYY-MM-DD" })
  dueDate?: string;

  @ApiProperty({ example: "USD" })
  @Matches(/^[A-Z]{3}$/, { message: "currency must be a 3-letter code such as USD" })
  currency!: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @MaxLength(255)
  vendorName?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @MaxLength(500)
  vendorAddress?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @MaxLength(100)
  vendorTaxId?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @MaxLength(255)
  customerName?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @MaxLength(500)
  customerAddress?: string;

  @ApiProperty({ example: 10, description: "Tax in percent of the subtotal" })
  @IsNumber()
  @Min(0)
  @Max(100)
  taxRate!: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @MaxLength(5000)
  notes?: string;

  @ApiProperty({ type: [ComposeLineItemDto] })
  @IsArray()
  @ArrayMaxSize(200)
  @ValidateNested({ each: true })
  @Type(() => ComposeLineItemDto)
  lineItems!: ComposeLineItemDto[];
}
