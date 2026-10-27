import { ApiProperty } from "@nestjs/swagger";
import { Type } from "class-transformer";
import { ArrayMaxSize, IsArray, ValidateNested } from "class-validator";
import { ComposeBlockDto } from "./compose-block.dto.js";
import { ComposeDataDto } from "./compose-data.dto.js";

// An invoice designed in the builder: blocks placed on one A4 page, filled from `data`
export class ComposeInvoiceDto {
  @ApiProperty({ type: [ComposeBlockDto] })
  @IsArray()
  @ArrayMaxSize(100)
  @ValidateNested({ each: true })
  @Type(() => ComposeBlockDto)
  blocks!: ComposeBlockDto[];

  @ApiProperty({ type: ComposeDataDto })
  @ValidateNested()
  @Type(() => ComposeDataDto)
  data!: ComposeDataDto;
}
