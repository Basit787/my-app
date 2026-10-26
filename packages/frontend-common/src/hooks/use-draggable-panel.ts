import { useCallback, useEffect, useRef, useState } from "react";

type Position = { x: number; y: number };

type UseDraggablePanelOptions = {
  enabled?: boolean;
  panelWidth: number;
  panelHeight: number;
};

const clampPosition = (pos: Position, width: number, height: number): Position => {
  const maxX = Math.max(0, window.innerWidth - width);
  const maxY = Math.max(0, window.innerHeight - height);
  return {
    x: Math.min(Math.max(0, pos.x), maxX),
    y: Math.min(Math.max(0, pos.y), maxY),
  };
};

export const useDraggablePanel = ({ enabled = true, panelWidth, panelHeight }: UseDraggablePanelOptions) => {
  const panelRef = useRef<HTMLDivElement>(null);
  const dragOffset = useRef<Position>({ x: 0, y: 0 });
  const wasEnabled = useRef(false);
  const [position, setPosition] = useState<Position | null>(null);
  const [isDragging, setIsDragging] = useState(false);

  const centerPanel = useCallback(() => {
    setPosition(
      clampPosition(
        {
          x: (window.innerWidth - panelWidth) / 2,
          y: Math.max(16, (window.innerHeight - panelHeight) / 4),
        },
        panelWidth,
        panelHeight,
      ),
    );
  }, [panelHeight, panelWidth]);

  useEffect(() => {
    if (enabled && !wasEnabled.current) {
      centerPanel();
    }
    wasEnabled.current = enabled;
    if (!enabled) {
      setPosition(null);
    }
  }, [centerPanel, enabled]);

  useEffect(() => {
    if (!enabled) return;
    setPosition((prev) => (prev ? clampPosition(prev, panelWidth, panelHeight) : prev));
  }, [enabled, panelHeight, panelWidth]);

  useEffect(() => {
    if (!enabled) return;
    const onResize = () => setPosition((prev) => (prev ? clampPosition(prev, panelWidth, panelHeight) : prev));
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, [enabled, panelHeight, panelWidth]);

  const onPointerDown = useCallback(
    (e: React.PointerEvent<HTMLElement>) => {
      if (!enabled || e.button !== 0) return;
      if ((e.target as HTMLElement).closest("button")) return;

      const panel = panelRef.current;
      if (!panel) return;

      const rect = panel.getBoundingClientRect();
      dragOffset.current = { x: e.clientX - rect.left, y: e.clientY - rect.top };
      setIsDragging(true);
      e.currentTarget.setPointerCapture(e.pointerId);
    },
    [enabled],
  );

  useEffect(() => {
    if (!isDragging) return;

    const onPointerMove = (e: PointerEvent) => {
      setPosition(
        clampPosition(
          { x: e.clientX - dragOffset.current.x, y: e.clientY - dragOffset.current.y },
          panelWidth,
          panelHeight,
        ),
      );
    };

    const onPointerUp = () => setIsDragging(false);

    window.addEventListener("pointermove", onPointerMove);
    window.addEventListener("pointerup", onPointerUp);
    return () => {
      window.removeEventListener("pointermove", onPointerMove);
      window.removeEventListener("pointerup", onPointerUp);
    };
  }, [isDragging, panelHeight, panelWidth]);

  return {
    panelRef,
    position,
    isDragging,
    onPointerDown,
    centerPanel,
  };
};
