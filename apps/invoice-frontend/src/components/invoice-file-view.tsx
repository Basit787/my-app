import { MyUiSpinner } from "my-ui";
import type { Invoice } from "@/features/invoices/api/api";
import { InvoicePages } from "./invoice-pages";
import { InvoiceRawFile } from "./invoice-raw-file";

type InvoiceFileViewProps = { invoice: Invoice };

// The uploaded invoice: a PDF as page images (the page count arrives with the first event), anything else as it is
export const InvoiceFileView = ({ invoice }: InvoiceFileViewProps) => {
  if (invoice.contentType !== "application/pdf") return <InvoiceRawFile invoice={invoice} />;
  if (invoice.pageCount) return <InvoicePages invoiceId={invoice.id} pageCount={invoice.pageCount} />;

  const isReading = invoice.status === "UPLOADED" || invoice.status === "PROCESSING";
  if (isReading) return <MyUiSpinner label="Preparing the preview…" className="h-full" />;
  // The PDF could not be opened for previews; the browser may still show it
  return <InvoiceRawFile invoice={invoice} />;
};
