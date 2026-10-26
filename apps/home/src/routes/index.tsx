import { createFileRoute } from "@tanstack/react-router";
import { LayoutGrid } from "lucide-react";
import { AuthGate } from "frontend-common";
import { HomePage } from "@/components/home-page";
import { ModeToggle } from "my-ui";

export const Route = createFileRoute("/")({ component: HomeRoute });

function HomeRoute() {
  return (
    <AuthGate
      appName="Home"
      logo={
        <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-primary text-primary-foreground">
          <LayoutGrid className="h-6 w-6" />
        </div>
      }
      headerRight={<ModeToggle />}
    >
      <HomePage />
    </AuthGate>
  );
}
