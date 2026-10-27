import { ApiProperty } from "@nestjs/swagger";
import { IsBoolean, IsIn, IsNumber, Matches, Max, Min } from "class-validator";

export class ComposeBlockStyleDto {
  @ApiProperty({ example: 11 })
  @IsNumber()
  @Min(4)
  @Max(96)
  fontSize!: number;

  @ApiProperty({ example: "#111111" })
  @Matches(/^#[0-9a-fA-F]{6}$/)
  color!: string;

  @ApiProperty()
  @IsBoolean()
  bold!: boolean;

  @ApiProperty()
  @IsBoolean()
  italic!: boolean;

  @ApiProperty({ enum: ["left", "center", "right"] })
  @IsIn(["left", "center", "right"])
  align!: "left" | "center" | "right";

  @ApiProperty({ enum: ["sans", "serif", "mono"] })
  @IsIn(["sans", "serif", "mono"])
  font!: "sans" | "serif" | "mono";
}
