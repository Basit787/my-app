import { useState } from "react";
import { RotateCw } from "lucide-react";
import { MyUiAlertDialog, MyUiButton, MyUiSpinner, MyUiTabs, withForm } from "my-ui";
import type { InvoiceDetail } from "@/features/invoices/api/api";
import { useReextractInvoice } from "@/features/invoices/api/hooks";
import { EMPTY_FORM_VALUES } from "@/features/invoices/utils/empty-form-values";
import { INVOICE_SOURCE_LABEL } from "@/lib/invoice-source-label";
import { InvoiceDetailsForm } from "./invoice-details-form";
import { InvoiceStatusBadge } from "./invoice-status-badge";

// Status, the details form with Save, and the text the fields were read from
export const InvoiceSidePanel = withForm({
  defaultValues: EMPTY_FORM_VALUES,
  props: { invoice: {} as InvoiceDetail },
  render: function InvoiceSidePanelRender({ form, invoice }) {
    const reextract = useReextractInvoice();
    const [confirmOpen, setConfirmOpen] = useState(false);
    const isReading = invoice.status === "UPLOADED" || invoice.status === "PROCESSING";

    const details = isReading ? (
      <MyUiSpinner label="Reading the invoice… OCR and the local model can take a minute." className="py-16" />
    ) : (
      <InvoiceDetailsForm form={form} />
    );

    const text = (
      <pre className="max-h-[70svh] overflow-auto rounded-lg border bg-muted/40 p-3 text-xs whitespace-pre-wrap">
        {invoice.extractedText || "No text yet."}
      </pre>
    );

    return (
      <div className="flex min-h-full flex-col">
        <div className="flex-1 space-y-4 p-4">
          <div className="flex flex-wrap items-center gap-2 text-sm">
            <InvoiceStatusBadge status={invoice.status} />
            {invoice.source && <span className="text-muted-foreground">{INVOICE_SOURCE_LABEL[invoice.source]}</span>}
            <MyUiButton
              type="button"
              variant="outline"
              size="sm"
              className="ml-auto"
              icon={<RotateCw />}
              disabled={isReading}
              loading={reextract.isPending}
              onClick={() => setConfirmOpen(true)}
            >
              Read again
            </MyUiButton>
          </div>
          {invoice.status === "FAILED" && invoice.error && (
            <p className="rounded-lg border border-destructive/40 bg-destructive/10 p-3 text-sm text-destructive">
              {invoice.error}
            </p>
          )}
          {invoice.source !== "XML" && invoice.status === "COMPLETED" && (
            <p className="text-xs text-muted-foreground">
              Check the fields against the file; OCR and the model can misread.
            </p>
          )}
          <MyUiTabs
            tabs={[
              { value: "details", label: "Details", content: details },
              { value: "text", label: "Text", content: text },
            ]}
          />
        </div>
        {!isReading && (
          <div className="sticky bottom-0 flex justify-end gap-2 border-t bg-background px-4 py-3">
            <MyUiButton type="button" variant="ghost" onClick={() => form.reset()}>
              Discard
            </MyUiButton>
            <form.SubmitButton>Save changes</form.SubmitButton>
          </div>
        )}
        <MyUiAlertDialog
          open={confirmOpen}
          onOpenChange={setConfirmOpen}
          title="Read the invoice again?"
          description="The fields, including your corrections, will be replaced."
          confirmText="Read again"
          onConfirm={() => reextract.mutate(invoice.id)}
        />
      </div>
    );
  },
});
