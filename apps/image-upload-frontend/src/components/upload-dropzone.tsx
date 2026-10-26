import { useState, type DragEvent } from "react";
import { ImageUp } from "lucide-react";
import { MyUiSpinner } from "my-ui";
import { cn } from "@/lib/utils";

type UploadDropzoneProps = {
  onFiles: (files: File[]) => void;
  uploading?: boolean;
  disabled?: boolean;
};

export const UploadDropzone = ({ onFiles, uploading, disabled }: UploadDropzoneProps) => {
  const [dragging, setDragging] = useState(false);
  const inactive = uploading || disabled;

  const pick = (list: FileList | null) => {
    const files = Array.from(list ?? []).filter((file) => file.type.startsWith("image/"));
    if (files.length) onFiles(files);
  };

  const onDrop = (event: DragEvent<HTMLLabelElement>) => {
    event.preventDefault();
    setDragging(false);
    if (!inactive) pick(event.dataTransfer.files);
  };

  return (
    <label
      onDragOver={(event) => {
        event.preventDefault();
        setDragging(true);
      }}
      onDragLeave={() => setDragging(false)}
      onDrop={onDrop}
      className={cn(
        "flex cursor-pointer flex-col items-center justify-center gap-2 rounded-xl border-2 border-dashed border-border px-6 py-10 text-center transition-colors hover:border-primary/50 hover:bg-accent/40",
        dragging && "border-primary bg-accent/40",
        inactive && "pointer-events-none opacity-60",
      )}
    >
      {uploading ? <MyUiSpinner label="Uploading…" /> : <ImageUp className="h-8 w-8 text-primary" />}
      <span className="font-medium">Drop images here or tap to choose</span>
      <span className="text-sm text-muted-foreground">PNG, JPG, GIF or WebP, up to 10 MB each</span>
      <input
        type="file"
        accept="image/*"
        multiple
        className="sr-only"
        disabled={inactive}
        onChange={(event) => {
          pick(event.target.files);
          event.target.value = "";
        }}
      />
    </label>
  );
};
