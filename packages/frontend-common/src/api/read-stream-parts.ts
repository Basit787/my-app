// Calls `onPart` for each complete piece of a streamed body ("\n" for NDJSON, "\n\n" for SSE)
export const readStreamParts = async (
  stream: ReadableStream<Uint8Array>,
  separator: string,
  onPart: (part: string) => void,
) => {
  const reader = stream.getReader();
  const decoder = new TextDecoder();
  let buffer = "";
  while (true) {
    const { value, done } = await reader.read();
    if (done) return;
    buffer += decoder.decode(value, { stream: true });

    let partEnd = buffer.indexOf(separator);
    while (partEnd !== -1) {
      onPart(buffer.slice(0, partEnd));
      buffer = buffer.slice(partEnd + separator.length);
      partEnd = buffer.indexOf(separator);
    }
  }
};
