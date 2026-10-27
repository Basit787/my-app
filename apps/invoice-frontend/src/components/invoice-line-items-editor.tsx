import { Plus, Trash2 } from "lucide-react";
import { MyUiButton, withForm } from "my-ui";
import type { LineItemFormValues } from "@/features/invoices/types/line-item-form-values";
import { EMPTY_FORM_VALUES } from "@/features/invoices/utils/empty-form-values";
import { validateAmount } from "@/features/invoices/utils/validate-amount";
import { cn } from "@/lib/utils";
import { LinesTotal } from "./lines-total";

const EMPTY_LINE: LineItemFormValues = { description: "", quantity: "", unitPrice: "", amount: "" };

// Description, quantity, unit price, amount, remove
const ROW = "grid grid-cols-[minmax(12rem,1fr)_5rem_7rem_7rem_2.25rem] items-start gap-2";

// The invoice's lines as an editable table under the file
export const InvoiceLineItemsEditor = withForm({
  defaultValues: EMPTY_FORM_VALUES,
  render: function InvoiceLineItemsEditorRender({ form }) {
    return (
      <form.AppField name="lineItems" mode="array">
        {(lines) => (
          <div className="flex h-full flex-col">
            <div className="flex flex-wrap items-center gap-3 border-b px-3 py-2">
              <h3 className="text-sm font-semibold">Line items ({lines.state.value.length})</h3>
              <form.Subscribe selector={(state) => [state.values.lineItems, state.values.subtotal] as const}>
                {([lineItems, subtotal]) => <LinesTotal lines={lineItems} subtotal={subtotal} />}
              </form.Subscribe>
              <MyUiButton
                type="button"
                variant="outline"
                size="sm"
                className="ml-auto"
                icon={<Plus />}
                onClick={() => lines.pushValue(EMPTY_LINE)}
              >
                Add line
              </MyUiButton>
            </div>
            <div className="min-h-0 flex-1 overflow-auto">
              <div className="min-w-[36rem] space-y-2 p-3">
                <div className={cn(ROW, "text-xs font-medium text-muted-foreground")}>
                  <span>Description</span>
                  <span>Qty</span>
                  <span>Unit price</span>
                  <span>Amount</span>
                  <span />
                </div>
                {lines.state.value.length === 0 && (
                  <p className="py-4 text-center text-sm text-muted-foreground">No line items were found.</p>
                )}
                {lines.state.value.map((_, index) => (
                  <div key={index} className={ROW}>
                    <form.AppField name={`lineItems[${index}].description`}>
                      {(field) => <field.TextField aria-label="Description" />}
                    </form.AppField>
                    <form.AppField name={`lineItems[${index}].quantity`} validators={{ onChange: validateAmount }}>
                      {(field) => <field.TextField aria-label="Quantity" inputMode="decimal" />}
                    </form.AppField>
                    <form.AppField name={`lineItems[${index}].unitPrice`} validators={{ onChange: validateAmount }}>
                      {(field) => <field.TextField aria-label="Unit price" inputMode="decimal" />}
                    </form.AppField>
                    <form.AppField name={`lineItems[${index}].amount`} validators={{ onChange: validateAmount }}>
                      {(field) => <field.TextField aria-label="Amount" inputMode="decimal" />}
                    </form.AppField>
                    <MyUiButton
                      type="button"
                      variant="ghost"
                      size="icon"
                      aria-label="Remove line"
                      onClick={() => lines.removeValue(index)}
                    >
                      <Trash2 />
                    </MyUiButton>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </form.AppField>
    );
  },
});
