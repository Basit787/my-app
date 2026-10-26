import { useImageCounts } from "@/features/images/api/hooks";

// Number of images on each page, for the sidebar and tab-bar badges
export const useViewCounts = (): Record<string, number> => {
  const counts = useImageCounts().data;
  return { "/": counts?.active ?? 0, "/scheduled": counts?.scheduled ?? 0, "/bin": counts?.bin ?? 0 };
};
