import type { ComponentProps, ReactNode } from "react";
import type { Button } from "my-ui/ui/button";

export type MyUiDataTableColumn<T> = {
  id: string;
  header: ReactNode;
  // Value used for sorting and search; defaults to row[id]
  accessor?: (row: T) => unknown;
  // Defaults to the accessor value as text
  cell?: (row: T) => ReactNode;
  sortable?: boolean;
  // Included in the search box (default true)
  searchable?: boolean;
  className?: string;
};

// Asks before running an action; the description gets the affected rows
export type MyUiActionConfirm<T> = {
  title: ReactNode;
  description?: ReactNode | ((rows: T[]) => ReactNode);
  confirmText?: ReactNode;
};

// One entry in each row's menu
export type MyUiRowAction<T> = {
  label: ReactNode;
  icon?: ReactNode;
  onSelect: (row: T) => void;
  destructive?: boolean;
  hidden?: (row: T) => boolean;
  disabled?: (row: T) => boolean;
  confirm?: MyUiActionConfirm<T>;
};

// A toolbar button shown while rows are selected; selection clears after it runs
export type MyUiBulkAction<T> = {
  label: ReactNode;
  icon?: ReactNode;
  onSelect: (rows: T[]) => void;
  destructive?: boolean;
  disabled?: (rows: T[]) => boolean;
  // Shown on hover, also while disabled
  tooltip?: ReactNode;
  confirm?: MyUiActionConfirm<T>;
};

// An always-visible toolbar button (create, refresh, export, ...)
export type MyUiTableAction = {
  label: ReactNode;
  icon?: ReactNode;
  onClick: () => void;
  variant?: ComponentProps<typeof Button>["variant"];
  disabled?: boolean;
  loading?: boolean;
  // Shown on hover, also while disabled
  tooltip?: ReactNode;
};

// A dropdown in the toolbar; the chosen option keeps only the rows it matches (no `match`: every row)
export type MyUiDataTableFilter<T> = {
  id: string;
  label: ReactNode;
  options: { value: string; label: ReactNode; match?: (row: T) => boolean }[];
  // Option chosen at first; defaults to the first option
  defaultValue?: string;
  // CSS width of the dropdown, e.g. 180 or "12rem"
  width?: number | string;
  // Shown on hover, also while disabled
  tooltip?: ReactNode;
  disabled?: boolean;
  // Hidden behind the "Show more" button until it is opened
  more?: boolean;
};

export type MyUiDataTableProps<T> = {
  data: T[];
  columns: MyUiDataTableColumn<T>[];
  getRowId: (row: T) => string;
  singleRowActions?: MyUiRowAction<T>[];
  // Adds a checkbox column
  multiRowActions?: MyUiBulkAction<T>[];
  tableActions?: MyUiTableAction[];
  filters?: MyUiDataTableFilter<T>[];
  searchable?: boolean;
  searchPlaceholder?: string;
  pageSize?: number;
  pageSizeOptions?: number[];
  loading?: boolean;
  emptyText?: ReactNode;
  className?: string;
};

// Runs an action now, or after the confirm dialog when it has `confirm`
export type RunTableAction<T> = (
  confirm: MyUiActionConfirm<T> | undefined,
  rows: T[],
  destructive: boolean,
  run: () => void,
) => void;
