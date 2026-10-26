import { Download } from "lucide-react";
import { Button, MyUiDialog } from "my-ui";
import type { UploadedImage } from "@/features/images/api/api";

type ImagePreviewDialogProps = {
  image: UploadedImage;
  url: string;
  meta: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
};

// Large preview: a centered dialog on desktop, full screen on phones
export const ImagePreviewDialog = ({ image, url, meta, open, onOpenChange }: ImagePreviewDialogProps) => (
  <MyUiDialog
    open={open}
    onOpenChange={onOpenChange}
    title={<span className="block truncate pr-6">{image.name}</span>}
    description={meta}
    className="sm:max-w-3xl max-md:h-dvh max-md:max-w-none max-md:grid-rows-[auto_1fr_auto] max-md:rounded-none max-md:border-0"
    footer={
      <Button asChild variant="outline">
        <a href={url} download={image.name}>
          <Download />
          Download
        </a>
      </Button>
    }
  >
    <div className="flex min-h-0 items-center justify-center overflow-hidden rounded-md bg-muted">
      <img src={url} alt={image.name} className="max-h-[70vh] max-w-full object-contain max-md:max-h-full" />
    </div>
  </MyUiDialog>
);
