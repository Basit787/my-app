import { useState } from "react";
import { Images } from "lucide-react";
import { ImageGrid } from "@/components/image-grid";
import { useImages } from "./api/hooks";

export const GalleryView = () => {
  const [page, setPage] = useState(1);
  const images = useImages("active", page);
  return (
    <ImageGrid
      data={images.data}
      page={page}
      onPageChange={setPage}
      loading={images.isPending}
      error={images.error}
      emptyTitle="No images yet"
      emptyDescription="Tap + to upload your first images."
      emptyIcon={<Images className="h-6 w-6" />}
    />
  );
};
