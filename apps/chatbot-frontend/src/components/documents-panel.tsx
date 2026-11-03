import { useState } from "react";
import { FileText, X } from "lucide-react";
import { MyUiAlertDialog, MyUiBadge, MyUiButton } from "my-ui";
import type { DocumentItem } from "@/features/chat/api/api";
import { useDeleteDocument, useDocuments } from "@/features/chat/api/hooks";

type DocumentsPanelProps = {
  conversationId?: string;
};

export const DocumentsPanel = ({ conversationId }: DocumentsPanelProps) => {
  const documents = useDocuments(conversationId);
  const remove = useDeleteDocument();
  const [documentToRemove, setDocumentToRemove] = useState<DocumentItem | null>(null);

  const onConfirmRemove = () => {
    if (conversationId && documentToRemove) remove.mutate({ conversationId, documentId: documentToRemove.id });
  };

  if (!documents.data?.length) return null;

  return (
    <div className="mb-2 flex flex-wrap items-center gap-2">
      {documents.data.map((document) => (
        <MyUiBadge key={document.id} variant="secondary" icon={<FileText />} className="gap-1 py-0.5 pr-0.5">
          <span className="max-w-48 truncate">{document.fileName}</span>
          <span className="text-muted-foreground">· {document.chunkCount} chunks</span>
          <MyUiButton
            variant="ghost"
            size="icon"
            className="size-5"
            aria-label={`Remove ${document.fileName}`}
            onClick={() => setDocumentToRemove(document)}
          >
            <X className="size-3" />
          </MyUiButton>
        </MyUiBadge>
      ))}
      <MyUiAlertDialog
        open={!!documentToRemove}
        onOpenChange={(open) => {
          if (!open) setDocumentToRemove(null);
        }}
        title="Remove document?"
        description={`"${documentToRemove?.fileName ?? ""}" will no longer be used to answer in this chat.`}
        confirmText="Remove"
        destructive
        onConfirm={onConfirmRemove}
      />
    </div>
  );
};
