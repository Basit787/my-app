import { useEffect, useMemo, useState, type ReactNode } from "react";
import {
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
  type PaginationState,
  type RowSelectionState,
  type SortingState,
} from "@tanstack/react-table";
import { Skeleton } from "my-ui/ui/skeleton";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "my-ui/ui/table";
import { cn } from "my-ui/lib/utils";
import { MyUiAlertDialog } from "../surface/my-ui-alert-dialog";
import { ACTIONS_COLUMN_ID, buildColumns, SELECT_COLUMN_ID } from "./my-ui-data-table-columns";
import { MyUiDataTablePagination } from "./my-ui-data-table-pagination";
import { MyUiDataTableToolbar } from "./my-ui-data-table-toolbar";
import type { MyUiDataTableProps, RunTableAction } from "./my-ui-data-table.types";

type PendingConfirm = {
  title: ReactNode;
  description?: ReactNode;
  confirmText?: ReactNode;
  destructive?: boolean;
  run: () => void;
};

const SKELETON_ROWS = 5;

// Sortable, searchable, paginated table from plain column and action configs; spread one config object into it
export function MyUiDataTable<T>({
  data,
  columns,
  getRowId,
  singleRowActions,
  multiRowActions,
  tableActions,
  searchable = true,
  searchPlaceholder = "Search…",
  pageSize = 10,
  pageSizeOptions = [10, 20, 50],
  loading,
  emptyText = "No data",
  className,
}: MyUiDataTableProps<T>) {
  const [sorting, setSorting] = useState<SortingState>([]);
  const [rowSelection, setRowSelection] = useState<RowSelectionState>({});
  const [globalFilter, setGlobalFilter] = useState("");
  const [pagination, setPagination] = useState<PaginationState>({ pageIndex: 0, pageSize });
  const [pending, setPending] = useState<PendingConfirm | null>(null);

  const selectable = !!multiRowActions?.length;
  const classNames = useMemo(() => new Map(columns.map((column) => [column.id, column.className])), [columns]);

  const tableColumns = useMemo(() => {
    const runAction: RunTableAction<T> = (confirm, rows, destructive, run) => {
      if (!confirm) return run();
      const description = typeof confirm.description === "function" ? confirm.description(rows) : confirm.description;
      setPending({ title: confirm.title, description, confirmText: confirm.confirmText, destructive, run });
    };
    return { runAction, defs: buildColumns({ columns, selectable, singleRowActions, runAction }) };
  }, [columns, selectable, singleRowActions]);

  const table = useReactTable({
    data,
    columns: tableColumns.defs,
    getRowId: (row) => getRowId(row),
    state: { sorting, rowSelection, globalFilter, pagination },
    onSortingChange: setSorting,
    onRowSelectionChange: setRowSelection,
    onGlobalFilterChange: setGlobalFilter,
    onPaginationChange: setPagination,
    enableRowSelection: selectable,
    globalFilterFn: "includesString",
    // Keep the page when data refreshes; the effect below pulls it back if it no longer exists
    autoResetPageIndex: false,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
  });

  const pageCount = table.getPageCount();
  useEffect(() => {
    if (pagination.pageIndex > 0 && pagination.pageIndex >= pageCount) {
      setPagination((current) => ({ ...current, pageIndex: Math.max(0, pageCount - 1) }));
    }
  }, [pageCount, pagination.pageIndex]);

  const columnCount = table.getVisibleLeafColumns().length;
  const rows = table.getRowModel().rows;

  return (
    <div className={cn("flex flex-col gap-3", className)}>
      <MyUiDataTableToolbar
        search={
          searchable
            ? {
                value: globalFilter,
                placeholder: searchPlaceholder,
                onChange: (value) => {
                  setGlobalFilter(value);
                  setPagination((current) => ({ ...current, pageIndex: 0 }));
                },
              }
            : undefined
        }
        selectedRows={table.getSelectedRowModel().rows.map((row) => row.original)}
        multiRowActions={multiRowActions}
        tableActions={tableActions}
        runAction={tableColumns.runAction}
        onClearSelection={() => table.resetRowSelection()}
      />

      <div className="rounded-md border">
        <Table>
          <TableHeader>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers.map((header) => (
                  <TableHead
                    key={header.id}
                    className={cn(
                      header.column.id === SELECT_COLUMN_ID && "w-10",
                      header.column.id === ACTIONS_COLUMN_ID && "w-12",
                      classNames.get(header.column.id),
                    )}
                  >
                    {header.isPlaceholder ? null : flexRender(header.column.columnDef.header, header.getContext())}
                  </TableHead>
                ))}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {loading ? (
              Array.from({ length: SKELETON_ROWS }, (_, index) => (
                <TableRow key={index}>
                  {Array.from({ length: columnCount }, (_, cell) => (
                    <TableCell key={cell}>
                      <Skeleton className="h-4 w-full" />
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : rows.length ? (
              rows.map((row) => (
                <TableRow key={row.id} data-state={row.getIsSelected() ? "selected" : undefined}>
                  {row.getVisibleCells().map((cell) => (
                    <TableCell key={cell.id} className={classNames.get(cell.column.id)}>
                      {flexRender(cell.column.columnDef.cell, cell.getContext())}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={columnCount} className="h-24 text-center text-muted-foreground">
                  {globalFilter ? "No matching rows" : emptyText}
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      <MyUiDataTablePagination table={table} pageSizeOptions={pageSizeOptions} />

      <MyUiAlertDialog
        open={!!pending}
        onOpenChange={(open) => !open && setPending(null)}
        title={pending?.title}
        description={pending?.description}
        confirmText={pending?.confirmText ?? "Confirm"}
        destructive={pending?.destructive}
        onConfirm={() => {
          pending?.run();
          setPending(null);
        }}
      />
    </div>
  );
}
