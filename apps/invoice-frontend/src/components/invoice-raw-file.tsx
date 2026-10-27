import { FileWarning } from "lucide-react";
import { MyUiEmpty, MyUiSpinner } from "my-ui";
import type { Invoice } from "@/features/invoices/api/api";
import { useInvoiceFileUrl } from "@/features/invoices/api/hooks";

type InvoiceRawFileProps = { invoice: Invoice };

// The uploaded file as it is: photos and scans as images, XML (and PDFs without previews) in the browser viewer
export const InvoiceRawFile = ({ invoice }: InvoiceRawFileProps) => {
  const { url, isError } = useInvoiceFileUrl(invoice.id);

  if (isError) {
    return <MyUiEmpty icon={<FileWarning />} title="Could not load the file" className="h-full" />;
  }
  if (!url) return <MyUiSpinner label="Loading the file…" className="h-full" />;
  if (invoice.contentType === "image/tiff") {
    return (
      <MyUiEmpty
        icon={<FileWarning />}
        title="Browsers can't preview TIFF files"
        description="The text read from it is in the Text tab."
        className="h-full"
      />
    );
  }
  if (invoice.contentType.startsWith("image/")) {
    return (
      <div className="h-full overflow-auto bg-muted/40 p-4">
        <img src={url} alt={invoice.filename} className="mx-auto max-w-full rounded shadow" />
      </div>
    );
  }
  return <iframe src={url} title={invoice.filename} className="h-full w-full border-0 bg-white" />;
};
