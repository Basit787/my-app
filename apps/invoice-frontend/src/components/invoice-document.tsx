import type { InvoiceFormValues } from "@/features/invoices/types/invoice-form-values";
import { formatAmount } from "@/lib/format-amount";

type InvoiceDocumentProps = { values: InvoiceFormValues };

// "12.5" → 12.5; empty or not a number → null, shown as blank
const toNumber = (value: string) => (value.trim() !== "" && Number.isFinite(Number(value)) ? Number(value) : null);

const LABEL = "text-[10px] font-semibold tracking-wide text-neutral-500 uppercase";

// The invoice laid out like the downloaded PDF, drawn from the form's current values as the user types
export const InvoiceDocument = ({ values }: InvoiceDocumentProps) => {
  const currency = values.currency.trim().toUpperCase() || null;
  const money = (value: string) => {
    const number = toNumber(value);
    return number === null ? "" : formatAmount(number, currency);
  };
  const meta = [
    ["Invoice number", values.invoiceNumber],
    ["Date", values.invoiceDate],
    ["Due date", values.dueDate],
  ].filter(([, value]) => value.trim());
  const totals = [
    ["Subtotal", values.subtotal, false],
    ["Tax", values.taxAmount, false],
    ["Total", values.totalAmount, true],
  ] as const;

  return (
    <article className="mx-auto aspect-[1/1.414] w-full max-w-3xl space-y-8 rounded bg-white p-[6%] text-sm text-black shadow-md">
      <header className="flex justify-between gap-6">
        <h2 className="text-3xl font-bold">INVOICE</h2>
        <dl className="space-y-0.5 text-right">
          {meta.map(([label, value]) => (
            <div key={label}>
              <dt className="inline">{label}: </dt>
              <dd className="inline">{value}</dd>
            </div>
          ))}
        </dl>
      </header>

      <section className="grid grid-cols-2 gap-6">
        <div className="space-y-0.5">
          <p className={LABEL}>From</p>
          <p className="font-semibold">{values.vendorName || "—"}</p>
          {values.vendorAddress && <p className="whitespace-pre-line">{values.vendorAddress}</p>}
          {values.vendorTaxId && <p>Tax ID: {values.vendorTaxId}</p>}
        </div>
        <div className="space-y-0.5">
          <p className={LABEL}>Bill to</p>
          <p className="font-semibold">{values.customerName || "—"}</p>
          {values.customerAddress && <p className="whitespace-pre-line">{values.customerAddress}</p>}
        </div>
      </section>

      <table className="w-full">
        <thead>
          <tr className={`${LABEL} border-b border-neutral-300 text-left`}>
            <th className="py-1 font-semibold">Description</th>
            <th className="py-1 text-right font-semibold">Qty</th>
            <th className="py-1 text-right font-semibold">Unit price</th>
            <th className="py-1 text-right font-semibold">Amount</th>
          </tr>
        </thead>
        <tbody>
          {values.lineItems.map((line, index) => (
            <tr key={index} className="align-top">
              <td className="py-1 pr-2">{line.description || "—"}</td>
              <td className="py-1 text-right">{line.quantity}</td>
              <td className="py-1 text-right">{money(line.unitPrice)}</td>
              <td className="py-1 text-right">{money(line.amount)}</td>
            </tr>
          ))}
          {!values.lineItems.length && (
            <tr>
              <td colSpan={4} className="py-1 text-neutral-500">
                No line items
              </td>
            </tr>
          )}
        </tbody>
      </table>

      <dl className="ml-auto w-64 space-y-1 border-t border-neutral-300 pt-2">
        {totals
          .filter(([, value]) => toNumber(value) !== null)
          .map(([label, value, bold]) => (
            <div key={label} className={bold ? "flex justify-between text-base font-bold" : "flex justify-between"}>
              <dt>{label}</dt>
              <dd>{money(value)}</dd>
            </div>
          ))}
      </dl>

      {values.notes.trim() && (
        <section className="space-y-0.5">
          <p className={LABEL}>Notes</p>
          <p className="whitespace-pre-line">{values.notes}</p>
        </section>
      )}
    </article>
  );
};
