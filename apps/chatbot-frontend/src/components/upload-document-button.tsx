import { useRef, type ChangeEvent } from "react";
import { Plus } from "lucide-react";
import { MyUiButton, MyUiTooltip } from "my-ui";
import { useUploadDocument } from "@/features/chat/api/hooks";

export const UploadDocumentButton = () => {
  const upload = useUploadDocument();
  const fileInput = useRef<HTMLInputElement>(null);

  const onFileChosen = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    event.target.value = "";
    if (file) upload.mutate(file);
  };

  return (
    <>
      <input ref={fileInput} type="file" accept=".txt,.md,.pdf" className="hidden" onChange={onFileChosen} />
      <MyUiTooltip text={upload.isPending ? "Reading the document…" : "Add a document (.txt, .md, .pdf)"}>
        <MyUiButton
          type="button"
          variant="outline"
          size="icon"
          className="mb-0.5 rounded-full"
          aria-label="Add a document"
          loading={upload.isPending}
          onClick={() => fileInput.current?.click()}
        >
          {!upload.isPending && <Plus />}
        </MyUiButton>
      </MyUiTooltip>
    </>
  );
};
