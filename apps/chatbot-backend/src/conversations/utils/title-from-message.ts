const MAX_TITLE_LENGTH = 60;

// A new conversation is named after its first message, cut at a word boundary
export const titleFromMessage = (text: string): string => {
  const singleLine = text.replace(/\s+/g, " ").trim();
  if (singleLine.length <= MAX_TITLE_LENGTH) return singleLine;
  const cut = singleLine.slice(0, MAX_TITLE_LENGTH);
  const lastSpace = cut.lastIndexOf(" ");
  return `${lastSpace > 20 ? cut.slice(0, lastSpace) : cut}…`;
};
