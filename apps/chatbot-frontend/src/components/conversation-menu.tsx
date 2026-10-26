import { useState } from "react";
import { Ellipsis, Pencil, Trash2 } from "lucide-react";
import { MyUiAlertDialog, MyUiButton, MyUiDropdownMenu } from "my-ui";
import type { Conversation } from "@/features/chat/api/api";
import { useDeleteConversation } from "@/features/chat/api/hooks";
import { RenameConversationDialog } from "./rename-conversation-dialog";

type ConversationMenuProps = {
  conversation: Conversation;
  onDeleted: () => void;
};

export const ConversationMenu = ({ conversation, onDeleted }: ConversationMenuProps) => {
  const remove = useDeleteConversation();
  const [renameOpen, setRenameOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);

  return (
    <>
      <MyUiDropdownMenu
        items={[
          { label: "Rename", icon: <Pencil />, onSelect: () => setRenameOpen(true) },
          { label: "Delete", icon: <Trash2 />, destructive: true, onSelect: () => setDeleteOpen(true) },
        ]}
      >
        <MyUiButton variant="ghost" size="icon" aria-label="Chat options">
          <Ellipsis />
        </MyUiButton>
      </MyUiDropdownMenu>
      {renameOpen && (
        <RenameConversationDialog conversation={conversation} open={renameOpen} onOpenChange={setRenameOpen} />
      )}
      <MyUiAlertDialog
        open={deleteOpen}
        onOpenChange={setDeleteOpen}
        title="Delete chat?"
        description={`"${conversation.title}" and all its messages will be deleted.`}
        confirmText="Delete"
        destructive
        onConfirm={() => remove.mutate(conversation.id, { onSuccess: onDeleted })}
      />
    </>
  );
};
