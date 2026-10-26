import { useState, type DragEvent } from "react";
import { FileUp } from "lucide-react";
import { MyUiDialog, MyUiSpinner } from "my-ui";
import { useUploadDocument } from "@/features/documents/api/hooks";
import { MAX_FILE_SIZE_MB } from "@/lib/max-file-size";
import { cn } from "@/lib/utils";

type UploadDocumentDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
};

const validate = (file: File) => {
  if (!file.name.toLowerCase().endsWith(".txt")) return "Only .txt files are allowed.";
  if (file.size > MAX_FILE_SIZE_MB * 1024 * 1024) return `Maximum file size is ${MAX_FILE_SIZE_MB} MB.`;
  return null;
};

export const UploadDocumentDialog = ({ open, onOpenChange }: UploadDocumentDialogProps) => {
  const upload = useUploadDocument();
  const [dragging, setDragging] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const pick = (list: FileList | null) => {
    const file = list?.[0];
    if (!file) return;
    const problem = validate(file);
    setError(problem);
    if (!problem) upload.mutate(file, { onSuccess: () => onOpenChange(false) });
  };

  const onDrop = (event: DragEvent<HTMLLabelElement>) => {
    event.preventDefault();
    setDragging(false);
    if (!upload.isPending) pick(event.dataTransfer.files);
  };

  return (
    <MyUiDialog
      open={open}
      onOpenChange={(next) => {
        setError(null);
        onOpenChange(next);
      }}
      title="Upload a document"
      description="A local AI model reads the text and writes a summary."
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
        <span className="font-medium">Drop a text file here or tap to choose</span>
        <span className="text-sm text-muted-foreground">Plain text (.txt), up to {MAX_FILE_SIZE_MB} MB</span>
        <input
          type="file"
          accept=".txt,text/plain"
          className="sr-only"
          disabled={upload.isPending}
          onChange={(event) => {
            pick(event.target.files);
            event.target.value = "";
          }}
        />
      </label>
      {error && <p className="mt-2 text-sm text-destructive">{error}</p>}
    </MyUiDialog>
  );
};
