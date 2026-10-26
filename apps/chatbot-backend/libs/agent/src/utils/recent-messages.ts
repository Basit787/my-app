import type { BaseMessage } from "@langchain/core/messages";

// The newest messages whose text fits in `maxChars`, oldest first, so long chats stay inside the model's context
export const recentMessages = (messages: BaseMessage[], maxChars: number): BaseMessage[] => {
  const kept: BaseMessage[] = [];
  let usedChars = 0;
  for (let index = messages.length - 1; index >= 0; index--) {
    const message = messages[index];
    usedChars += message.text.length;
    if (usedChars > maxChars && kept.length > 0) break;
    kept.unshift(message);
  }
  return kept;
};
