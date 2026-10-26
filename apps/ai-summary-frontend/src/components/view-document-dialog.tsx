import { formatFileSize } from "frontend-common";
import { MyUiDialog, MyUiSpinner } from "my-ui";
import type { SummaryDocument } from "@/features/documents/api/api";
import { DocumentStatusBadge } from "./document-status-badge";

type ViewDocumentDialogProps = {
  document: SummaryDocument | null;
  onOpenChange: (open: boolean) => void;
};

export const ViewDocumentDialog = ({ document, onOpenChange }: ViewDocumentDialogProps) => (
  <MyUiDialog
    open={!!document}
    onOpenChange={onOpenChange}
    title={document?.filename ?? ""}
    description="Document details and AI summary."
    className="sm:max-w-2xl"
  >
    {document && (
      <div className="space-y-4">
        <div className="flex flex-wrap items-center gap-3 text-sm text-muted-foreground">
          <DocumentStatusBadge status={document.status} />
          <span>{formatFileSize(document.size)}</span>
          <span>Uploaded {new Date(document.createdAt).toLocaleString()}</span>
        </div>
        <div className="max-h-[60vh] min-h-40 overflow-y-auto rounded-lg border p-4">
          {document.summary ? (
            <p className="text-sm leading-relaxed whitespace-pre-wrap">{document.summary}</p>
          ) : document.status === "FAILED" ? (
            <p className="text-sm text-muted-foreground">The summary could not be generated. Try again.</p>
          ) : (
            <MyUiSpinner label="The model is reading the document…" />
          )}
        </div>
      </div>
    )}
  </MyUiDialog>
);
