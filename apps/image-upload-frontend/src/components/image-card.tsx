import { useState } from "react";
import { CalendarClock, ImageOff, RotateCcw, Trash2, X } from "lucide-react";
import { formatFileSize } from "frontend-common";
import { Button, Card, MyUiAlertDialog, MyUiBadge, Skeleton } from "my-ui";
import type { UploadedImage } from "@/features/images/api/api";
import { useDeleteImage, useImageUrl, usePurgeImage, useRestoreImage } from "@/features/images/api/hooks";
import { ImagePreviewDialog } from "./image-preview-dialog";

type ImageCardProps = { image: UploadedImage; inBin?: boolean };

const formatDateTime = (iso: string) => new Date(iso).toLocaleString([], { dateStyle: "medium", timeStyle: "short" });

export const ImageCard = ({ image, inBin }: ImageCardProps) => {
  const { url, isError } = useImageUrl(image.id);
  const remove = useDeleteImage();
  const restore = useRestoreImage();
  const purge = usePurgeImage();
  const [previewOpen, setPreviewOpen] = useState(false);
  const meta =
    inBin && image.purgeAt
      ? `Deleted for good on ${formatDateTime(image.purgeAt)}`
      : `${formatFileSize(image.size)} · ${new Date(image.createdAt).toLocaleDateString()}`;

  return (
    <Card className="h-full gap-0 overflow-hidden py-0">
      {/* Fixed square: images are cropped to fit, so a tall one never stretches the card */}
      <button
        type="button"
        disabled={!url}
        onClick={() => setPreviewOpen(true)}
        aria-label={`Preview ${image.name}`}
        className="relative block aspect-square w-full cursor-zoom-in overflow-hidden bg-muted disabled:cursor-default"
      >
        {url ? (
          <img src={url} alt={image.name} className="absolute inset-0 size-full object-cover" />
        ) : isError ? (
          <div className="absolute inset-0 flex items-center justify-center text-muted-foreground">
            <ImageOff className="h-8 w-8" />
          </div>
        ) : (
          <Skeleton className="absolute inset-0 size-full rounded-none" />
        )}
        {image.status === "scheduled" && image.scheduledAt && (
          <MyUiBadge className="absolute top-2 left-2" icon={<CalendarClock />}>
            {formatDateTime(image.scheduledAt)}
          </MyUiBadge>
        )}
      </button>
      {url && (
        <ImagePreviewDialog image={image} url={url} meta={meta} open={previewOpen} onOpenChange={setPreviewOpen} />
      )}
      <div className="flex items-center gap-2 p-3">
        <div className="min-w-0 flex-1">
          <p className="truncate text-sm font-medium" title={image.name}>
            {image.name}
          </p>
          {/* One line, so every card's footer has the same height */}
          <p className="truncate text-xs text-muted-foreground" title={meta}>
            {meta}
          </p>
        </div>
        {inBin ? (
          <>
            <Button
              variant="ghost"
              size="icon"
              aria-label="Restore image"
              disabled={restore.isPending}
              onClick={() => restore.mutate(image.id)}
            >
              <RotateCcw className="h-4 w-4" />
            </Button>
            <MyUiAlertDialog
              title="Delete this image permanently?"
              description={`"${image.name}" will be removed for good. This cannot be undone.`}
              confirmText="Delete forever"
              destructive
              onConfirm={() => purge.mutate(image.id)}
              trigger={
                <Button
                  variant="ghost"
                  size="icon"
                  aria-label="Delete image permanently"
                  className="text-destructive hover:text-destructive"
                  disabled={purge.isPending}
                >
                  <X className="h-4 w-4" />
                </Button>
              }
            />
          </>
        ) : (
          <MyUiAlertDialog
            title="Move this image to the bin?"
            description={`"${image.name}" can be restored from the bin for 30 days.`}
            confirmText="Move to bin"
            destructive
            onConfirm={() => remove.mutate(image.id)}
            trigger={
              <Button variant="ghost" size="icon" aria-label="Delete image" disabled={remove.isPending}>
                <Trash2 className="h-4 w-4" />
              </Button>
            }
          />
        )}
      </div>
    </Card>
  );
};
