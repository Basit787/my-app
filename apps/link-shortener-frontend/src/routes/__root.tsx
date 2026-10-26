import { Outlet, createRootRoute } from "@tanstack/react-router";
import { TanStackDevtools } from "@tanstack/react-devtools";
import { TanStackRouterDevtoolsPanel } from "@tanstack/react-router-devtools";
import { AppProviders } from "frontend-common";
import { authClient } from "@/lib/auth";
import { queryClient } from "@/lib/query-client";
import "../styles.css";

export const Route = createRootRoute({ component: RootComponent });

function RootComponent() {
  return (
    <AppProviders authClient={authClient} queryClient={queryClient}>
      <Outlet />
      {import.meta.env.DEV && (
        <TanStackDevtools
          config={{ position: "middle-right" }}
          plugins={[{ name: "TanStack Router", render: <TanStackRouterDevtoolsPanel /> }]}
        />
      )}
    </AppProviders>
  );
}
