import { useRef, type PointerEvent } from "react";
import { useBuilderStore } from "@/features/builder/store/builder-store";
import type { BuilderBlock } from "@/features/builder/types/builder-block";
import { PAGE_SIZE } from "@/features/builder/utils/page-size";
import { cn } from "@/lib/utils";
import { BlockContent } from "./block-content";

type CanvasBlockProps = { block: BuilderBlock; scale: number };

// Narrowest a block can be resized to, in points
const MIN_WIDTH = 20;

// A block on the page: click to select, drag to move, drag the right edge to resize
export const CanvasBlock = ({ block, scale }: CanvasBlockProps) => {
  const selected = useBuilderStore((state) => state.selectedId === block.id);
  const select = useBuilderStore((state) => state.select);
  const moveBlock = useBuilderStore((state) => state.moveBlock);
  const updateBlock = useBuilderStore((state) => state.updateBlock);
  const drag = useRef<{ pointerX: number; pointerY: number; x: number; y: number; width: number } | null>(null);
  const mode = useRef<"move" | "resize">("move");

  const start = (event: PointerEvent<HTMLDivElement>, nextMode: "move" | "resize") => {
    event.stopPropagation();
    select(block.id);
    mode.current = nextMode;
    drag.current = { pointerX: event.clientX, pointerY: event.clientY, x: block.x, y: block.y, width: block.width };
    event.currentTarget.setPointerCapture(event.pointerId);
  };

  const onPointerMove = (event: PointerEvent<HTMLDivElement>) => {
    if (!drag.current) return;
    const dx = (event.clientX - drag.current.pointerX) / scale;
    const dy = (event.clientY - drag.current.pointerY) / scale;
    if (mode.current === "move") {
      moveBlock(block.id, drag.current.x + dx, drag.current.y + dy);
      return;
    }
    const width = Math.min(Math.max(drag.current.width + dx, MIN_WIDTH), PAGE_SIZE.width - block.x);
    // A logo keeps its proportions while it is resized
    const height = block.kind === "logo" && block.height ? (block.height / block.width) * width : block.height;
    updateBlock(block.id, { width, height });
  };

  const stop = () => {
    drag.current = null;
  };

  return (
    <div
      role="button"
      tabIndex={0}
      aria-label={`${block.kind} block`}
      className={cn(
        "absolute cursor-move touch-none outline-offset-2 select-none",
        selected ? "outline-2 outline-blue-500" : "hover:outline-1 hover:outline-blue-300 hover:outline-dashed",
      )}
      style={{ left: block.x, top: block.y, width: block.width }}
      onPointerDown={(event) => start(event, "move")}
      onPointerMove={onPointerMove}
      onPointerUp={stop}
      onPointerCancel={stop}
    >
      <BlockContent block={block} />
      {selected && (
        <div
          aria-label="Resize"
          className="absolute top-1/2 -right-1.5 h-6 w-3 -translate-y-1/2 cursor-ew-resize rounded-sm border border-blue-500 bg-white"
          onPointerDown={(event) => start(event, "resize")}
          onPointerMove={onPointerMove}
          onPointerUp={stop}
          onPointerCancel={stop}
        />
      )}
    </div>
  );
};
