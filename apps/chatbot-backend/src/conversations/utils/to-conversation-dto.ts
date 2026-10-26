import type { Conversation } from "@app/db";
import type { ConversationDto } from "../dto/conversation.dto.js";

export const toConversationDto = (conversation: Conversation): ConversationDto => ({
  id: conversation.id,
  title: conversation.title,
  createdAt: conversation.createdAt.toISOString(),
  updatedAt: conversation.updatedAt.toISOString(),
});
