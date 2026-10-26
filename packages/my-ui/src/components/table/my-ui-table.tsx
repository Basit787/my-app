import type { ReactNode } from "react";
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableFooter,
  TableHead,
  TableHeader,
  TableRow,
} from "my-ui/ui/table";

export type MyUiTableColumn<T> = {
  key: string;
  header: ReactNode;
  // Defaults to row[key]
  cell?: (row: T) => ReactNode;
  className?: string;
};

type MyUiTableProps<T> = {
  columns: MyUiTableColumn<T>[];
  data: T[];
  rowKey?: (row: T, index: number) => string;
  caption?: ReactNode;
  footer?: ReactNode;
  emptyText?: ReactNode;
  className?: string;
};

export function MyUiTable<T>({
  columns,
  data,
  rowKey,
  caption,
  footer,
  emptyText = "No data",
  className,
}: MyUiTableProps<T>) {
  return (
    <Table className={className}>
      {caption && <TableCaption>{caption}</TableCaption>}
      <TableHeader>
        <TableRow>
          {columns.map((column) => (
            <TableHead key={column.key} className={column.className}>
              {column.header}
            </TableHead>
          ))}
        </TableRow>
      </TableHeader>
      <TableBody>
        {data.length === 0 ? (
          <TableRow>
            <TableCell colSpan={columns.length} className="h-24 text-center text-muted-foreground">
              {emptyText}
            </TableCell>
          </TableRow>
        ) : (
          data.map((row, index) => (
            <TableRow key={rowKey ? rowKey(row, index) : index}>
              {columns.map((column) => (
                <TableCell key={column.key} className={column.className}>
                  {column.cell ? column.cell(row) : (row as Record<string, ReactNode>)[column.key]}
                </TableCell>
              ))}
            </TableRow>
          ))
        )}
      </TableBody>
      {footer && (
        <TableFooter>
          <TableRow>
            <TableCell colSpan={columns.length}>{footer}</TableCell>
          </TableRow>
        </TableFooter>
      )}
    </Table>
  );
}
