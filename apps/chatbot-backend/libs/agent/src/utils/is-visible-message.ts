import type { BaseMessage } from "@langchain/core/messages";
import { AIMessage } from "@langchain/core/messages";

export const isVisibleMessage = (message: BaseMessage): boolean => {
  if (message.type === "human") return true;
  if (!AIMessage.isInstance(message)) return false;
  return !message.tool_calls?.length && message.text.length > 0;
};
