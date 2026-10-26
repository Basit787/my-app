import { useState, type FormEvent } from "react";
import { MyUiButton, MyUiDialog, MyUiInput } from "my-ui";
import type { Conversation } from "@/features/chat/api/api";
import { useRenameConversation } from "@/features/chat/api/hooks";

type RenameConversationDialogProps = {
  conversation: Conversation;
  open: boolean;
  onOpenChange: (open: boolean) => void;
};

export const RenameConversationDialog = ({ conversation, open, onOpenChange }: RenameConversationDialogProps) => {
  const rename = useRenameConversation();
  const [title, setTitle] = useState(conversation.title);

  const onSubmit = (event: FormEvent) => {
    event.preventDefault();
    if (!title.trim()) return;
    rename.mutate({ id: conversation.id, title: title.trim() }, { onSuccess: () => onOpenChange(false) });
  };

  return (
    <MyUiDialog open={open} onOpenChange={onOpenChange} title="Rename chat">
      <form onSubmit={onSubmit} className="space-y-4">
        <MyUiInput label="Title" value={title} maxLength={200} onChange={(event) => setTitle(event.target.value)} />
        <div className="flex justify-end">
          <MyUiButton type="submit" loading={rename.isPending} disabled={!title.trim()}>
            Save
          </MyUiButton>
        </div>
      </form>
    </MyUiDialog>
  );
};
