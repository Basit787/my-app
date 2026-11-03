import type { Source } from "@app/agent";
import type { BaseMessage } from "@langchain/core/messages";
import type { ChatMessageDto } from "../dto/chat-message.dto.js";

export const toChatMessageDto = (message: BaseMessage, index: number): ChatMessageDto => {
  const id = message.id ?? `message-${index}`;
  if (message.type === "human") return { id, role: "user", content: message.text };
  const sources = (message.additional_kwargs.sources as Source[] | undefined) ?? [];
  return { id, role: "assistant", content: message.text, sources };
};
