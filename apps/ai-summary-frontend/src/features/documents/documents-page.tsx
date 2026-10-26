import { useState } from "react";
import { FileText, Upload } from "lucide-react";
import { AppHeader } from "frontend-common";
import { MyUiButton, MyUiEmpty, MyUiSpinner } from "my-ui";
import { DocumentsTable } from "@/components/documents-table";
import { UploadDocumentDialog } from "@/components/upload-document-dialog";
import { ViewDocumentDialog } from "@/components/view-document-dialog";
import { useDocumentEvents, useDocuments } from "./api/hooks";

export const DocumentsPage = () => {
  const { data: documents = [], isLoading } = useDocuments();
  useDocumentEvents();
  const [uploadOpen, setUploadOpen] = useState(false);
  const [viewingId, setViewingId] = useState<string | null>(null);
  // Looked up on every render so the open dialog follows the pushed status
  const viewing = documents.find((doc) => doc.id === viewingId) ?? null;

  return (
    <div className="flex min-h-svh flex-col">
      <AppHeader app="AI Summary" page="Documents" />
      <main className="mx-auto w-full max-w-6xl flex-1 space-y-6 px-4 py-6 md:px-6">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h1 className="text-2xl font-bold">Documents</h1>
            <p className="text-muted-foreground">Upload text documents and read their AI summaries.</p>
          </div>
          <MyUiButton icon={<Upload />} onClick={() => setUploadOpen(true)}>
            Upload
          </MyUiButton>
        </div>

        {isLoading ? (
          <MyUiSpinner label="Loading documents…" className="py-16" />
        ) : documents.length ? (
          <DocumentsTable documents={documents} onView={(doc) => setViewingId(doc.id)} />
        ) : (
          <MyUiEmpty
            icon={<FileText />}
            title="No documents yet"
            description="Upload a .txt file and a local model will summarize it."
            action={<MyUiButton onClick={() => setUploadOpen(true)}>Upload a document</MyUiButton>}
            className="rounded-lg border border-dashed"
          />
        )}
      </main>
      <UploadDocumentDialog open={uploadOpen} onOpenChange={setUploadOpen} />
      <ViewDocumentDialog document={viewing} onOpenChange={(open) => !open && setViewingId(null)} />
    </div>
  );
};
