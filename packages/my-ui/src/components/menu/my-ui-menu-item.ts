import type { ReactNode } from "react";

// Entries for dropdown, context and menubar menus
export type MyUiMenuItem =
  | {
      type?: "item";
      label: ReactNode;
      icon?: ReactNode;
      shortcut?: string;
      onSelect?: () => void;
      disabled?: boolean;
      destructive?: boolean;
    }
  | {
      type: "checkbox";
      label: ReactNode;
      checked: boolean;
      onCheckedChange: (checked: boolean) => void;
      disabled?: boolean;
    }
  | { type: "label"; label: ReactNode }
  | { type: "separator" }
  | { type: "sub"; label: ReactNode; icon?: ReactNode; items: MyUiMenuItem[] };
