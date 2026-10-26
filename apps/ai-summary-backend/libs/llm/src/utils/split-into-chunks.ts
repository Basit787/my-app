// Consecutive slices of `size` characters
export const splitIntoChunks = (text: string, size: number): string[] => {
  const chunks: string[] = [];
  for (let start = 0; start < text.length; start += size) {
    chunks.push(text.slice(start, start + size));
  }
  return chunks;
};
