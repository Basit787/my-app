import type { ReactNode } from "react";
import { Maximize2, Minimize2, PhoneOff } from "lucide-react";
import { Button } from "my-ui";
import { cn } from "@/lib/utils";
import { CALL_COLORS } from "./call-colors";
import { CallerAvatar } from "./CallerAvatar";
import type { useCallOverlay } from "./use-call-overlay";

type DesktopCallPanelProps = { call: ReturnType<typeof useCallOverlay>; screen: ReactNode };

// Desktop: a floating panel you can drag by its header and shrink to a small bar
export const DesktopCallPanel = ({ call, screen }: DesktopCallPanelProps) => {
  const { panel, panelWidth, panelHeight, minimized, title, status } = call;
  const position = panel.position ?? {
    x: Math.max(0, (window.innerWidth - panelWidth) / 2),
    y: Math.max(16, (window.innerHeight - panelHeight) / 4),
  };

  return (
    <div
      ref={panel.panelRef}
      style={{ left: position.x, top: position.y, width: panelWidth, height: minimized ? undefined : panelHeight }}
      className={cn(
        "fixed z-200 flex flex-col overflow-hidden rounded-2xl border border-white/10 bg-[#0b141a] text-white shadow-2xl",
        !panel.isDragging && "transition-[width,height] duration-200",
      )}
    >
      <div
        onPointerDown={panel.onPointerDown}
        className={cn(
          "flex cursor-grab touch-none items-center justify-between gap-2 border-b border-white/10 px-3 py-2 select-none",
          panel.isDragging && "cursor-grabbing",
        )}
      >
        <div className="flex min-w-0 items-center gap-2">
          <CallerAvatar group={call.isGroupCall ? call.group : undefined} name={title} className="h-8 w-8" />
          <div className="min-w-0">
            <p className="truncate text-sm font-semibold">{title}</p>
            <p className="truncate text-xs tabular-nums text-white/60">{status}</p>
          </div>
        </div>
        <div className="flex shrink-0 items-center gap-1" onPointerDown={(e) => e.stopPropagation()}>
          {minimized && call.inActiveCall && (
            <Button
              type="button"
              size="icon"
              className={cn("h-8 w-8 rounded-full", CALL_COLORS.red)}
              onClick={call.actions.endCall}
              aria-label="End call"
            >
              <PhoneOff className="h-4 w-4" />
            </Button>
          )}
          <Button
            type="button"
            size="icon"
            variant="ghost"
            className="h-8 w-8 text-white hover:bg-white/10 hover:text-white"
            onClick={() => call.setMinimized((m) => !m)}
            aria-label={minimized ? "Maximize call" : "Minimize call"}
          >
            {minimized ? <Maximize2 className="h-4 w-4" /> : <Minimize2 className="h-4 w-4" />}
          </Button>
        </div>
      </div>
      {!minimized && <div className="min-h-0 flex-1">{screen}</div>}
    </div>
  );
};
