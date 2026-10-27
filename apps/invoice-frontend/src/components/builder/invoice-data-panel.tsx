import { Plus, Trash2 } from "lucide-react";
import { MyUiButton, MyUiInput, MyUiTextarea } from "my-ui";
import { useBuilderStore } from "@/features/builder/store/builder-store";

const SECTION_TITLE = "text-xs font-semibold tracking-wide text-muted-foreground uppercase";

// The invoice's own values; every block on the page shows them as they are typed
export const InvoiceDataPanel = () => {
  const data = useBuilderStore((state) => state.data);
  const updateData = useBuilderStore((state) => state.updateData);
  const updateLineItem = useBuilderStore((state) => state.updateLineItem);
  const addLineItem = useBuilderStore((state) => state.addLineItem);
  const removeLineItem = useBuilderStore((state) => state.removeLineItem);

  return (
    <div className="space-y-6">
      <section className="space-y-3">
        <h3 className={SECTION_TITLE}>Invoice</h3>
        <MyUiInput
          label="Invoice number"
          value={data.invoiceNumber}
          onChange={(event) => updateData({ invoiceNumber: event.target.value })}
        />
        <div className="grid grid-cols-2 gap-3">
          <MyUiInput
            label="Date"
            type="date"
            value={data.invoiceDate}
            onChange={(event) => updateData({ invoiceDate: event.target.value })}
          />
          <MyUiInput
            label="Due date"
            type="date"
            value={data.dueDate}
            onChange={(event) => updateData({ dueDate: event.target.value })}
          />
        </div>
        <div className="grid grid-cols-2 gap-3">
          <MyUiInput
            label="Currency"
            maxLength={3}
            value={data.currency}
            onChange={(event) => updateData({ currency: event.target.value.toUpperCase().replace(/[^A-Z]/g, "") })}
          />
          <MyUiInput
            label="Tax (%)"
            type="number"
            min={0}
            max={100}
            step={0.01}
            value={data.taxRate}
            onChange={(event) => updateData({ taxRate: Math.min(100, Math.max(0, Number(event.target.value) || 0)) })}
          />
        </div>
      </section>

      <section className="space-y-3">
        <h3 className={SECTION_TITLE}>From</h3>
        <MyUiInput
          label="Business name"
          value={data.vendorName}
          onChange={(event) => updateData({ vendorName: event.target.value })}
        />
        <MyUiTextarea
          label="Address"
          rows={2}
          value={data.vendorAddress}
          onChange={(event) => updateData({ vendorAddress: event.target.value })}
        />
        <MyUiInput
          label="Tax ID / VAT number"
          value={data.vendorTaxId}
          onChange={(event) => updateData({ vendorTaxId: event.target.value })}
        />
      </section>

      <section className="space-y-3">
        <h3 className={SECTION_TITLE}>Bill to</h3>
        <MyUiInput
          label="Customer name"
          value={data.customerName}
          onChange={(event) => updateData({ customerName: event.target.value })}
        />
        <MyUiTextarea
          label="Address"
          rows={2}
          value={data.customerAddress}
          onChange={(event) => updateData({ customerAddress: event.target.value })}
        />
      </section>

      <section className="space-y-3">
        <h3 className={SECTION_TITLE}>Line items</h3>
        {data.lineItems.map((line, index) => (
          <div key={index} className="space-y-2 rounded-lg border p-3">
            <div className="flex items-end gap-2">
              <MyUiInput
                label="Description"
                className="flex-1"
                value={line.description}
                onChange={(event) => updateLineItem(index, { description: event.target.value })}
              />
              <MyUiButton
                type="button"
                variant="ghost"
                size="icon"
                aria-label="Remove line"
                onClick={() => removeLineItem(index)}
              >
                <Trash2 />
              </MyUiButton>
            </div>
            <div className="grid grid-cols-2 gap-2">
              <MyUiInput
                label="Qty"
                type="number"
                step="any"
                value={line.quantity}
                onChange={(event) => updateLineItem(index, { quantity: Number(event.target.value) || 0 })}
              />
              <MyUiInput
                label="Unit price"
                type="number"
                step="0.01"
                value={line.unitPrice}
                onChange={(event) => updateLineItem(index, { unitPrice: Number(event.target.value) || 0 })}
              />
            </div>
          </div>
        ))}
        <MyUiButton type="button" variant="outline" size="sm" icon={<Plus />} onClick={addLineItem}>
          Add line
        </MyUiButton>
      </section>

      <section className="space-y-3">
        <h3 className={SECTION_TITLE}>Notes</h3>
        <MyUiTextarea
          aria-label="Notes"
          rows={3}
          value={data.notes}
          onChange={(event) => updateData({ notes: event.target.value })}
        />
      </section>
    </div>
  );
};
