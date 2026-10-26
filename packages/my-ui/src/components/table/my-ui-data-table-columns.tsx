import type { ColumnDef } from "@tanstack/react-table";
import { ArrowDown, ArrowUp, ArrowUpDown, MoreHorizontal } from "lucide-react";
import { Button } from "my-ui/ui/button";
import { Checkbox } from "my-ui/ui/checkbox";
import { MyUiDropdownMenu } from "../menu/my-ui-dropdown-menu";
import type { MyUiDataTableColumn, MyUiRowAction, RunTableAction } from "./my-ui-data-table.types";

export const SELECT_COLUMN_ID = "__select";
export const ACTIONS_COLUMN_ID = "__actions";

type BuildColumnsOptions<T> = {
  columns: MyUiDataTableColumn<T>[];
  selectable: boolean;
  singleRowActions?: MyUiRowAction<T>[];
  runAction: RunTableAction<T>;
};

// Turns the plain column configs into TanStack column defs, plus the checkbox and row-menu columns
export const buildColumns = <T,>({
  columns,
  selectable,
  singleRowActions,
  runAction,
}: BuildColumnsOptions<T>): ColumnDef<T>[] => {
  const defs: ColumnDef<T>[] = columns.map((column) => ({
    id: column.id,
    accessorFn: column.accessor ?? ((row: T) => (row as Record<string, unknown>)[column.id]),
    enableSorting: !!column.sortable,
    enableGlobalFilter: column.searchable ?? true,
    header: ({ column: tableColumn }) => {
      if (!column.sortable) return column.header;
      const sorted = tableColumn.getIsSorted();
      return (
        <Button variant="ghost" size="sm" className="-ml-3 h-8" onClick={tableColumn.getToggleSortingHandler()}>
          {column.header}
          {sorted === "asc" ? <ArrowUp /> : sorted === "desc" ? <ArrowDown /> : <ArrowUpDown className="opacity-50" />}
        </Button>
      );
    },
    cell: ({ row, getValue }) => {
      if (column.cell) return column.cell(row.original);
      const value = getValue();
      return value == null ? "" : String(value);
    },
  }));

  if (selectable) {
    defs.unshift({
      id: SELECT_COLUMN_ID,
      enableSorting: false,
      enableGlobalFilter: false,
      header: ({ table }) => (
        <Checkbox
          aria-label="Select all on this page"
          checked={table.getIsAllPageRowsSelected() || (table.getIsSomePageRowsSelected() && "indeterminate")}
          onCheckedChange={(checked) => table.toggleAllPageRowsSelected(!!checked)}
        />
      ),
      cell: ({ row }) => (
        <Checkbox
          aria-label="Select row"
          checked={row.getIsSelected()}
          onCheckedChange={(checked) => row.toggleSelected(!!checked)}
        />
      ),
    });
  }

  if (singleRowActions?.length) {
    defs.push({
      id: ACTIONS_COLUMN_ID,
      enableSorting: false,
      enableGlobalFilter: false,
      header: () => <span className="sr-only">Actions</span>,
      cell: ({ row }) => {
        const actions = singleRowActions.filter((action) => !action.hidden?.(row.original));
        if (!actions.length) return null;
        return (
          <MyUiDropdownMenu
            items={actions.map((action) => ({
              label: action.label,
              icon: action.icon,
              destructive: action.destructive,
              disabled: action.disabled?.(row.original),
              onSelect: () =>
                runAction(action.confirm, [row.original], !!action.destructive, () => action.onSelect(row.original)),
            }))}
          >
            <Button variant="ghost" size="icon" className="size-8" aria-label="Row actions">
              <MoreHorizontal />
            </Button>
          </MyUiDropdownMenu>
        );
      },
    });
  }

  return defs;
};
