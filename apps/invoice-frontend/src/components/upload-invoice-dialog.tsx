import { useState, type DragEvent } from "react";
import { FileUp } from "lucide-react";
import { MyUiDialog, MyUiSpinner } from "my-ui";
import { useUploadInvoice } from "@/features/invoices/api/hooks";
import { MAX_FILE_SIZE_MB } from "@/lib/max-file-size";
import { cn } from "@/lib/utils";

type UploadInvoiceDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
};

// Same file types the backend accepts
const EXTENSIONS = [".pdf", ".xml", ".png", ".jpg", ".jpeg", ".tif", ".tiff"];

const validate = (file: File) => {
  const name = file.name.toLowerCase();
  if (!EXTENSIONS.some((extension) => name.endsWith(extension))) return `${file.name}: use a PDF, XML or image file.`;
  if (file.size > MAX_FILE_SIZE_MB * 1024 * 1024) return `${file.name}: maximum file size is ${MAX_FILE_SIZE_MB} MB.`;
  return null;
};

export const UploadInvoiceDialog = ({ open, onOpenChange }: UploadInvoiceDialogProps) => {
  const upload = useUploadInvoice();
  const [dragging, setDragging] = useState(false);
  const [errors, setErrors] = useState<string[]>([]);

  // Valid files upload one after another; the dialog closes when every one went through
  const pick = async (list: FileList | null) => {
    const files = Array.from(list ?? []);
    if (!files.length) return;
    const problems = files.map(validate).filter((problem): problem is string => problem !== null);
    setErrors(problems);

    let failed = false;
    for (const file of files.filter((candidate) => !validate(candidate))) {
      try {
        await upload.mutateAsync(file);
      } catch {
        failed = true;
      }
    }
    if (!problems.length && !failed) onOpenChange(false);
  };

  const onDrop = (event: DragEvent<HTMLLabelElement>) => {
    event.preventDefault();
    setDragging(false);
    if (!upload.isPending) void pick(event.dataTransfer.files);
  };

  return (
    <MyUiDialog
      open={open}
      onOpenChange={(next) => {
        setErrors([]);
        onOpenChange(next);
      }}
      title="Upload invoices"
      description="Text PDFs, scanned PDFs, photos and XML e-invoices; scans are read with OCR."
    >
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
          upload.isPending && "pointer-events-none opacity-60",
        )}
      >
        {upload.isPending ? <MyUiSpinner label="Uploading…" /> : <FileUp className="h-8 w-8 text-primary" />}
        <span className="font-medium">Drop invoice files here or tap to choose</span>
        <span className="text-sm text-muted-foreground">
          PDF, XML, PNG, JPG or TIFF, up to {MAX_FILE_SIZE_MB} MB each
        </span>
        <input
          type="file"
          multiple
          accept={EXTENSIONS.join(",")}
          className="sr-only"
          disabled={upload.isPending}
          onChange={(event) => {
            void pick(event.target.files);
            event.target.value = "";
          }}
        />
      </label>
      {errors.map((error) => (
        <p key={error} className="mt-2 text-sm text-destructive">
          {error}
        </p>
      ))}
    </MyUiDialog>
  );
};
