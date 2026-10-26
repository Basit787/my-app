import { ApiProperty } from "@nestjs/swagger";
import { ImageDto } from "./image.dto.js";

export class ImagePageDto {
  @ApiProperty({ type: [ImageDto] })
  images!: ImageDto[];

  @ApiProperty({ example: 12 })
  total!: number;

  @ApiProperty({ example: 1 })
  page!: number;

  @ApiProperty({ example: 10 })
  pageSize!: number;
}
