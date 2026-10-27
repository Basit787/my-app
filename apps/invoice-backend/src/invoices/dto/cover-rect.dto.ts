import { ApiProperty } from "@nestjs/swagger";
import { RectDto } from "./rect.dto.js";

// A box filled with the paper colour behind the old text
export class CoverRectDto extends RectDto {
  @ApiProperty({ example: "#ffffff" })
  color!: string;
}
