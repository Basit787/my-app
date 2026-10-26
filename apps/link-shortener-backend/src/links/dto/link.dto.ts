import { ApiProperty } from "@nestjs/swagger";

// A link as the API returns it
export class LinkDto {
  @ApiProperty({ format: "uuid" })
  id!: string;

  @ApiProperty({ example: "abc123" })
  slug!: string;

  // Path on the link shortener that redirects to `url`
  @ApiProperty({ example: "/r/abc123" })
  shortPath!: string;

  @ApiProperty({ example: "https://example.com/a/very/long/path" })
  url!: string;

  @ApiProperty({ type: String, nullable: true })
  title!: string | null;

  @ApiProperty({ example: 12 })
  clickCount!: number;

  @ApiProperty({ type: String, format: "date-time", nullable: true })
  expiresAt!: string | null;

  @ApiProperty({ format: "date-time" })
  createdAt!: string;

  @ApiProperty({ format: "date-time" })
  updatedAt!: string;
}
