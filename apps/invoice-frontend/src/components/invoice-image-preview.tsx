import type { ReactNode } from "react";
import { MyUiSpinner } from "my-ui";
import { useInvoiceFileUrl } from "@/features/invoices/api/hooks";

type InvoiceImagePreviewProps = { invoiceId: string; alt: string; overlay?: ReactNode };

// An uploaded photo or scan with something drawn over it, e.g. the live preview's edits
export const InvoiceImagePreview = ({ invoiceId, alt, overlay }: InvoiceImagePreviewProps) => {
  const { url, isError } = useInvoiceFileUrl(invoiceId);
  if (isError) return <p className="p-4 text-sm text-destructive">Could not load the file</p>;
  if (!url) return <MyUiSpinner label="Loading the file…" className="h-full" />;

  return (
    <div className="h-full overflow-auto bg-muted/40 p-4">
      <div className="@container relative mx-auto max-w-full">
        <img src={url} alt={alt} className="w-full rounded shadow" />
        {overlay}
      </div>
    </div>
  );
};
