import { ApiProperty } from "@nestjs/swagger";
import { ChatMessageDto } from "./chat-message.dto.js";
import { ConversationDto } from "./conversation.dto.js";

export class ConversationDetailDto {
  @ApiProperty({ type: ConversationDto })
  conversation!: ConversationDto;

  @ApiProperty({ type: [ChatMessageDto] })
  messages!: ChatMessageDto[];
}
