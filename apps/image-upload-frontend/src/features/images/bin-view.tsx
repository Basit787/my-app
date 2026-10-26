import { useState } from "react";
import { Trash2 } from "lucide-react";
import { ImageGrid } from "@/components/image-grid";
import { useBin } from "./api/hooks";

export const BinView = () => {
  const [page, setPage] = useState(1);
  const bin = useBin(page);
  return (
    <div className="space-y-4">
      <p className="text-sm text-muted-foreground">Images in the bin are deleted for good after 30 days.</p>
      <ImageGrid
        data={bin.data}
        page={page}
        onPageChange={setPage}
        loading={bin.isPending}
        error={bin.error}
        inBin
        emptyTitle="The bin is empty"
        emptyDescription="Deleted images stay here for 30 days and can be restored."
        emptyIcon={<Trash2 className="h-6 w-6" />}
      />
    </div>
  );
};
