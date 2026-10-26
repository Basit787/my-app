import { useEffect, useRef } from "react";
import { Copy, Download, Forward, Reply, SquareCheck, Trash2 } from "lucide-react";
import { Button } from "my-ui";
import { cn } from "@/lib/utils";

export type MessageAction = "reply" | "copy" | "forward" | "download" | "select" | "delete-me" | "delete-all";

type MessageActionMenuProps = {
  open: boolean;
  x: number;
  y: number;
  isOwn: boolean;
  canDeleteForAll: boolean;
  canCopy: boolean;
  canDownload: boolean;
  onAction: (action: MessageAction) => void;
  onClose: () => void;
};

const ACTIONS: { id: MessageAction; label: string; icon: typeof Reply; destructive?: boolean }[] = [
  { id: "reply", label: "Reply", icon: Reply },
  { id: "select", label: "Select", icon: SquareCheck },
  { id: "copy", label: "Copy", icon: Copy },
  { id: "forward", label: "Forward", icon: Forward },
  { id: "download", label: "Download", icon: Download },
  { id: "delete-me", label: "Delete for me", icon: Trash2, destructive: true },
  { id: "delete-all", label: "Delete for everyone", icon: Trash2, destructive: true },
];

export const MessageActionMenu = ({
  open,
  x,
  y,
  isOwn,
  canDeleteForAll,
  canCopy,
  canDownload,
  onAction,
  onClose,
}: MessageActionMenuProps) => {
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const onPointerDown = (e: MouseEvent | TouchEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) onClose();
    };
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("mousedown", onPointerDown);
    document.addEventListener("touchstart", onPointerDown);
    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.removeEventListener("mousedown", onPointerDown);
      document.removeEventListener("touchstart", onPointerDown);
      document.removeEventListener("keydown", onKeyDown);
    };
  }, [open, onClose]);

  if (!open) return null;

  const items = ACTIONS.filter((action) => {
    if (action.id === "copy" && !canCopy) return false;
    if (action.id === "download" && !canDownload) return false;
    if (action.id === "delete-all" && (!isOwn || !canDeleteForAll)) return false;
    return true;
  });

  const menuWidth = 200;
  const left = Math.min(x, window.innerWidth - menuWidth - 8);
  const top = Math.min(y, window.innerHeight - items.length * 40 - 16);

  return (
    <>
      <div className="fixed inset-0 z-40" aria-hidden />
      <div
        ref={menuRef}
        role="menu"
        className="fixed z-50 min-w-[12.5rem] overflow-hidden rounded-xl border border-border bg-popover p-1 text-popover-foreground shadow-xl"
        style={{ left, top }}
      >
        {items.map(({ id, label, icon: Icon, destructive }) => (
          <Button
            key={id}
            type="button"
            variant="ghost"
            role="menuitem"
            className={cn(
              "h-auto w-full justify-start gap-2 rounded-lg px-3 py-2 font-normal",
              destructive && "text-destructive hover:bg-destructive/10 hover:text-destructive",
            )}
            onClick={() => {
              onAction(id);
              onClose();
            }}
          >
            <Icon className="h-4 w-4 shrink-0" />
            {label}
          </Button>
        ))}
      </div>
    </>
  );
};
