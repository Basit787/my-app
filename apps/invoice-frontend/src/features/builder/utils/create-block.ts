import type { BlockKind } from "../types/block-kind";
import type { BuilderBlock } from "../types/builder-block";
import { BLOCK_CATALOG } from "./block-catalog";
import { DEFAULT_BLOCK_STYLE } from "./default-block-style";
import { PAGE_SIZE } from "./page-size";

// A new block of `kind` with its top-left corner at (x, y), kept inside the page
export const createBlock = (kind: BlockKind, x: number, y: number): BuilderBlock => {
  const entry = BLOCK_CATALOG[kind];
  const width = Math.min(entry.width, PAGE_SIZE.width);
  return {
    id: crypto.randomUUID(),
    kind,
    x: Math.min(Math.max(0, x), PAGE_SIZE.width - width),
    y: Math.min(Math.max(0, y), PAGE_SIZE.height - 10),
    width,
    height: entry.height,
    text: entry.text,
    style: { ...DEFAULT_BLOCK_STYLE, ...entry.style },
  };
};
