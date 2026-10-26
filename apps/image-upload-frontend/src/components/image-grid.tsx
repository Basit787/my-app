import { useEffect, type ReactNode } from "react";
import { MyUiEmpty, MyUiPagination, MyUiSpinner } from "my-ui";
import type { ImagePage } from "@/features/images/api/api";
import { ImageCard } from "./image-card";

type ImageGridProps = {
  data?: ImagePage;
  // 1-based
  page: number;
  onPageChange: (page: number) => void;
  loading: boolean;
  error: Error | null;
  emptyTitle: string;
  emptyDescription: string;
  emptyIcon: ReactNode;
  inBin?: boolean;
};

export const ImageGrid = ({
  data,
  page,
  onPageChange,
  loading,
  error,
  emptyTitle,
  emptyDescription,
  emptyIcon,
  inBin,
}: ImageGridProps) => {
  const images = data?.images;
  const pageCount = data ? Math.ceil(data.total / data.pageSize) : 0;

  // Deleting the last image on the last page leaves it empty: step back to the new last page
  useEffect(() => {
    if (data && page > 1 && page > pageCount) onPageChange(Math.max(pageCount, 1));
  }, [data, page, pageCount, onPageChange]);

  if (loading) return <MyUiSpinner label="Loading images…" className="justify-center py-10" />;
  if (error) return <MyUiEmpty title="Could not load images" description={error.message} />;
  if (!images?.length) return <MyUiEmpty title={emptyTitle} description={emptyDescription} icon={emptyIcon} />;
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 sm:gap-4 lg:grid-cols-4">
        {images.map((image) => (
          <ImageCard key={image.id} image={image} inBin={inBin} />
        ))}
      </div>
      <MyUiPagination
        page={page}
        pageCount={pageCount}
        onPageChange={(next) => {
          onPageChange(next);
          window.scrollTo({ top: 0 });
        }}
      />
    </div>
  );
};
