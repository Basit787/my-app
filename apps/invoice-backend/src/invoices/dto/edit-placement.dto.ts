import { ApiProperty } from "@nestjs/swagger";
import { CoverRectDto } from "./cover-rect.dto.js";

// New text over an old value on the original
export class EditPlacementDto {
  @ApiProperty({ example: "Due date" })
  field!: string;

  @ApiProperty({ description: "0-based page index" })
  page!: number;

  @ApiProperty({ type: [CoverRectDto], description: "Boxes filled with the paper colour first" })
  cover!: CoverRectDto[];

  @ApiProperty({ type: [String] })
  lines!: string[];

  @ApiProperty({ description: "Left edge, or right edge when align is right" })
  x!: number;

  @ApiProperty({ description: "Top of the first line" })
  y!: number;

  @ApiProperty({ enum: ["left", "right"] })
  align!: "left" | "right";

  @ApiProperty()
  fontSize!: number;

  @ApiProperty({ enum: ["sans", "serif", "mono"], description: "Closest standard font: Helvetica, Times, Courier" })
  font!: "sans" | "serif" | "mono";

  @ApiProperty()
  bold!: boolean;

  @ApiProperty()
  italic!: boolean;

  @ApiProperty({ example: "#000000" })
  color!: string;

  @ApiProperty()
  boxHeight!: number;

  @ApiProperty()
  lineHeight!: number;
}
