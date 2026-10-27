import { useState } from "react";
import { ChevronDown, ChevronUp, Search, X } from "lucide-react";
import { Button } from "my-ui/ui/button";
import { Input } from "my-ui/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "my-ui/ui/select";
import { MyUiButton } from "../button/my-ui-button";
import { MyUiTooltip } from "../surface/my-ui-tooltip";
import type { MyUiBulkAction, MyUiDataTableFilter, MyUiTableAction, RunTableAction } from "./my-ui-data-table.types";

type ToolbarFilter<T> = MyUiDataTableFilter<T> & { value: string; onChange: (value: string) => void };

type MyUiDataTableToolbarProps<T> = {
  search?: { value: string; placeholder: string; onChange: (value: string) => void };
  selectedRows: T[];
  multiRowActions?: MyUiBulkAction<T>[];
  tableActions?: MyUiTableAction[];
  filters?: ToolbarFilter<T>[];
  runAction: RunTableAction<T>;
  onClearSelection: () => void;
};

// Search box and filters on the left; bulk actions (while rows are selected) and table actions on the right
export function MyUiDataTableToolbar<T>({
  search,
  selectedRows,
  multiRowActions,
  tableActions,
  filters,
  runAction,
  onClearSelection,
}: MyUiDataTableToolbarProps<T>) {
  const [showMore, setShowMore] = useState(false);
  const moreCount = filters?.filter((filter) => filter.more).length ?? 0;
  const visibleFilters = filters?.filter((filter) => showMore || !filter.more);

  const renderFilter = (filter: ToolbarFilter<T>) => (
    <MyUiTooltip key={filter.id} text={filter.tooltip}>
      {/* The span keeps the tooltip working on a disabled dropdown */}
      <span className="inline-flex">
        <Select value={filter.value} onValueChange={filter.onChange} disabled={filter.disabled}>
          <SelectTrigger
            size="sm"
            style={{ width: filter.width }}
            aria-label={typeof filter.label === "string" ? filter.label : filter.id}
          >
            <span className="text-muted-foreground">{filter.label}:</span>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {filter.options.map((option) => (
              <SelectItem key={option.value} value={option.value}>
                {option.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </span>
    </MyUiTooltip>
  );

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
      {visibleFilters?.map(renderFilter)}
      {moreCount > 0 && (
        <Button size="sm" variant="ghost" onClick={() => setShowMore((open) => !open)}>
          {showMore ? <ChevronUp /> : <ChevronDown />}
          {showMore ? "Show less" : `Show more (${moreCount})`}
        </Button>
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
