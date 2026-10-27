import { useState } from "react";
import { CircleAlert, RotateCw } from "lucide-react";
import { MyUiAlertDialog, MyUiButton, MyUiSpinner, withForm } from "my-ui";
import type { Invoice } from "@/features/invoices/api/api";
import { useEditPlan, useReextractInvoice } from "@/features/invoices/api/hooks";
import type { InvoiceFormValues } from "@/features/invoices/types/invoice-form-values";
import { EMPTY_FORM_VALUES } from "@/features/invoices/utils/empty-form-values";
import { toInvoiceUpdate } from "@/features/invoices/utils/to-invoice-update";
import { EDITABLE_CONTENT_TYPES } from "@/lib/editable-content-types";
import { useDebouncedValue } from "@/lib/use-debounced-value";
import { EditOverlay } from "./edit-overlay";
import { InvoiceDocument } from "./invoice-document";
import { InvoiceImagePreview } from "./invoice-image-preview";
import { InvoicePages } from "./invoice-pages";

// Typing pauses this long before the server places the changes
const PREVIEW_DELAY_MS = 300;

type LivePreviewBodyProps = { invoice: Invoice; values: InvoiceFormValues };

// The original with the form's values drawn where the old ones are printed, exactly as Download PDF writes them
const LivePreviewBody = ({ invoice, values }: LivePreviewBodyProps) => {
  // A string, so the delay restarts only when a value really changes
  const changesJson = useDebouncedValue(JSON.stringify(toInvoiceUpdate(values)), PREVIEW_DELAY_MS);
  const { data: plan, isError } = useEditPlan(invoice.id, JSON.parse(changesJson));
  const reextract = useReextractInvoice();
  const [confirmOpen, setConfirmOpen] = useState(false);

  if (isError) return <p className="p-4 text-sm text-destructive">Could not preview the changes.</p>;
  if (!plan) return <MyUiSpinner label="Preparing the preview…" className="h-full" />;

  // No printed original to draw on (XML, TIFF, or read before positions were kept): a laid-out invoice instead
  // XML and TIFF have no original to draw on: a laid-out invoice, which is also what they download as
  if (!plan.supported && !EDITABLE_CONTENT_TYPES.includes(invoice.contentType)) {
    return (
      <div className="h-full overflow-auto bg-muted/40 p-4">
        <p className="mx-auto mb-3 max-w-3xl text-xs text-muted-foreground">
          {plan.reason}; this preview and the download are a generated invoice.
        </p>
        <InvoiceDocument values={values} />
      </div>
    );
  }

  // Read before word positions were kept: the original can only be edited after it is read again
  const needsReread = !plan.supported;
  const notes = needsReread ? (
    <div className="flex flex-wrap items-center gap-2 border-b bg-amber-50 px-3 py-2 text-xs text-amber-800 dark:bg-amber-950 dark:text-amber-200">
      <CircleAlert className="h-4 w-4 shrink-0" />
      <span className="flex-1">
        This invoice was read before edits could be placed on the original. Read it again to edit and download it.
      </span>
      <MyUiButton
        type="button"
        size="sm"
        variant="outline"
        icon={<RotateCw />}
        loading={reextract.isPending}
        onClick={() => setConfirmOpen(true)}
      >
        Read again
      </MyUiButton>
      <MyUiAlertDialog
        open={confirmOpen}
        onOpenChange={setConfirmOpen}
        title="Read the invoice again?"
        description="The fields, including your corrections, will be replaced by what is read from the file."
        confirmText="Read again"
        onConfirm={() => reextract.mutate(invoice.id)}
      />
    </div>
  ) : (
    plan.unplaced.length > 0 && (
      <div className="flex gap-2 border-b bg-amber-50 px-3 py-2 text-xs text-amber-800 dark:bg-amber-950 dark:text-amber-200">
        <CircleAlert className="h-4 w-4 shrink-0" />
        <span>Not changed on the original: {plan.unplaced.join(", ")}.</span>
      </div>
    )
  );
  const overlay = (pageIndex: number) => (needsReread ? null : <EditOverlay plan={plan} pageIndex={pageIndex} />);

  return (
    <div className="flex h-full flex-col">
      {notes}
      <div className="min-h-0 flex-1">
        {invoice.contentType === "application/pdf" && invoice.pageCount ? (
          <InvoicePages invoiceId={invoice.id} pageCount={invoice.pageCount} overlay={overlay} />
        ) : (
          <InvoiceImagePreview invoiceId={invoice.id} alt={invoice.filename} overlay={overlay(0)} />
        )}
      </div>
    </div>
  );
};

// Live preview of the edits on the original file, following the form as the user types
export const InvoiceLivePreview = withForm({
  defaultValues: EMPTY_FORM_VALUES,
  props: { invoice: {} as Invoice },
  render: function InvoiceLivePreviewRender({ form, invoice }) {
    return (
      <form.Subscribe selector={(state) => state.values}>
        {(values) => <LivePreviewBody invoice={invoice} values={values} />}
      </form.Subscribe>
    );
  },
});
