import { createFileRoute } from "@tanstack/react-router";
import { Link2 } from "lucide-react";
import { AuthGate } from "frontend-common";
import { ModeToggle } from "my-ui";
import { LinksPage } from "@/features/links/links-page";

export const Route = createFileRoute("/")({ component: IndexPage });

function IndexPage() {
  return (
    <AuthGate
      appName="Link Shortener"
      logo={
        <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-primary text-primary-foreground">
          <Link2 className="h-6 w-6" />
        </div>
      }
      headerRight={<ModeToggle />}
    >
      <LinksPage />
    </AuthGate>
  );
}
