import { Eye, RotateCw, Trash2 } from "lucide-react";
import { formatFileSize } from "frontend-common";
import { MyUiDataTable, type MyUiDataTableColumn, type MyUiDataTableProps, type MyUiRowAction } from "my-ui";
import type { SummaryDocument } from "@/features/documents/api/api";
import { useDeleteDocument, useRetrySummary } from "@/features/documents/api/hooks";
import { DocumentStatusBadge } from "./document-status-badge";

type DocumentsTableProps = {
  documents: SummaryDocument[];
  onView: (document: SummaryDocument) => void;
};

export const DocumentsTable = ({ documents, onView }: DocumentsTableProps) => {
  const remove = useDeleteDocument();
  const retry = useRetrySummary();

  const columns: MyUiDataTableColumn<SummaryDocument>[] = [
    {
      id: "filename",
      header: "File",
      sortable: true,
      cell: (doc) => (
        <div className="flex flex-col">
          <span className="font-medium">{doc.filename}</span>
          <span className="text-xs text-muted-foreground">{formatFileSize(doc.size)}</span>
        </div>
      ),
    },
    {
      id: "status",
      header: "Status",
      sortable: true,
      searchable: false,
      cell: (doc) => <DocumentStatusBadge status={doc.status} />,
    },
    {
      id: "summary",
      header: "Summary",
      className: "max-w-xs max-md:hidden",
      cell: (doc) => <p className="truncate text-muted-foreground">{doc.summary ?? "—"}</p>,
    },
    {
      id: "createdAt",
      header: "Uploaded",
      sortable: true,
      searchable: false,
      className: "max-sm:hidden",
      cell: (doc) => new Date(doc.createdAt).toLocaleString(),
    },
  ];

  const singleRowActions: MyUiRowAction<SummaryDocument>[] = [
    { label: "View summary", icon: <Eye />, onSelect: onView },
    {
      label: "Summarize again",
      icon: <RotateCw />,
      hidden: (doc) => doc.status !== "FAILED",
      disabled: () => retry.isPending,
      onSelect: (doc) => retry.mutate(doc.id),
    },
    {
      label: "Delete",
      icon: <Trash2 />,
      destructive: true,
      onSelect: (doc) => remove.mutate(doc.id),
      confirm: {
        title: "Delete document?",
        description: ([doc]) => `"${doc.filename}" and its summary will be deleted. This cannot be undone.`,
        confirmText: "Delete",
      },
    },
  ];

  const table: MyUiDataTableProps<SummaryDocument> = {
    data: documents,
    getRowId: (doc) => doc.id,
    searchPlaceholder: "Search documents…",
    emptyText: "No documents match your search.",
    columns,
    singleRowActions,
  };

  return <MyUiDataTable {...table} />;
};
