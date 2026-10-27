import { ApiProperty } from "@nestjs/swagger";

// A page's size in the units of the placements (points for PDFs, pixels for images)
export class PageSizeDto {
  @ApiProperty({ example: 595.28 })
  width!: number;

  @ApiProperty({ example: 841.89 })
  height!: number;
}
