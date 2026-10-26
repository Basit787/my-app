import type { ReactNode } from "react";
import { useNavigate, useRouterState } from "@tanstack/react-router";
import { Images } from "lucide-react";
import { AppBreadcrumbs, MobileBottomNav, UserMenu } from "frontend-common";
import { MyUiSidebarLayout } from "my-ui";
import { IMAGE_VIEWS } from "@/lib/image-views";
import { useViewCounts } from "@/lib/use-view-counts";
import { UploadFab } from "./upload-fab";

type AppShellProps = { children: ReactNode };

// Sidebar and top bar on desktop, bottom tab bar on mobile, and the floating upload button
export const AppShell = ({ children }: AppShellProps) => {
  const navigate = useNavigate();
  const pathname = useRouterState({ select: (state) => state.location.pathname });
  const counts = useViewCounts();
  const current = IMAGE_VIEWS.find((view) => view.to === pathname) ?? IMAGE_VIEWS[0];

  return (
    <MyUiSidebarLayout
      header={
        <div className="flex items-center gap-2 px-2 py-1.5">
          <div className="flex size-8 items-center justify-center rounded-lg bg-primary text-primary-foreground">
            <Images className="size-4" />
          </div>
          <span className="font-semibold">Image Upload</span>
        </div>
      }
      sections={[
        {
          label: "Library",
          items: IMAGE_VIEWS.map((view) => ({
            title: view.label,
            icon: <view.icon />,
            isActive: view.to === current.to,
            onClick: () => void navigate({ to: view.to }),
            badge: counts[view.to] || undefined,
          })),
        },
      ]}
      topBarClassName="max-md:hidden"
      topBar={
        <>
          <AppBreadcrumbs app="Image Upload" page={current.label} className="min-w-0" />
          <div className="ml-auto">
            <UserMenu />
          </div>
        </>
      }
    >
      <main className="mx-auto w-full max-w-6xl flex-1 px-4 pt-6 pb-28 md:px-6 md:pb-10">{children}</main>
      <MobileBottomNav
        className="fixed inset-x-0 bottom-0 z-20"
        items={IMAGE_VIEWS.map((view) => ({
          key: view.to,
          label: view.label,
          icon: <view.icon />,
          active: view.to === current.to,
          badge: counts[view.to],
          onSelect: () => void navigate({ to: view.to }),
        }))}
      />
      <UploadFab />
    </MyUiSidebarLayout>
  );
};
