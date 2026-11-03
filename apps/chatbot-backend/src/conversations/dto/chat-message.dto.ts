import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";
import { SourceDto } from "./source.dto.js";

export class ChatMessageDto {
  @ApiProperty()
  id!: string;

  @ApiProperty({ enum: ["user", "assistant"] })
  role!: "user" | "assistant";

  @ApiProperty()
  content!: string;

  @ApiPropertyOptional({ type: [SourceDto], description: "Assistant replies: the excerpts they were based on" })
  sources?: SourceDto[];
}
