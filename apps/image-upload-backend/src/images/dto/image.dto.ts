import { ApiProperty } from "@nestjs/swagger";

export class ImageDto {
  @ApiProperty({ format: "uuid" })
  id!: string;

  @ApiProperty({ example: "sunrise.png" })
  name!: string;

  @ApiProperty({ example: "image/png" })
  mimeType!: string;

  @ApiProperty({ example: 52431 })
  size!: number;

  @ApiProperty({ enum: ["scheduled", "active"] })
  status!: "scheduled" | "active";

  @ApiProperty({ type: String, format: "date-time", nullable: true })
  scheduledAt!: string | null;

  @ApiProperty({ type: String, format: "date-time", nullable: true })
  deletedAt!: string | null;

  // When a binned image is deleted for good
  @ApiProperty({ type: String, format: "date-time", nullable: true })
  purgeAt!: string | null;

  @ApiProperty({ format: "date-time" })
  createdAt!: string;
}
