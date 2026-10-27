import { useState, type ReactNode } from "react";
import { ZoomIn, ZoomOut } from "lucide-react";
import { MyUiButton } from "my-ui";
import { InvoicePageImage } from "./invoice-page-image";

type InvoicePagesProps = {
  invoiceId: string;
  pageCount: number;
  // Drawn over each page (0-based index), e.g. the live preview's edits
  overlay?: (pageIndex: number) => ReactNode;
};

// Page width as a share of the viewer
const ZOOM_LEVELS = [50, 75, 100, 125, 150, 200];

// Every page of the uploaded PDF as an image, one under the other, with zoom
export const InvoicePages = ({ invoiceId, pageCount, overlay }: InvoicePagesProps) => {
  const [zoomIndex, setZoomIndex] = useState(2);
  const zoom = ZOOM_LEVELS[zoomIndex];
  const pages = Array.from({ length: pageCount }, (_, index) => index + 1);

  return (
    <div className="relative h-full">
      <div className="h-full overflow-auto bg-muted/40 p-4">
        <div className="mx-auto space-y-4" style={{ width: `${zoom}%` }}>
          {pages.map((page) => (
            <InvoicePageImage
              key={page}
              invoiceId={invoiceId}
              page={page}
              pageCount={pageCount}
              overlay={overlay?.(page - 1)}
            />
          ))}
        </div>
      </div>
      <div className="absolute right-4 bottom-4 flex items-center gap-1 rounded-lg border bg-background/90 p-1 shadow-sm">
        <MyUiButton
          type="button"
          variant="ghost"
          size="icon"
          aria-label="Zoom out"
          disabled={zoomIndex === 0}
          onClick={() => setZoomIndex(zoomIndex - 1)}
        >
          <ZoomOut />
        </MyUiButton>
        <span className="w-12 text-center text-xs tabular-nums">{zoom}%</span>
        <MyUiButton
          type="button"
          variant="ghost"
          size="icon"
          aria-label="Zoom in"
          disabled={zoomIndex === ZOOM_LEVELS.length - 1}
          onClick={() => setZoomIndex(zoomIndex + 1)}
        >
          <ZoomIn />
        </MyUiButton>
      </div>
    </div>
  );
};
