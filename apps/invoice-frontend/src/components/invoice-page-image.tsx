import type { ReactNode } from "react";
import { MyUiSpinner } from "my-ui";
import { useInvoicePageUrl } from "@/features/invoices/api/hooks";

type InvoicePageImageProps = {
  invoiceId: string;
  page: number;
  pageCount: number;
  // Drawn over the image, e.g. the live preview's edits
  overlay?: ReactNode;
};

// One rendered page; keeps an A4-shaped placeholder while it loads so the scroll position doesn't jump
export const InvoicePageImage = ({ invoiceId, page, pageCount, overlay }: InvoicePageImageProps) => {
  const { url, isError } = useInvoicePageUrl(invoiceId, page);

  return (
    <figure className="space-y-1">
      {url ? (
        <div className="@container relative">
          <img src={url} alt={`Page ${page} of ${pageCount}`} className="w-full rounded bg-white shadow-md" />
          {overlay}
        </div>
      ) : (
        <div className="flex aspect-[1/1.414] w-full items-center justify-center rounded bg-white shadow-md">
          {isError ? (
            <span className="text-sm text-destructive">Could not load page {page}</span>
          ) : (
            <MyUiSpinner label={`Page ${page}…`} />
          )}
        </div>
      )}
      <figcaption className="text-center text-xs text-muted-foreground">
        Page {page} of {pageCount}
      </figcaption>
    </figure>
  );
};
