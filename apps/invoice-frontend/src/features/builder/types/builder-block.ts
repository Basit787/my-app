import type { BlockKind } from "./block-kind";
import type { BlockStyle } from "./block-style";

// One block on the A4 page, in points from the top-left corner (595 × 842); mirrors ComposeBlockDto
export type BuilderBlock = {
  id: string;
  kind: BlockKind;
  x: number;
  y: number;
  width: number;
  // Logo and divider only
  height?: number;
  // Title and text blocks
  text?: string;
  imageDataUrl?: string;
  style: BlockStyle;
};
