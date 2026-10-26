import { ApiProperty } from "@nestjs/swagger";

export class ConversationDto {
  @ApiProperty({ format: "uuid" })
  id!: string;

  @ApiProperty({ example: "How do I make pasta?" })
  title!: string;

  @ApiProperty({ format: "date-time" })
  createdAt!: string;

  @ApiProperty({ format: "date-time" })
  updatedAt!: string;
}
