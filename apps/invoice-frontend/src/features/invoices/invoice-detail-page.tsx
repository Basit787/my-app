import { Link, useNavigate } from "@tanstack/react-router";
import { ArrowLeft, ChevronLeft, ChevronRight, FileText, FileWarning } from "lucide-react";
import { UserMenu } from "frontend-common";
import { MyUiButton, MyUiEmpty, MyUiSidebarLayout, MyUiSpinner, type MyUiSidebarItem } from "my-ui";
import { InvoiceStatusBadge } from "@/components/invoice-status-badge";
import { InvoiceWorkspace } from "@/components/invoice-workspace";
import { useInvoice, useInvoices } from "./api/hooks";

type InvoiceDetailPageProps = { invoiceId: string };

// Left: every invoice with previous / next; middle: the file over its line items; right: the other fields
export const InvoiceDetailPage = ({ invoiceId }: InvoiceDetailPageProps) => {
  const navigate = useNavigate();
  const { data: invoices = [] } = useInvoices();
  const { data: invoice, isLoading, isError } = useInvoice(invoiceId);

  // Same order as the list page: newest first
  const index = invoices.findIndex((inv) => inv.id === invoiceId);
  const previous = index > 0 ? invoices[index - 1] : null;
  const next = index >= 0 && index < invoices.length - 1 ? invoices[index + 1] : null;
  const open = (id: string) => void navigate({ to: "/invoices/$invoiceId", params: { invoiceId: id } });

  const items: MyUiSidebarItem[] = invoices.map((inv) => ({
    id: inv.id,
    title: inv.invoiceNumber ? `${inv.invoiceNumber} · ${inv.vendorName ?? inv.filename}` : inv.filename,
    icon: <FileText />,
    isActive: inv.id === invoiceId,
    onClick: () => open(inv.id),
  }));

  const header = (
    <Link to="/" className="flex items-center gap-2 px-2 py-1 text-sm font-medium hover:underline">
      <ArrowLeft className="h-4 w-4" />
      All invoices
    </Link>
  );

  const footer = (
    <div className="grid grid-cols-2 gap-2">
      <MyUiButton
        variant="outline"
        size="sm"
        icon={<ChevronLeft />}
        disabled={!previous}
        onClick={() => previous && open(previous.id)}
      >
        Previous
      </MyUiButton>
      <MyUiButton
        variant="outline"
        size="sm"
        iconRight={<ChevronRight />}
        disabled={!next}
        onClick={() => next && open(next.id)}
      >
        Next
      </MyUiButton>
    </div>
  );

  const topBar = (
    <div className="flex min-w-0 flex-1 items-center gap-3">
      <span className="truncate font-medium">{invoice?.filename ?? "Invoice"}</span>
      {invoice && <InvoiceStatusBadge status={invoice.status} />}
      <div className="ml-auto flex shrink-0 items-center gap-3">
        {index >= 0 && (
          <span className="text-sm text-muted-foreground">
            {index + 1} of {invoices.length}
          </span>
        )}
        {/* Profile & settings, theme and sign out */}
        <UserMenu />
      </div>
    </div>
  );

  let content;
  if (isLoading) {
    content = <MyUiSpinner label="Loading the invoice…" className="py-16" />;
  } else if (isError || !invoice) {
    content = (
      <MyUiEmpty
        icon={<FileWarning />}
        title="Invoice not found"
        description="It may have been deleted."
        action={
          <MyUiButton variant="outline" onClick={() => void navigate({ to: "/" })}>
            Back to all invoices
          </MyUiButton>
        }
        className="py-16"
      />
    );
  } else {
    content = <InvoiceWorkspace key={invoice.id} invoice={invoice} />;
  }

  return (
    <MyUiSidebarLayout
      sections={[{ label: `Invoices (${invoices.length})`, items }]}
      header={header}
      footer={footer}
      topBar={topBar}
    >
      {content}
    </MyUiSidebarLayout>
  );
};
