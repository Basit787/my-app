import { Annotation, MessagesAnnotation } from "@langchain/langgraph";
import type { Source } from "./types/source.js";

export const ChatState = Annotation.Root({
  ...MessagesAnnotation.spec,
  sources: Annotation<Source[] | null>(),
});
