import { createFileRoute } from "@tanstack/react-router";
import { InvoiceDetailPage } from "@/features/invoices/invoice-detail-page";

export const Route = createFileRoute("/_app/invoices/$invoiceId")({ component: InvoiceRoute });

function InvoiceRoute() {
  const { invoiceId } = Route.useParams();
  return <InvoiceDetailPage invoiceId={invoiceId} />;
}
