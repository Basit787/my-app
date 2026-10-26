import { ApiProperty } from "@nestjs/swagger";

export class ChatMessageDto {
  @ApiProperty()
  id!: string;

  @ApiProperty({ enum: ["user", "assistant"] })
  role!: "user" | "assistant";

  @ApiProperty()
  content!: string;
}
