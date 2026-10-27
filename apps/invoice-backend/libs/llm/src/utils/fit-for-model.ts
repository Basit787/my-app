// Characters per model call (~3k tokens, within OLLAMA_CONTEXT_LENGTH)
const MAX_CHARS = 12_000;
// Totals sit at the end of an invoice, so a long text keeps its start and its end
const TAIL_CHARS = 4_000;

export const fitForModel = (text: string): string => {
  if (text.length <= MAX_CHARS) return text;
  const head = text.slice(0, MAX_CHARS - TAIL_CHARS);
  const tail = text.slice(-TAIL_CHARS);
  return `${head}\n…\n${tail}`;
};
