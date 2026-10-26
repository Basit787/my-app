import type { ReactNode } from "react";
import {
  ContextMenu,
  ContextMenuCheckboxItem,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuLabel,
  ContextMenuSeparator,
  ContextMenuShortcut,
  ContextMenuSub,
  ContextMenuSubContent,
  ContextMenuSubTrigger,
  ContextMenuTrigger,
} from "my-ui/ui/context-menu";
import type { MyUiMenuItem } from "./my-ui-menu-item";

type MyUiContextMenuProps = {
  // The area that opens the menu on right-click / long-press
  children: ReactNode;
  items: MyUiMenuItem[];
  className?: string;
};

function renderItems(items: MyUiMenuItem[]): ReactNode {
  return items.map((item, index) => {
    if (item.type === "separator") return <ContextMenuSeparator key={index} />;
    if (item.type === "label") return <ContextMenuLabel key={index}>{item.label}</ContextMenuLabel>;
    if (item.type === "checkbox")
      return (
        <ContextMenuCheckboxItem
          key={index}
          checked={item.checked}
          onCheckedChange={item.onCheckedChange}
          disabled={item.disabled}
        >
          {item.label}
        </ContextMenuCheckboxItem>
      );
    if (item.type === "sub")
      return (
        <ContextMenuSub key={index}>
          <ContextMenuSubTrigger>
            {item.icon}
            {item.label}
          </ContextMenuSubTrigger>
          <ContextMenuSubContent>{renderItems(item.items)}</ContextMenuSubContent>
        </ContextMenuSub>
      );
    return (
      <ContextMenuItem
        key={index}
        onSelect={item.onSelect}
        disabled={item.disabled}
        variant={item.destructive ? "destructive" : "default"}
      >
        {item.icon}
        {item.label}
        {item.shortcut && <ContextMenuShortcut>{item.shortcut}</ContextMenuShortcut>}
      </ContextMenuItem>
    );
  });
}

export function MyUiContextMenu({ children, items, className }: MyUiContextMenuProps) {
  return (
    <ContextMenu>
      <ContextMenuTrigger asChild>{children}</ContextMenuTrigger>
      <ContextMenuContent className={className}>{renderItems(items)}</ContextMenuContent>
    </ContextMenu>
  );
}
