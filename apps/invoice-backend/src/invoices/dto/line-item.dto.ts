import { ApiProperty } from "@nestjs/swagger";
import { IsNumber, IsOptional, IsString, MaxLength } from "class-validator";

export class LineItemDto {
  @ApiProperty({ example: "Consulting, March" })
  @IsString()
  @MaxLength(500)
  description!: string;

  @ApiProperty({ type: Number, nullable: true, example: 10 })
  @IsOptional()
  @IsNumber()
  quantity!: number | null;

  @ApiProperty({ type: Number, nullable: true, example: 95 })
  @IsOptional()
  @IsNumber()
  unitPrice!: number | null;

  @ApiProperty({ type: Number, nullable: true, example: 950 })
  @IsOptional()
  @IsNumber()
  amount!: number | null;
}
