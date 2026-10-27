// `text` broken into lines no wider than `maxWidth`; keeps the user's own line breaks
export const wrapText = (
  text: string,
  maxWidth: number,
  fontSize: number,
  measure: (text: string, size: number) => number,
): string[] => {
  const lines: string[] = [];
  for (const paragraph of text.split("\n")) {
    let line = "";
    for (const word of paragraph.split(/\s+/).filter(Boolean)) {
      const candidate = line ? `${line} ${word}` : word;
      if (line && measure(candidate, fontSize) > maxWidth) {
        lines.push(line);
        line = word;
      } else {
        line = candidate;
      }
    }
    if (line) lines.push(line);
  }
  return lines;
};
