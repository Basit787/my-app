import type { ReactNode } from "react";
import {
  Menubar,
  MenubarCheckboxItem,
  MenubarContent,
  MenubarItem,
  MenubarLabel,
  MenubarMenu,
  MenubarSeparator,
  MenubarShortcut,
  MenubarSub,
  MenubarSubContent,
  MenubarSubTrigger,
  MenubarTrigger,
} from "my-ui/ui/menubar";
import type { MyUiMenuItem } from "./my-ui-menu-item";

type MyUiMenubarProps = {
  menus: { label: ReactNode; items: MyUiMenuItem[] }[];
  className?: string;
};

function renderItems(items: MyUiMenuItem[]): ReactNode {
  return items.map((item, index) => {
    if (item.type === "separator") return <MenubarSeparator key={index} />;
    if (item.type === "label") return <MenubarLabel key={index}>{item.label}</MenubarLabel>;
    if (item.type === "checkbox")
      return (
        <MenubarCheckboxItem
          key={index}
          checked={item.checked}
          onCheckedChange={item.onCheckedChange}
          disabled={item.disabled}
        >
          {item.label}
        </MenubarCheckboxItem>
      );
    if (item.type === "sub")
      return (
        <MenubarSub key={index}>
          <MenubarSubTrigger>
            {item.icon}
            {item.label}
          </MenubarSubTrigger>
          <MenubarSubContent>{renderItems(item.items)}</MenubarSubContent>
        </MenubarSub>
      );
    return (
      <MenubarItem
        key={index}
        onSelect={item.onSelect}
        disabled={item.disabled}
        variant={item.destructive ? "destructive" : "default"}
      >
        {item.icon}
        {item.label}
        {item.shortcut && <MenubarShortcut>{item.shortcut}</MenubarShortcut>}
      </MenubarItem>
    );
  });
}

export function MyUiMenubar({ menus, className }: MyUiMenubarProps) {
  return (
    <Menubar className={className}>
      {menus.map((menu, index) => (
        <MenubarMenu key={index}>
          <MenubarTrigger>{menu.label}</MenubarTrigger>
          <MenubarContent>{renderItems(menu.items)}</MenubarContent>
        </MenubarMenu>
      ))}
    </Menubar>
  );
}
