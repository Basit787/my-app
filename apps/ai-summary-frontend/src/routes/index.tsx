import { createFileRoute } from "@tanstack/react-router";
import { FileText } from "lucide-react";
import { AuthGate } from "frontend-common";
import { ModeToggle } from "my-ui";
import { DocumentsPage } from "@/features/documents/documents-page";

export const Route = createFileRoute("/")({ component: IndexPage });

function IndexPage() {
  return (
    <AuthGate
      appName="AI Summary"
      logo={
        <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-primary text-primary-foreground">
          <FileText className="h-6 w-6" />
        </div>
      }
      headerRight={<ModeToggle />}
    >
      <DocumentsPage />
    </AuthGate>
  );
}
