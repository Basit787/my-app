import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";
import { Type } from "class-transformer";
import { IsIn, IsNumber, IsOptional, IsString, Matches, Max, MaxLength, Min, ValidateNested } from "class-validator";
import type { ComposeBlockKind } from "../types/compose-block-kind.js";
import { COMPOSE_BLOCK_KINDS } from "../utils/compose-block-kinds.js";
import { ComposeBlockStyleDto } from "./compose-block-style.dto.js";

// One block placed on the A4 page, in points from the top-left corner (595 × 842)
export class ComposeBlockDto {
  @ApiProperty()
  @IsString()
  @MaxLength(64)
  id!: string;

  @ApiProperty({ enum: COMPOSE_BLOCK_KINDS })
  @IsIn(COMPOSE_BLOCK_KINDS)
  kind!: ComposeBlockKind;

  @ApiProperty()
  @IsNumber()
  @Min(0)
  @Max(595)
  x!: number;

  @ApiProperty()
  @IsNumber()
  @Min(0)
  @Max(842)
  y!: number;

  @ApiProperty()
  @IsNumber()
  @Min(10)
  @Max(595)
  width!: number;

  @ApiPropertyOptional({ description: "Logo and divider height" })
  @IsOptional()
  @IsNumber()
  @Min(0.5)
  @Max(842)
  height?: number;

  @ApiPropertyOptional({ description: "Title and text blocks" })
  @IsOptional()
  @IsString()
  @MaxLength(5000)
  text?: string;

  @ApiPropertyOptional({ description: "Logo as a PNG or JPEG data URL" })
  @IsOptional()
  @Matches(/^data:image\/(png|jpeg);base64,[A-Za-z0-9+/=]+$/, {
    message: "imageDataUrl must be a PNG or JPEG data URL",
  })
  @MaxLength(7_000_000)
  imageDataUrl?: string;

  @ApiProperty({ type: ComposeBlockStyleDto })
  @ValidateNested()
  @Type(() => ComposeBlockStyleDto)
  style!: ComposeBlockStyleDto;
}
