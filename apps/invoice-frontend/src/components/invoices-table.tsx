import { Link, useNavigate } from "@tanstack/react-router";
import { Archive, ArchiveRestore, Download, Eye, RotateCw, Trash2 } from "lucide-react";
import { formatFileSize } from "frontend-common";
import {
  MyUiBadge,
  MyUiDataTable,
  type MyUiBulkAction,
  type MyUiDataTableColumn,
  type MyUiDataTableFilter,
  type MyUiDataTableProps,
  type MyUiRowAction,
} from "my-ui";
import type { Invoice } from "@/features/invoices/api/api";
import {
  useArchiveInvoices,
  useDeleteInvoice,
  useDeleteInvoices,
  useDownloadInvoice,
  useReextractInvoice,
  useRestoreInvoices,
} from "@/features/invoices/api/hooks";
import { formatAmount } from "@/lib/format-amount";
import { InvoiceStatusBadge } from "./invoice-status-badge";

type InvoicesTableProps = { invoices: Invoice[] };

const filters: MyUiDataTableFilter<Invoice>[] = [
  {
    id: "archive",
    label: "Show",
    options: [
      { value: "active", label: "Active", match: (inv) => !inv.archivedAt },
      { value: "archived", label: "Archived", match: (inv) => !!inv.archivedAt },
      { value: "all", label: "All" },
    ],
  },
];

export const InvoicesTable = ({ invoices }: InvoicesTableProps) => {
  const navigate = useNavigate();
  const remove = useDeleteInvoice();
  const removeMany = useDeleteInvoices();
  const archive = useArchiveInvoices();
  const restore = useRestoreInvoices();
  const reextract = useReextractInvoice();
  const download = useDownloadInvoice();

  const columns: MyUiDataTableColumn<Invoice>[] = [
    {
      id: "filename",
      header: "File",
      sortable: true,
      cell: (inv) => (
        <Link to="/invoices/$invoiceId" params={{ invoiceId: inv.id }} className="flex flex-col hover:underline">
          <span className="font-medium">{inv.filename}</span>
          <span className="text-xs text-muted-foreground">{formatFileSize(inv.size)}</span>
        </Link>
      ),
    },
    {
      id: "status",
      header: "Status",
      sortable: true,
      searchable: false,
      cell: (inv) => (
        <div className="flex flex-wrap gap-1">
          <InvoiceStatusBadge status={inv.status} />
          {inv.archivedAt && <MyUiBadge variant="outline">Archived</MyUiBadge>}
        </div>
      ),
    },
    { id: "invoiceNumber", header: "Invoice #", sortable: true, cell: (inv) => inv.invoiceNumber ?? "—" },
    {
      id: "vendorName",
      header: "Vendor",
      sortable: true,
      className: "max-w-48 max-md:hidden",
      cell: (inv) => <p className="truncate">{inv.vendorName ?? "—"}</p>,
    },
    {
      id: "invoiceDate",
      header: "Date",
      sortable: true,
      searchable: false,
      className: "max-sm:hidden",
      cell: (inv) => inv.invoiceDate ?? "—",
    },
    {
      id: "totalAmount",
      header: "Total",
      sortable: true,
      searchable: false,
      className: "text-right",
      cell: (inv) => formatAmount(inv.totalAmount, inv.currency),
    },
    {
      id: "createdAt",
      header: "Uploaded",
      sortable: true,
      searchable: false,
      className: "max-lg:hidden",
      cell: (inv) => new Date(inv.createdAt).toLocaleString(),
    },
  ];

  const singleRowActions: MyUiRowAction<Invoice>[] = [
    {
      label: "Open",
      icon: <Eye />,
      onSelect: (inv) => void navigate({ to: "/invoices/$invoiceId", params: { invoiceId: inv.id } }),
    },
    {
      label: "Download PDF",
      icon: <Download />,
      hidden: (inv) => inv.status !== "COMPLETED",
      disabled: () => download.isPending,
      onSelect: (inv) => download.mutate({ invoice: inv, edited: true }),
    },
    {
      label: "Read again",
      icon: <RotateCw />,
      hidden: (inv) => inv.status === "PROCESSING" || inv.status === "UPLOADED",
      disabled: () => reextract.isPending,
      onSelect: (inv) => reextract.mutate(inv.id),
      confirm: {
        title: "Read the invoice again?",
        description: ([inv]) => `The fields of "${inv.filename}", including your corrections, will be replaced.`,
        confirmText: "Read again",
      },
    },
    {
      label: "Archive",
      icon: <Archive />,
      hidden: (inv) => !!inv.archivedAt,
      disabled: () => archive.isPending,
      onSelect: (inv) => archive.mutate([inv.id]),
    },
    {
      label: "Restore",
      icon: <ArchiveRestore />,
      hidden: (inv) => !inv.archivedAt,
      disabled: () => restore.isPending,
      onSelect: (inv) => restore.mutate([inv.id]),
    },
    {
      label: "Delete permanently",
      icon: <Trash2 />,
      destructive: true,
      hidden: (inv) => !inv.archivedAt,
      onSelect: (inv) => remove.mutate(inv.id),
      confirm: {
        title: "Delete invoice permanently?",
        description: ([inv]) => `"${inv.filename}" and its data will be deleted. This cannot be undone.`,
        confirmText: "Delete",
      },
    },
  ];

  const multiRowActions: MyUiBulkAction<Invoice>[] = [
    {
      label: "Download PDF",
      icon: <Download />,
      tooltip: "Only invoices that have been read",
      disabled: (rows) => download.isPending || rows.some((inv) => inv.status !== "COMPLETED"),
      onSelect: (rows) => rows.forEach((inv) => download.mutate({ invoice: inv, edited: true })),
    },
    {
      label: "Read again",
      icon: <RotateCw />,
      disabled: (rows) => rows.some((inv) => inv.status === "PROCESSING" || inv.status === "UPLOADED"),
      onSelect: (rows) => rows.forEach((inv) => reextract.mutate(inv.id)),
      confirm: {
        title: "Read the invoices again?",
        description: (rows) => `The fields of ${rows.length} invoices, including your corrections, will be replaced.`,
        confirmText: "Read again",
      },
    },
    {
      label: "Archive",
      icon: <Archive />,
      tooltip: "Only invoices that are not archived",
      disabled: (rows) => archive.isPending || rows.some((inv) => inv.archivedAt),
      onSelect: (rows) => archive.mutate(rows.map((inv) => inv.id)),
    },
    {
      label: "Restore",
      icon: <ArchiveRestore />,
      tooltip: "Only archived invoices",
      disabled: (rows) => restore.isPending || rows.some((inv) => !inv.archivedAt),
      onSelect: (rows) => restore.mutate(rows.map((inv) => inv.id)),
    },
    {
      label: "Delete permanently",
      icon: <Trash2 />,
      destructive: true,
      tooltip: "Only archived invoices",
      disabled: (rows) => removeMany.isPending || rows.some((inv) => !inv.archivedAt),
      onSelect: (rows) => removeMany.mutate(rows.map((inv) => inv.id)),
      confirm: {
        title: "Delete invoices permanently?",
        description: (rows) => `${rows.length} invoices and their data will be deleted. This cannot be undone.`,
        confirmText: "Delete",
      },
    },
  ];

  const table: MyUiDataTableProps<Invoice> = {
    data: invoices,
    getRowId: (inv) => inv.id,
    searchPlaceholder: "Search invoices…",
    emptyText: "No invoices match your search.",
    columns,
    singleRowActions,
    multiRowActions,
    filters,
  };

  return <MyUiDataTable {...table} />;
};
