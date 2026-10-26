import type { Table } from "@tanstack/react-table";
import { ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight } from "lucide-react";
import { Button } from "my-ui/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "my-ui/ui/select";

type MyUiDataTablePaginationProps<T> = {
  table: Table<T>;
  pageSizeOptions: number[];
};

// "Showing x–y of n", rows-per-page picker and first/previous/next/last buttons
export function MyUiDataTablePagination<T>({ table, pageSizeOptions }: MyUiDataTablePaginationProps<T>) {
  const { pageIndex, pageSize } = table.getState().pagination;
  const total = table.getFilteredRowModel().rows.length;
  const from = total ? pageIndex * pageSize + 1 : 0;
  const to = Math.min(total, (pageIndex + 1) * pageSize);

  const pageButtons = [
    { label: "First page", icon: <ChevronsLeft />, onClick: table.firstPage, disabled: !table.getCanPreviousPage() },
    {
      label: "Previous page",
      icon: <ChevronLeft />,
      onClick: table.previousPage,
      disabled: !table.getCanPreviousPage(),
    },
    { label: "Next page", icon: <ChevronRight />, onClick: table.nextPage, disabled: !table.getCanNextPage() },
    { label: "Last page", icon: <ChevronsRight />, onClick: table.lastPage, disabled: !table.getCanNextPage() },
  ];

  return (
    <div className="flex flex-wrap items-center justify-between gap-3 text-sm text-muted-foreground">
      <span>{total ? `Showing ${from}–${to} of ${total}` : "No rows"}</span>
      <div className="flex items-center gap-2">
        <span className="hidden sm:inline">Rows per page</span>
        <Select value={String(pageSize)} onValueChange={(value) => table.setPageSize(Number(value))}>
          <SelectTrigger size="sm" className="w-[4.5rem]" aria-label="Rows per page">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {pageSizeOptions.map((option) => (
              <SelectItem key={option} value={String(option)}>
                {option}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <span className="whitespace-nowrap">
          Page {pageIndex + 1} of {Math.max(table.getPageCount(), 1)}
        </span>
        {pageButtons.map((button) => (
          <Button
            key={button.label}
            variant="outline"
            size="icon"
            className="size-8"
            aria-label={button.label}
            onClick={() => button.onClick()}
            disabled={button.disabled}
          >
            {button.icon}
          </Button>
        ))}
      </div>
    </div>
  );
}
