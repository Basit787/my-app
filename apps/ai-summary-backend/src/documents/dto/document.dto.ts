import { ApiProperty } from "@nestjs/swagger";

export class DocumentDto {
  @ApiProperty({ format: "uuid" })
  id!: string;

  @ApiProperty({ example: "meeting-notes.txt" })
  filename!: string;

  @ApiProperty({ example: 2048 })
  size!: number;

  @ApiProperty({ enum: ["UPLOADED", "PROCESSING", "COMPLETED", "FAILED"] })
  status!: "UPLOADED" | "PROCESSING" | "COMPLETED" | "FAILED";

  @ApiProperty({ type: String, nullable: true })
  summary!: string | null;

  @ApiProperty({ format: "date-time" })
  createdAt!: string;

  @ApiProperty({ format: "date-time" })
  updatedAt!: string;
}
