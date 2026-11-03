import type { Source } from "./source.js";

export type ChatStreamPart =
  | { type: "sources"; sources: Source[] }
  | { type: "tool"; name: string; input: string }
  | { type: "delta"; text: string };
