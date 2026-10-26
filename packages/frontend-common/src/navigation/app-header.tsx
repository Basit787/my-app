import type { ReactNode } from "react";
import { cn } from "my-ui";
import { AppBreadcrumbs } from "./app-breadcrumbs";
import { UserMenu } from "./user-menu";

type AppHeaderProps = {
  // Current app, e.g. "Chat"; leave out on the home launcher itself
  app?: string;
  // Page inside the app, e.g. "Gallery"
  page?: string;
  // Extra buttons left of the avatar
  actions?: ReactNode;
  className?: string;
};

// Header every app shares: breadcrumbs on the left, the account menu on the right
export const AppHeader = ({ app, page, actions, className }: AppHeaderProps) => (
  <header
    className={cn(
      "sticky top-0 z-30 flex h-14 shrink-0 items-center gap-3 border-b bg-background/95 px-4 backdrop-blur md:px-6",
      className,
    )}
  >
    <AppBreadcrumbs app={app} page={page} className="min-w-0" />
    <div className="ml-auto flex items-center gap-2">
      {actions}
      <UserMenu />
    </div>
  </header>
);
