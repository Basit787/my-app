import type { ReactNode } from "react";
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuShortcut,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
  DropdownMenuTrigger,
} from "my-ui/ui/dropdown-menu";
import type { MyUiMenuItem } from "./my-ui-menu-item";

type MyUiDropdownMenuProps = {
  // The element that opens the menu, e.g. a button
  children: ReactNode;
  items: MyUiMenuItem[];
  align?: "start" | "center" | "end";
  side?: "top" | "right" | "bottom" | "left";
  className?: string;
};

function renderItems(items: MyUiMenuItem[]): ReactNode {
  return items.map((item, index) => {
    if (item.type === "separator") return <DropdownMenuSeparator key={index} />;
    if (item.type === "label") return <DropdownMenuLabel key={index}>{item.label}</DropdownMenuLabel>;
    if (item.type === "checkbox")
      return (
        <DropdownMenuCheckboxItem
          key={index}
          checked={item.checked}
          onCheckedChange={item.onCheckedChange}
          disabled={item.disabled}
        >
          {item.label}
        </DropdownMenuCheckboxItem>
      );
    if (item.type === "sub")
      return (
        <DropdownMenuSub key={index}>
          <DropdownMenuSubTrigger>
            {item.icon}
            {item.label}
          </DropdownMenuSubTrigger>
          <DropdownMenuSubContent>{renderItems(item.items)}</DropdownMenuSubContent>
        </DropdownMenuSub>
      );
    return (
      <DropdownMenuItem
        key={index}
        onSelect={item.onSelect}
        disabled={item.disabled}
        variant={item.destructive ? "destructive" : "default"}
      >
        {item.icon}
        {item.label}
        {item.shortcut && <DropdownMenuShortcut>{item.shortcut}</DropdownMenuShortcut>}
      </DropdownMenuItem>
    );
  });
}

export function MyUiDropdownMenu({ children, items, align = "end", side, className }: MyUiDropdownMenuProps) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>{children}</DropdownMenuTrigger>
      <DropdownMenuContent align={align} side={side} className={className}>
        {renderItems(items)}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
