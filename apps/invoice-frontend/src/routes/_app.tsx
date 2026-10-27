import { Outlet, createFileRoute } from "@tanstack/react-router";
import { ReceiptText } from "lucide-react";
import { AuthGate } from "frontend-common";
import { ModeToggle } from "my-ui";
import { useInvoiceEvents } from "@/features/invoices/api/hooks";

// Signed-in layout for every page; one event stream keeps the list and the open invoice live
export const Route = createFileRoute("/_app")({ component: AppLayout });

function AppLayout() {
  return (
    <AuthGate
      appName="Invoices"
      logo={
        <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-primary text-primary-foreground">
          <ReceiptText className="h-6 w-6" />
        </div>
      }
      headerRight={<ModeToggle />}
    >
      <LiveOutlet />
    </AuthGate>
  );
}

// Inside AuthGate, so the stream opens only once signed in
function LiveOutlet() {
  useInvoiceEvents();
  return <Outlet />;
}
