import { AIMessage, type BaseMessage } from "@langchain/core/messages";
import type { ChatStreamPart } from "../types/chat-stream-part.js";

export const toolCallsOf = (messages: BaseMessage[] | undefined): ChatStreamPart[] => {
  const parts: ChatStreamPart[] = [];
  for (const message of messages ?? []) {
    if (!AIMessage.isInstance(message)) continue;
    for (const call of message.tool_calls ?? []) {
      const input = typeof call.args.query === "string" ? call.args.query : JSON.stringify(call.args);
      parts.push({ type: "tool", name: call.name, input });
    }
  }
  return parts;
};
