import { useEffect } from "react";
import { MyUiResizable, MyUiSpinner, useAppForm, useIsMobile } from "my-ui";
import type { InvoiceDetail } from "@/features/invoices/api/api";
import { useUpdateInvoice } from "@/features/invoices/api/hooks";
import { toFormValues } from "@/features/invoices/utils/to-form-values";
import { toInvoiceUpdate } from "@/features/invoices/utils/to-invoice-update";
import { InvoiceLineItemsEditor } from "./invoice-line-items-editor";
import { InvoiceSidePanel } from "./invoice-side-panel";
import { InvoiceViewer } from "./invoice-viewer";

type InvoiceWorkspaceProps = { invoice: InvoiceDetail };

// One form for the whole invoice: the file over its line items in the middle, the other fields in a resizable right pane
export const InvoiceWorkspace = ({ invoice }: InvoiceWorkspaceProps) => {
  const update = useUpdateInvoice();
  const isMobile = useIsMobile();
  const isReading = invoice.status === "UPLOADED" || invoice.status === "PROCESSING";

  const form = useAppForm({
    defaultValues: toFormValues(invoice),
    onSubmit: async ({ value }) => {
      try {
        await update.mutateAsync({ id: invoice.id, changes: toInvoiceUpdate(value) });
      } catch {
        // useUpdateInvoice already showed the error
      }
    },
  });

  // Saved or re-read values replace what the form holds
  useEffect(() => {
    form.reset(toFormValues(invoice));
  }, [form, invoice]);

  const lineItems = isReading ? (
    <MyUiSpinner label="Reading the line items…" className="h-full" />
  ) : (
    <InvoiceLineItemsEditor form={form} />
  );

  const center = (
    <MyUiResizable
      orientation="vertical"
      className="h-full"
      panels={[
        { content: <InvoiceViewer form={form} invoice={invoice} />, defaultSize: "62%", minSize: "20%" },
        { content: lineItems, defaultSize: "38%", minSize: "12%" },
      ]}
    />
  );
  const details = <InvoiceSidePanel form={form} invoice={invoice} />;

  // Phones stack the panes; wider screens drag the divider between the file and the details
  if (isMobile) {
    return (
      <form.AppForm>
        <form.Form className="flex flex-col">
          <div className="h-[85svh]">{center}</div>
          <aside className="border-t">{details}</aside>
        </form.Form>
      </form.AppForm>
    );
  }

  return (
    <form.AppForm>
      <form.Form className="h-[calc(100svh-3rem)]">
        <MyUiResizable
          className="h-full"
          panels={[
            { content: center, defaultSize: "70%", minSize: "40%" },
            {
              content: <aside className="h-full overflow-y-auto border-l">{details}</aside>,
              defaultSize: "30%",
              minSize: "20%",
            },
          ]}
        />
      </form.Form>
    </form.AppForm>
  );
};
