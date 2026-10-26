import { Search, X } from "lucide-react";
import { Button } from "my-ui/ui/button";
import { Input } from "my-ui/ui/input";
import { MyUiButton } from "../button/my-ui-button";
import { MyUiTooltip } from "../surface/my-ui-tooltip";
import type { MyUiBulkAction, MyUiTableAction, RunTableAction } from "./my-ui-data-table.types";

type MyUiDataTableToolbarProps<T> = {
  search?: { value: string; placeholder: string; onChange: (value: string) => void };
  selectedRows: T[];
  multiRowActions?: MyUiBulkAction<T>[];
  tableActions?: MyUiTableAction[];
  runAction: RunTableAction<T>;
  onClearSelection: () => void;
};

// Search box on the left; bulk actions (while rows are selected) and table actions on the right
export function MyUiDataTableToolbar<T>({
  search,
  selectedRows,
  multiRowActions,
  tableActions,
  runAction,
  onClearSelection,
}: MyUiDataTableToolbarProps<T>) {
  return (
    <div className="flex flex-wrap items-center gap-2">
      {search && (
        <div className="relative w-full sm:max-w-xs">
          <Search className="pointer-events-none absolute top-1/2 left-2.5 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={search.value}
            onChange={(event) => search.onChange(event.target.value)}
            placeholder={search.placeholder}
            className="pl-8"
          />
        </div>
      )}
      <div className="ml-auto flex flex-wrap items-center gap-2">
        {!!multiRowActions?.length && selectedRows.length > 0 && (
          <>
            <span className="text-sm text-muted-foreground">{selectedRows.length} selected</span>
            {multiRowActions.map((action, index) => (
              <MyUiTooltip key={index} text={action.tooltip}>
                {/* The span keeps the tooltip working on a disabled button */}
                <span className="inline-flex">
                  <Button
                    size="sm"
                    variant={action.destructive ? "destructive" : "outline"}
                    disabled={action.disabled?.(selectedRows)}
                    onClick={() =>
                      runAction(action.confirm, selectedRows, !!action.destructive, () => {
                        action.onSelect(selectedRows);
                        onClearSelection();
                      })
                    }
                  >
                    {action.icon}
                    {action.label}
                  </Button>
                </span>
              </MyUiTooltip>
            ))}
            <Button size="sm" variant="ghost" onClick={onClearSelection}>
              <X />
              Clear
            </Button>
          </>
        )}
        {tableActions?.map((action, index) => (
          <MyUiTooltip key={index} text={action.tooltip}>
            <span className="inline-flex">
              <MyUiButton
                size="sm"
                variant={action.variant ?? "outline"}
                icon={action.icon}
                loading={action.loading}
                disabled={action.disabled}
                onClick={action.onClick}
              >
                {action.label}
              </MyUiButton>
            </span>
          </MyUiTooltip>
        ))}
      </div>
    </div>
  );
}
