import { ApiProperty } from "@nestjs/swagger";
import { ConversationDto } from "./conversation.dto.js";

export class ConversationListDto {
  @ApiProperty({ type: [ConversationDto] })
  conversations!: ConversationDto[];
}
