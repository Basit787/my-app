import {
  AlignLeft,
  Building2,
  Calculator,
  FileText,
  Heading,
  Image,
  ListOrdered,
  Minus,
  StickyNote,
  UserRound,
  type LucideIcon,
} from "lucide-react";
import { useBuilderStore } from "@/features/builder/store/builder-store";
import type { BlockKind } from "@/features/builder/types/block-kind";
import { BLOCK_CATALOG } from "@/features/builder/utils/block-catalog";
import { BLOCK_DRAG_TYPE } from "./block-drag-type";

const ICONS: Record<BlockKind, LucideIcon> = {
  logo: Image,
  title: Heading,
  text: AlignLeft,
  details: FileText,
  from: Building2,
  billTo: UserRound,
  lineItems: ListOrdered,
  totals: Calculator,
  notes: StickyNote,
  divider: Minus,
};

// Where a tapped (not dragged) block lands: near the top-left, so it can be dragged into place
const TAP_POSITION = { x: 50, y: 50 };

// Blocks to drag onto the page; tapping one adds it too (touch screens have no drag and drop)
export const BlockPalette = () => {
  const addBlock = useBuilderStore((state) => state.addBlock);
  const kinds = Object.keys(BLOCK_CATALOG) as BlockKind[];

  return (
    <div className="space-y-2 p-3">
      <p className="px-1 text-xs font-semibold tracking-wide text-muted-foreground uppercase">Drag onto the page</p>
      <div className="grid grid-cols-2 gap-2 lg:grid-cols-1">
        {kinds.map((kind) => {
          const Icon = ICONS[kind];
          const entry = BLOCK_CATALOG[kind];
          return (
            <button
              key={kind}
              type="button"
              draggable
              onDragStart={(event) => {
                event.dataTransfer.setData(BLOCK_DRAG_TYPE, kind);
                event.dataTransfer.effectAllowed = "copy";
              }}
              onClick={() => addBlock(kind, TAP_POSITION.x, TAP_POSITION.y)}
              className="flex cursor-grab items-center gap-2 rounded-lg border bg-background px-3 py-2 text-left text-sm transition-colors hover:border-primary/50 hover:bg-accent active:cursor-grabbing"
            >
              <Icon className="h-4 w-4 shrink-0 text-primary" />
              <span className="min-w-0">
                <span className="block font-medium">{entry.label}</span>
                <span className="block truncate text-xs text-muted-foreground">{entry.description}</span>
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
};
