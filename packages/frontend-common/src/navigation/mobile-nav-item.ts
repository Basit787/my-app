import type { ReactNode } from "react";

// One tab in the mobile bottom navigation
export type MobileNavItem = {
  key: string;
  label: string;
  icon: ReactNode;
  active?: boolean;
  badge?: number;
  onSelect: () => void;
};
