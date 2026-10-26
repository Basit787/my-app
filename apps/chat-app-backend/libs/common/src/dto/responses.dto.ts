import { ApiProperty } from "@nestjs/swagger";

export class ImageResponseDto {
  @ApiProperty({ example: "/api/profile/avatars/6650f1c2a1b2c3d4e5f60708?v=1729071234567" })
  image!: string;
}
