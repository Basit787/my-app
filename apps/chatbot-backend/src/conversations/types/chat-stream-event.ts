import type { ChatMessageDto } from "../dto/chat-message.dto.js";
import type { ConversationDto } from "../dto/conversation.dto.js";
import type { SourceDto } from "../dto/source.dto.js";

// One line of the NDJSON reply stream (POST /conversations/:id/messages)
export type ChatStreamEvent =
  | { type: "conversation"; conversation: ConversationDto }
  | { type: "sources"; sources: SourceDto[] }
  | { type: "tool"; name: string; input: string }
  | { type: "delta"; text: string }
  | { type: "done"; message: ChatMessageDto; conversation: ConversationDto }
  | { type: "error"; error: string };
