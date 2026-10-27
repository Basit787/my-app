import { useState } from "react";
import { useNavigate } from "@tanstack/react-router";
import { Download, RotateCcw, Save } from "lucide-react";
import { AppHeader } from "frontend-common";
import { MyUiAlertDialog, MyUiButton } from "my-ui";
import { BlockPalette } from "@/components/builder/block-palette";
import { BlockProperties } from "@/components/builder/block-properties";
import { InvoiceCanvas } from "@/components/builder/invoice-canvas";
import { InvoiceDataPanel } from "@/components/builder/invoice-data-panel";
import { InvoicesTabs } from "@/components/invoices-tabs";
import { useComposeInvoice, useDownloadComposedPdf } from "./api/hooks";
import { useBuilderStore } from "./store/builder-store";

// Left: blocks to drag onto the page; middle: the A4 page; right: the selected block and the invoice's values
export const CreateInvoicePage = () => {
  const navigate = useNavigate();
  const compose = useComposeInvoice();
  const download = useDownloadComposedPdf();
  const reset = useBuilderStore((state) => state.reset);
  const hasSelection = useBuilderStore((state) => state.selectedId !== null);
  const [confirmReset, setConfirmReset] = useState(false);
  const design = () => {
    const { blocks, data } = useBuilderStore.getState();
    return { blocks, data };
  };

  const save = () =>
    compose.mutate(design(), {
      onSuccess: (invoice) => {
        reset();
        void navigate({ to: "/invoices/$invoiceId", params: { invoiceId: invoice.id } });
      },
    });

  const actions = (
    <div className="flex gap-2">
      <MyUiButton type="button" variant="ghost" size="sm" icon={<RotateCcw />} onClick={() => setConfirmReset(true)}>
        Start over
      </MyUiButton>
      <MyUiButton
        type="button"
        variant="outline"
        size="sm"
        icon={<Download />}
        loading={download.isPending}
        onClick={() => download.mutate(design())}
      >
        Download PDF
      </MyUiButton>
      <MyUiButton type="button" size="sm" icon={<Save />} loading={compose.isPending} onClick={save}>
        Save invoice
      </MyUiButton>
    </div>
  );

  return (
    <div className="flex h-svh flex-col">
      <AppHeader app="Invoices" page="Create invoice" />
      <InvoicesTabs />
      <div className="flex flex-wrap items-center justify-between gap-2 border-b px-4 py-2 md:px-6">
        <p className="text-sm text-muted-foreground">
          Drag blocks onto the page, then fill in the details. Your draft is kept until you save it.
        </p>
        {actions}
      </div>
      <div className="flex min-h-0 flex-1 flex-col lg:flex-row">
        <aside className="shrink-0 overflow-y-auto border-b lg:w-56 lg:border-r lg:border-b-0">
          <BlockPalette />
        </aside>
        <main className="h-[75svh] min-w-0 flex-1 lg:h-auto">
          <InvoiceCanvas />
        </main>
        <aside className="shrink-0 space-y-4 overflow-y-auto border-t p-4 lg:w-96 lg:border-t-0 lg:border-l">
          {hasSelection && <BlockProperties />}
          <InvoiceDataPanel />
        </aside>
      </div>
      <MyUiAlertDialog
        open={confirmReset}
        onOpenChange={setConfirmReset}
        title="Start over?"
        description="The page goes back to the starting layout and your values are cleared."
        confirmText="Start over"
        destructive
        onConfirm={reset}
      />
    </div>
  );
};
