import { useState } from "react";
import { Link } from "@tanstack/react-router";
import { ReceiptText, UserRound, Upload } from "lucide-react";
import { AppHeader } from "frontend-common";
// MyUiButton adds icon slots around its children, so a link inside it needs the plain Button
import { Button, MyUiButton, MyUiEmpty, MyUiSpinner } from "my-ui";
import { InvoicesTable } from "@/components/invoices-table";
import { InvoicesTabs } from "@/components/invoices-tabs";
import { UploadInvoiceDialog } from "@/components/upload-invoice-dialog";
import { useInvoices } from "./api/hooks";

export const InvoicesPage = () => {
  const { data: invoices = [], isLoading } = useInvoices();
  const [uploadOpen, setUploadOpen] = useState(false);

  return (
    <div className="flex min-h-svh flex-col">
      <AppHeader
        app="Invoices"
        page="All invoices"
        actions={
          <Button asChild variant="ghost" size="sm">
            <Link to="/profile">
              <UserRound />
              Profile
            </Link>
          </Button>
        }
      />
      <InvoicesTabs />
      <main className="mx-auto w-full max-w-6xl flex-1 space-y-6 px-4 py-6 md:px-6">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h1 className="text-2xl font-bold">Invoices</h1>
            <p className="text-muted-foreground">Upload invoices, then open one to check and correct its data.</p>
          </div>
          <MyUiButton icon={<Upload />} onClick={() => setUploadOpen(true)}>
            Upload
          </MyUiButton>
        </div>

        {isLoading ? (
          <MyUiSpinner label="Loading invoices…" className="py-16" />
        ) : invoices.length ? (
          <InvoicesTable invoices={invoices} />
        ) : (
          <MyUiEmpty
            icon={<ReceiptText />}
            title="No invoices yet"
            description="Upload a PDF, a scan or photo, or an XML e-invoice; its data is read automatically."
            action={<MyUiButton onClick={() => setUploadOpen(true)}>Upload an invoice</MyUiButton>}
            className="rounded-lg border border-dashed"
          />
        )}
      </main>
      <UploadInvoiceDialog open={uploadOpen} onOpenChange={setUploadOpen} />
    </div>
  );
};
