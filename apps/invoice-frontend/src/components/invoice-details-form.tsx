import { withForm } from "my-ui";
import { EMPTY_FORM_VALUES } from "@/features/invoices/utils/empty-form-values";
import { validateAmount } from "@/features/invoices/utils/validate-amount";
import { validateCurrency } from "@/features/invoices/utils/validate-currency";

const SECTION_TITLE = "text-xs font-semibold tracking-wide text-muted-foreground uppercase";

// Everything except the line items: invoice, vendor, customer, amounts, notes
export const InvoiceDetailsForm = withForm({
  defaultValues: EMPTY_FORM_VALUES,
  render: function InvoiceDetailsFormRender({ form }) {
    return (
      <div className="space-y-6">
        <section className="space-y-3">
          <h3 className={SECTION_TITLE}>Invoice</h3>
          <form.AppField name="invoiceNumber">{(field) => <field.TextField label="Invoice number" />}</form.AppField>
          <div className="grid grid-cols-2 gap-3">
            <form.AppField name="invoiceDate">{(field) => <field.TextField label="Date" type="date" />}</form.AppField>
            <form.AppField name="dueDate">{(field) => <field.TextField label="Due date" type="date" />}</form.AppField>
          </div>
          <form.AppField name="currency" validators={{ onChange: validateCurrency }}>
            {(field) => <field.TextField label="Currency" placeholder="USD" maxLength={3} className="w-28" />}
          </form.AppField>
        </section>

        <section className="space-y-3">
          <h3 className={SECTION_TITLE}>Vendor</h3>
          <form.AppField name="vendorName">{(field) => <field.TextField label="Name" />}</form.AppField>
          <form.AppField name="vendorAddress">
            {(field) => <field.TextareaField label="Address" rows={2} />}
          </form.AppField>
          <form.AppField name="vendorTaxId">{(field) => <field.TextField label="Tax ID / VAT number" />}</form.AppField>
        </section>

        <section className="space-y-3">
          <h3 className={SECTION_TITLE}>Customer</h3>
          <form.AppField name="customerName">{(field) => <field.TextField label="Name" />}</form.AppField>
          <form.AppField name="customerAddress">
            {(field) => <field.TextareaField label="Address" rows={2} />}
          </form.AppField>
        </section>

        <section className="space-y-3">
          <h3 className={SECTION_TITLE}>Amounts</h3>
          <div className="grid grid-cols-3 gap-2">
            <form.AppField name="subtotal" validators={{ onChange: validateAmount }}>
              {(field) => <field.TextField label="Subtotal" inputMode="decimal" />}
            </form.AppField>
            <form.AppField name="taxAmount" validators={{ onChange: validateAmount }}>
              {(field) => <field.TextField label="Tax" inputMode="decimal" />}
            </form.AppField>
            <form.AppField name="totalAmount" validators={{ onChange: validateAmount }}>
              {(field) => <field.TextField label="Total" inputMode="decimal" />}
            </form.AppField>
          </div>
        </section>

        <section className="space-y-3">
          <h3 className={SECTION_TITLE}>Notes</h3>
          <form.AppField name="notes">{(field) => <field.TextareaField aria-label="Notes" rows={3} />}</form.AppField>
        </section>
      </div>
    );
  },
});
