import { ApiProperty } from "@nestjs/swagger";

// A box on a page, top-left origin, in the page's units
export class RectDto {
  @ApiProperty()
  x!: number;

  @ApiProperty()
  y!: number;

  @ApiProperty()
  width!: number;

  @ApiProperty()
  height!: number;
}
