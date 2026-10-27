// Letters and digits only, so layout spaces and form feeds don't count as text
export const countWordChars = (text: string): number => text.match(/[\p{L}\p{N}]/gu)?.length ?? 0;
