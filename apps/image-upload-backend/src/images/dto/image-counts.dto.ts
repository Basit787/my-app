import { ApiProperty } from "@nestjs/swagger";

// Totals behind the sidebar and tab-bar badges
export class ImageCountsDto {
  @ApiProperty({ example: 3 })
  active!: number;

  @ApiProperty({ example: 1 })
  scheduled!: number;

  @ApiProperty({ example: 1 })
  bin!: number;
}
