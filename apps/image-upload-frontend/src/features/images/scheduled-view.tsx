import { useState } from "react";
import { CalendarClock } from "lucide-react";
import { ImageGrid } from "@/components/image-grid";
import { useImages } from "./api/hooks";

// Uploads waiting for their publish time, soonest first (sorted by the server)
export const ScheduledView = () => {
  const [page, setPage] = useState(1);
  const images = useImages("scheduled", page);
  return (
    <ImageGrid
      data={images.data}
      page={page}
      onPageChange={setPage}
      loading={images.isPending}
      error={images.error}
      emptyTitle="Nothing scheduled"
      emptyDescription="Tap + and turn on “Schedule for later” to publish images at a set time."
      emptyIcon={<CalendarClock className="h-6 w-6" />}
    />
  );
};
