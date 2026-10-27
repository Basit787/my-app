import { useEffect, useRef, useState, type DragEvent } from "react";
import { useBuilderStore } from "@/features/builder/store/builder-store";
import type { BlockKind } from "@/features/builder/types/block-kind";
import { PAGE_SIZE } from "@/features/builder/utils/page-size";
import { BLOCK_DRAG_TYPE } from "./block-drag-type";
import { CanvasBlock } from "./canvas-block";

// Gap kept around the page inside the canvas area
const PADDING = 24;

// The A4 page: drop blocks from the palette onto it, move and resize them; scaled to fit the available width
export const InvoiceCanvas = () => {
  const blocks = useBuilderStore((state) => state.blocks);
  const addBlock = useBuilderStore((state) => state.addBlock);
  const select = useBuilderStore((state) => state.select);
  const removeBlock = useBuilderStore((state) => state.removeBlock);
  const moveBlock = useBuilderStore((state) => state.moveBlock);
  const selectedId = useBuilderStore((state) => state.selectedId);
  const area = useRef<HTMLDivElement>(null);
  const page = useRef<HTMLDivElement>(null);
  const [scale, setScale] = useState(1);

  useEffect(() => {
    if (!area.current) return;
    const observer = new ResizeObserver(([entry]) =>
      setScale(Math.min(1.5, (entry.contentRect.width - PADDING * 2) / PAGE_SIZE.width)),
    );
    observer.observe(area.current);
    return () => observer.disconnect();
  }, []);

  // Delete removes the selected block, arrows nudge it (Shift: 10 points); not while typing in a field
  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      const target = event.target as HTMLElement;
      if (!selectedId || target.closest("input, textarea, select, [contenteditable]")) return;
      const block = useBuilderStore.getState().blocks.find((candidate) => candidate.id === selectedId);
      if (!block) return;
      if (event.key === "Delete" || event.key === "Backspace") {
        event.preventDefault();
        removeBlock(selectedId);
        return;
      }
      const step = event.shiftKey ? 10 : 1;
      const moves: Record<string, [number, number]> = {
        ArrowLeft: [-step, 0],
        ArrowRight: [step, 0],
        ArrowUp: [0, -step],
        ArrowDown: [0, step],
      };
      const move = moves[event.key];
      if (!move) return;
      event.preventDefault();
      moveBlock(selectedId, block.x + move[0], block.y + move[1]);
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [selectedId, removeBlock, moveBlock]);

  const onDrop = (event: DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    const kind = event.dataTransfer.getData(BLOCK_DRAG_TYPE) as BlockKind;
    if (!kind || !page.current) return;
    const rect = page.current.getBoundingClientRect();
    addBlock(kind, (event.clientX - rect.left) / scale, (event.clientY - rect.top) / scale);
  };

  return (
    <div ref={area} className="h-full overflow-auto bg-muted/40" style={{ padding: PADDING }}>
      <div style={{ width: PAGE_SIZE.width * scale, height: PAGE_SIZE.height * scale }} className="mx-auto">
        <div
          ref={page}
          className="relative origin-top-left bg-white shadow-lg"
          style={{ width: PAGE_SIZE.width, height: PAGE_SIZE.height, transform: `scale(${scale})` }}
          onDragOver={(event) => {
            if (event.dataTransfer.types.includes(BLOCK_DRAG_TYPE)) event.preventDefault();
          }}
          onDrop={onDrop}
          onPointerDown={() => select(null)}
        >
          {blocks.map((block) => (
            <CanvasBlock key={block.id} block={block} scale={scale} />
          ))}
        </div>
      </div>
    </div>
  );
};
