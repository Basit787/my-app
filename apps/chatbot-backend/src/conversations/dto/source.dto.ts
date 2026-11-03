import { ApiProperty } from "@nestjs/swagger";

export class SourceDto {
  @ApiProperty({ format: "uuid" })
  documentId!: string;

  @ApiProperty({ example: "handbook.pdf" })
  fileName!: string;

  @ApiProperty({ description: "The document chunk the answer was based on" })
  excerpt!: string;
}
