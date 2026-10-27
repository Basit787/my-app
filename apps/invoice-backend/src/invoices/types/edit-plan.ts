import type { EditPlacement } from "./edit-placement.js";

// Every change placed on the original, plus the changes that could not be placed (by label)
export type EditPlan = {
  pages: { width: number; height: number }[];
  placements: EditPlacement[];
  unplaced: string[];
};
