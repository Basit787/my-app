import { Outlet, createFileRoute } from "@tanstack/react-router";
import { Images } from "lucide-react";
import { AuthGate } from "frontend-common";
import { ModeToggle } from "my-ui";
import { AppShell } from "@/components/app-shell";

// Signed-in layout for every page: the shell around the current view
export const Route = createFileRoute("/_app")({ component: AppLayout });

function AppLayout() {
  return (
    <AuthGate
      appName="Image Upload"
      logo={
        <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-primary text-primary-foreground">
          <Images className="h-6 w-6" />
        </div>
      }
      headerRight={<ModeToggle />}
    >
      <AppShell>
        <Outlet />
      </AppShell>
    </AuthGate>
  );
}
