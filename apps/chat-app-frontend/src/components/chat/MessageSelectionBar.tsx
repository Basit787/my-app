import { Copy, Forward, Trash2, X } from "lucide-react";
import { Button } from "my-ui";
import { cn } from "@/lib/utils";

export type BulkMessageAction = "copy" | "forward" | "delete-me" | "delete-all";

type MessageSelectionBarProps = {
  count: number;
  canDeleteForAll: boolean;
  onAction: (action: BulkMessageAction) => void;
  onCancel: () => void;
};

export const MessageSelectionBar = ({ count, canDeleteForAll, onAction, onCancel }: MessageSelectionBarProps) => {
  if (count === 0) return null;

  return (
    <div className="sticky top-0 z-20 flex items-center gap-1 border-b border-border bg-card/95 px-3 py-2 shadow-sm backdrop-blur supports-[backdrop-filter]:bg-card/80">
      <Button
        type="button"
        variant="ghost"
        size="icon"
        className="h-9 w-9 shrink-0"
        onClick={onCancel}
        aria-label="Cancel selection"
      >
        <X className="h-4 w-4" />
      </Button>
      <span className="min-w-[4.5rem] text-sm font-medium">{count} selected</span>
      <div className="ml-auto flex items-center gap-0.5">
        <Button type="button" variant="ghost" size="sm" className="h-9 gap-1.5 px-2.5" onClick={() => onAction("copy")}>
          <Copy className="h-4 w-4" />
          <span className="hidden sm:inline">Copy</span>
        </Button>
        <Button
          type="button"
          variant="ghost"
          size="sm"
          className="h-9 gap-1.5 px-2.5"
          onClick={() => onAction("forward")}
        >
          <Forward className="h-4 w-4" />
          <span className="hidden sm:inline">Forward</span>
        </Button>
        <Button
          type="button"
          variant="ghost"
          size="sm"
          className={cn("h-9 gap-1.5 px-2.5", "text-destructive hover:bg-destructive/10 hover:text-destructive")}
          onClick={() => onAction("delete-me")}
        >
          <Trash2 className="h-4 w-4" />
          <span className="hidden sm:inline">Delete</span>
        </Button>
        {canDeleteForAll && (
          <Button
            type="button"
            variant="ghost"
            size="sm"
            className="h-9 gap-1.5 px-2.5 text-destructive hover:bg-destructive/10 hover:text-destructive"
            onClick={() => onAction("delete-all")}
          >
            <Trash2 className="h-4 w-4" />
            <span className="hidden sm:inline">Delete all</span>
          </Button>
        )}
      </div>
    </div>
  );
};
