import type { ChatMessageDto } from "../dto/chat-message.dto.js";
import type { ConversationDto } from "../dto/conversation.dto.js";

// One line of the NDJSON reply stream (POST /conversations/:id/messages)
export type ChatStreamEvent =
  | { type: "conversation"; conversation: ConversationDto }
  | { type: "delta"; text: string }
  | { type: "done"; message: ChatMessageDto; conversation: ConversationDto }
  | { type: "error"; error: string };
