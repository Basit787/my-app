import type { BaseMessage } from "@langchain/core/messages";
import { isVisibleMessage } from "./is-visible-message.js";
import { recentMessages } from "./recent-messages.js";

export const historyForModel = (messages: BaseMessage[], maxChars: number): BaseMessage[] => {
  let lastQuestion = messages.length - 1;
  while (lastQuestion > 0 && messages[lastQuestion].type !== "human") lastQuestion--;
  const earlierTurns = messages.slice(0, lastQuestion).filter(isVisibleMessage);
  return recentMessages([...earlierTurns, ...messages.slice(lastQuestion)], maxChars);
};
