import { formatDistanceToNow } from "date-fns";
import { BarChart3, Copy, ExternalLink, RefreshCw, Trash2 } from "lucide-react";
import {
  MyUiBadge,
  MyUiCard,
  MyUiDataTable,
  MyUiTooltip,
  useNotification,
  type MyUiBulkAction,
  type MyUiDataTableColumn,
  type MyUiDataTableProps,
  type MyUiRowAction,
  type MyUiTableAction,
} from "my-ui";
import { copyToClipboard } from "frontend-common";
import { useState } from "react";
import { LinkStatsDialog } from "@/components/link-stats-dialog";
import type { LinkDto } from "@/features/links/api/api";
import { useDeleteLinks, useLinks } from "@/features/links/api/hooks";
import { isLinkExpired } from "@/features/links/utils/is-link-expired";
import { shortUrl } from "@/features/links/utils/short-url";

export const LinksTable = () => {
  const links = useLinks();
  const deleteLinks = useDeleteLinks();
  const { showSuccessNotification, showErrorNotification } = useNotification();
  const [statsFor, setStatsFor] = useState<LinkDto | null>(null);

  const copy = async (rows: LinkDto[]) => {
    if (await copyToClipboard(rows.map((link) => shortUrl(link.shortPath)).join("\n"))) {
      showSuccessNotification(rows.length === 1 ? "Short link copied" : `${rows.length} short links copied`);
    } else {
      showErrorNotification(null, "Could not copy the link");
    }
  };

  const columns: MyUiDataTableColumn<LinkDto>[] = [
    {
      id: "slug",
      header: "Short link",
      sortable: true,
      cell: (link) => (
        <div className="min-w-0">
          <div className="flex items-center gap-2">
            <a
              href={link.shortPath}
              target="_blank"
              rel="noreferrer"
              className="font-medium text-primary hover:underline"
            >
              /r/{link.slug}
            </a>
            {isLinkExpired(link) && <MyUiBadge variant="secondary">Expired</MyUiBadge>}
          </div>
          {/* Phones hide the other columns, so their values show here */}
          <div className="mt-1 max-w-[60vw] space-y-0.5 text-xs text-muted-foreground md:hidden">
            <p className="truncate">{link.title || link.url}</p>
            <p>
              {link.clickCount} {link.clickCount === 1 ? "click" : "clicks"} ·{" "}
              {formatDistanceToNow(new Date(link.createdAt), { addSuffix: true })}
            </p>
          </div>
        </div>
      ),
    },
    {
      id: "url",
      header: "Destination",
      sortable: true,
      className: "max-md:hidden",
      accessor: (link) => link.title || link.url,
      cell: (link) => (
        <MyUiTooltip text={link.url}>
          <span className="block max-w-[18rem] truncate text-muted-foreground">{link.title || link.url}</span>
        </MyUiTooltip>
      ),
    },
    { id: "clickCount", header: "Clicks", sortable: true, searchable: false, className: "text-right max-md:hidden" },
    {
      id: "createdAt",
      header: "Created",
      sortable: true,
      className: "max-md:hidden",
      searchable: false,
      cell: (link) => formatDistanceToNow(new Date(link.createdAt), { addSuffix: true }),
    },
  ];

  const singleRowActions: MyUiRowAction<LinkDto>[] = [
    { label: "Copy short link", icon: <Copy />, onSelect: (link) => void copy([link]) },
    { label: "Open destination", icon: <ExternalLink />, onSelect: (link) => window.open(link.url, "_blank") },
    { label: "Click stats", icon: <BarChart3 />, onSelect: setStatsFor },
    {
      label: "Delete",
      icon: <Trash2 />,
      destructive: true,
      onSelect: (link) => deleteLinks.mutate([link.id]),
      confirm: {
        title: "Delete this link?",
        description: ([link]) => `/r/${link.slug} will stop working. This cannot be undone.`,
        confirmText: "Delete",
      },
    },
  ];

  const multiRowActions: MyUiBulkAction<LinkDto>[] = [
    { label: "Copy", icon: <Copy />, onSelect: (rows) => void copy(rows) },
    {
      label: "Delete",
      icon: <Trash2 />,
      destructive: true,
      onSelect: (rows) => deleteLinks.mutate(rows.map((link) => link.id)),
      confirm: {
        title: "Delete the selected links?",
        description: (rows) => `${rows.length} short links will stop working. This cannot be undone.`,
        confirmText: "Delete",
      },
    },
  ];

  const tableActions: MyUiTableAction[] = [
    { label: "Refresh", icon: <RefreshCw />, onClick: () => void links.refetch(), loading: links.isFetching },
  ];

  const table: MyUiDataTableProps<LinkDto> = {
    data: links.data ?? [],
    loading: links.isLoading,
    getRowId: (link) => link.id,
    searchPlaceholder: "Search links…",
    emptyText: "No links yet. Create one in the Create link tab.",
    columns,
    singleRowActions,
    multiRowActions,
    tableActions,
  };

  return (
    <MyUiCard
      title="Your links"
      description="Every short link you created."
      className="max-md:border-0 max-md:bg-transparent max-md:py-0 max-md:shadow-none max-md:*:px-0"
    >
      <MyUiDataTable {...table} />
      <LinkStatsDialog link={statsFor} onClose={() => setStatsFor(null)} />
    </MyUiCard>
  );
};
