import type { BaseMessage } from "@langchain/core/messages";
import type { ChatMessageDto } from "../dto/chat-message.dto.js";

// LangChain "human"/"ai" messages as the user/assistant messages the client shows
export const toChatMessageDto = (message: BaseMessage, index: number): ChatMessageDto => ({
  id: message.id ?? `message-${index}`,
  role: message.type === "human" ? "user" : "assistant",
  content: message.text,
});
