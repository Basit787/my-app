// Lower case without the punctuation around it ("Acme," → "acme"), so OCR'd and typed words compare equal
export const normalizeWord = (text: string): string =>
  text.toLowerCase().replace(/^[^\p{L}\p{N}]+|[^\p{L}\p{N}]+$/gu, "");
