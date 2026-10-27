import { ApiProperty } from "@nestjs/swagger";
import { IsNumber, IsString, MaxLength } from "class-validator";

export class ComposeLineItemDto {
  @ApiProperty({ example: "Consulting, March" })
  @IsString()
  @MaxLength(500)
  description!: string;

  @ApiProperty({ example: 10 })
  @IsNumber()
  quantity!: number;

  @ApiProperty({ example: 95 })
  @IsNumber()
  unitPrice!: number;
}
