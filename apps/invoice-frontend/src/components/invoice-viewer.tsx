import { useState } from "react";
import { Download } from "lucide-react";
import { MyUiButton, MyUiToggleGroup, withForm } from "my-ui";
import type { Invoice } from "@/features/invoices/api/api";
import { useDownloadInvoice } from "@/features/invoices/api/hooks";
import { EMPTY_FORM_VALUES } from "@/features/invoices/utils/empty-form-values";
import { toInvoiceUpdate } from "@/features/invoices/utils/to-invoice-update";
import { InvoiceFileView } from "./invoice-file-view";
import { InvoiceLivePreview } from "./invoice-live-preview";

type View = "original" | "edited";

// The uploaded file, or a live preview of the form's values drawn on it, with downloads for both
export const InvoiceViewer = withForm({
  defaultValues: EMPTY_FORM_VALUES,
  props: { invoice: {} as Invoice },
  render: function InvoiceViewerRender({ form, invoice }) {
    const [view, setView] = useState<View>("original");
    const download = useDownloadInvoice();

    return (
      <div className="flex h-full flex-col">
        <div className="flex flex-wrap items-center gap-2 border-b px-3 py-2">
          <MyUiToggleGroup
            type="single"
            variant="outline"
            size="sm"
            value={view}
            onValueChange={(value) => value && setView(value as View)}
            items={[
              { value: "original", label: "Original" },
              { value: "edited", label: "Live preview" },
            ]}
          />
          <form.Subscribe selector={(state) => state.isPristine}>
            {(isPristine) =>
              !isPristine && (
                <span className="text-xs text-muted-foreground">
                  Unsaved changes; the preview and Download PDF already include them
                </span>
              )
            }
          </form.Subscribe>
          <div className="ml-auto flex gap-2">
            <MyUiButton
              type="button"
              variant="outline"
              size="sm"
              icon={<Download />}
              disabled={download.isPending}
              onClick={() => download.mutate({ invoice, edited: false })}
            >
              Original
            </MyUiButton>
            <MyUiButton
              type="button"
              size="sm"
              icon={<Download />}
              disabled={download.isPending}
              onClick={() => download.mutate({ invoice, edited: true, changes: toInvoiceUpdate(form.state.values) })}
            >
              Download PDF
            </MyUiButton>
          </div>
        </div>
        <div className="min-h-0 flex-1">
          {view === "original" ? (
            <InvoiceFileView invoice={invoice} />
          ) : (
            <InvoiceLivePreview form={form} invoice={invoice} />
          )}
        </div>
      </div>
    );
  },
});
