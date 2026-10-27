import type { Rect } from "./rect.js";

// A box whited out (or filled with the paper colour behind it) before the new text is written
export type CoverRect = Rect & { color: string };
