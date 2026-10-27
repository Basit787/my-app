import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";
import type { BlockKind } from "../types/block-kind";
import type { BuilderBlock } from "../types/builder-block";
import type { BuilderData } from "../types/builder-data";
import type { BuilderLineItem } from "../types/builder-line-item";
import { createBlock } from "../utils/create-block";
import { defaultDesign } from "../utils/default-design";
import { PAGE_SIZE } from "../utils/page-size";
import { safeStorage } from "../utils/safe-storage";

type BuilderState = {
  blocks: BuilderBlock[];
  data: BuilderData;
  selectedId: string | null;
  addBlock: (kind: BlockKind, x: number, y: number) => void;
  moveBlock: (id: string, x: number, y: number) => void;
  updateBlock: (id: string, changes: Partial<BuilderBlock>) => void;
  removeBlock: (id: string) => void;
  select: (id: string | null) => void;
  updateData: (changes: Partial<BuilderData>) => void;
  updateLineItem: (index: number, changes: Partial<BuilderLineItem>) => void;
  addLineItem: () => void;
  removeLineItem: (index: number) => void;
  reset: () => void;
};

const clamp = (value: number, min: number, max: number) => Math.min(Math.max(value, min), max);

// The invoice being designed, shared by the palette, the page and the side panel; kept as a draft between visits
export const useBuilderStore = create<BuilderState>()(
  persist(
    (set) => ({
      ...defaultDesign(),
      selectedId: null,
      addBlock: (kind, x, y) => {
        const block = createBlock(kind, x, y);
        set((state) => ({ blocks: [...state.blocks, block], selectedId: block.id }));
      },
      moveBlock: (id, x, y) =>
        set((state) => ({
          blocks: state.blocks.map((block) =>
            block.id === id
              ? {
                  ...block,
                  x: clamp(x, 0, PAGE_SIZE.width - block.width),
                  y: clamp(y, 0, PAGE_SIZE.height - 10),
                }
              : block,
          ),
        })),
      updateBlock: (id, changes) =>
        set((state) => ({ blocks: state.blocks.map((block) => (block.id === id ? { ...block, ...changes } : block)) })),
      removeBlock: (id) =>
        set((state) => ({
          blocks: state.blocks.filter((block) => block.id !== id),
          selectedId: state.selectedId === id ? null : state.selectedId,
        })),
      select: (id) => set({ selectedId: id }),
      updateData: (changes) => set((state) => ({ data: { ...state.data, ...changes } })),
      updateLineItem: (index, changes) =>
        set((state) => ({
          data: {
            ...state.data,
            lineItems: state.data.lineItems.map((line, i) => (i === index ? { ...line, ...changes } : line)),
          },
        })),
      addLineItem: () =>
        set((state) => ({
          data: { ...state.data, lineItems: [...state.data.lineItems, { description: "", quantity: 1, unitPrice: 0 }] },
        })),
      removeLineItem: (index) =>
        set((state) => ({ data: { ...state.data, lineItems: state.data.lineItems.filter((_, i) => i !== index) } })),
      reset: () => set({ ...defaultDesign(), selectedId: null }),
    }),
    {
      name: "invoice-builder",
      storage: createJSONStorage(() => safeStorage),
      partialize: ({ blocks, data }) => ({ blocks, data }),
    },
  ),
);
