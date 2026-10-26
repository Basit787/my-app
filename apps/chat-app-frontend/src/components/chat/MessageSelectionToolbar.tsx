import { Copy, Forward, Trash2, X } from "lucide-react";
import { Button } from "my-ui";
import { cn } from "@/lib/utils";
import { messageKey } from "@/lib/messages";
import type { ChatMessage } from "@/features/chat/api/api";
import { useMessageBulkActions } from "@/lib/use-message-bulk-actions";
import { useChatStore } from "@/features/chat/store/chat-store";
import type { BulkMessageAction } from "@/components/chat/MessageSelectionBar";

type MessageSelectionToolbarProps = {
  messages: ChatMessage[];
  selfUsername: string;
};

export const MessageSelectionToolbar = ({ messages, selfUsername }: MessageSelectionToolbarProps) => {
  const messageSelectionMode = useChatStore((s) => s.messageSelectionMode);
  const selectedMessageKeys = useChatStore((s) => s.selectedMessageKeys);
  const exitMessageSelection = useChatStore((s) => s.exitMessageSelection);
  const setSelectedMessageKeys = useChatStore((s) => s.setSelectedMessageKeys);
  const setForwardBatch = useChatStore((s) => s.setForwardBatch);

  const { selectableMessages, ownSelectableMessages, canDeleteAllSelected, runBulkAction } = useMessageBulkActions(
    messages,
    selfUsername,
  );

  if (!messageSelectionMode) return null;

  const count = selectedMessageKeys.length;

  const selectAll = () => {
    setSelectedMessageKeys(selectableMessages.map((m) => messageKey(m)));
  };

  const selectAllMine = () => {
    setSelectedMessageKeys(ownSelectableMessages.map((m) => messageKey(m)));
  };

  const handleAction = (action: BulkMessageAction) => {
    void runBulkAction(action, (batch) => setForwardBatch(batch));
  };

  return (
    <div className="flex shrink-0 flex-col gap-2 border-b border-border bg-card/95 px-3 py-2 shadow-sm backdrop-blur supports-[backdrop-filter]:bg-card/80">
      <div className="flex items-center gap-1">
        <Button
          type="button"
          variant="ghost"
          size="icon"
          className="h-9 w-9 shrink-0"
          onClick={exitMessageSelection}
          aria-label="Cancel selection"
        >
          <X className="h-4 w-4" />
        </Button>
        <span className="min-w-[4.5rem] text-sm font-medium">
          {count === 0 ? "Select messages" : `${count} selected`}
        </span>
        <div className="ml-auto flex flex-wrap items-center justify-end gap-1">
          <Button type="button" variant="outline" size="sm" className="h-8 px-2.5 text-xs" onClick={selectAll}>
            Select all
          </Button>
          {ownSelectableMessages.length > 0 && (
            <Button type="button" variant="outline" size="sm" className="h-8 px-2.5 text-xs" onClick={selectAllMine}>
              Select mine
            </Button>
          )}
        </div>
      </div>

      {count > 0 && (
        <div className="flex flex-wrap items-center gap-0.5">
          <Button
            type="button"
            variant="ghost"
            size="sm"
            className="h-9 gap-1.5 px-2.5"
            onClick={() => handleAction("copy")}
          >
            <Copy className="h-4 w-4" />
            <span className="hidden sm:inline">Copy</span>
          </Button>
          <Button
            type="button"
            variant="ghost"
            size="sm"
            className="h-9 gap-1.5 px-2.5"
            onClick={() => handleAction("forward")}
          >
            <Forward className="h-4 w-4" />
            <span className="hidden sm:inline">Forward</span>
          </Button>
          <Button
            type="button"
            variant="ghost"
            size="sm"
            className={cn("h-9 gap-1.5 px-2.5", "text-destructive hover:bg-destructive/10 hover:text-destructive")}
            onClick={() => handleAction("delete-me")}
          >
            <Trash2 className="h-4 w-4" />
            <span className="hidden sm:inline">Delete for me</span>
          </Button>
          {canDeleteAllSelected && (
            <Button
              type="button"
              variant="ghost"
              size="sm"
              className="h-9 gap-1.5 px-2.5 text-destructive hover:bg-destructive/10 hover:text-destructive"
              onClick={() => handleAction("delete-all")}
            >
              <Trash2 className="h-4 w-4" />
              <span className="hidden sm:inline">Delete for everyone</span>
            </Button>
          )}
        </div>
      )}
    </div>
  );
};
