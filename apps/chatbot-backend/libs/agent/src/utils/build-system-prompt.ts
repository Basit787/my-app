import { SYSTEM_PROMPT } from "../system-prompt.js";
import type { Source } from "../types/source.js";

export const buildSystemPrompt = (sources: Source[] | null): string => {
  if (sources === null) return SYSTEM_PROMPT;
  if (sources.length === 0) {
    return (
      `${SYSTEM_PROMPT} The user uploaded documents to this chat, but no excerpt matched this question: ` +
      "say that the documents do not cover it, then answer briefly from general knowledge."
    );
  }
  const excerpts = sources.map((source, index) => `[${index + 1}] ${source.fileName}:\n${source.excerpt}`).join("\n\n");
  return (
    `${SYSTEM_PROMPT} Answer from the excerpts of the user's documents below and cite them as [1], [2]. ` +
    `If they do not contain the answer, say so.\n\nExcerpts:\n\n${excerpts}`
  );
};
