import { ApiProperty } from "@nestjs/swagger";

export class DocumentDto {
  @ApiProperty({ format: "uuid" })
  id!: string;

  @ApiProperty({ example: "handbook.pdf" })
  fileName!: string;

  @ApiProperty({ example: "application/pdf" })
  contentType!: string;

  @ApiProperty({ description: "Bytes" })
  size!: number;

  @ApiProperty({ description: "Text chunks stored in the vector database" })
  chunkCount!: number;

  @ApiProperty({ format: "date-time" })
  createdAt!: string;
}
