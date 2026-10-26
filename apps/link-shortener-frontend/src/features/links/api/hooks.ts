import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useNotification } from "my-ui";
import { createLink, deleteLink, fetchLinkStats, fetchLinks, type CreateLinkInput } from "./api";

// React Query keys, so hooks and invalidations agree
const linkQueryKeys = {
  all: ["links"] as const,
  stats: (id: string | null) => ["link-stats", id] as const,
};

export const useLinks = () => useQuery({ queryKey: linkQueryKeys.all, queryFn: fetchLinks });

export const useLinkStats = (id: string | null) =>
  useQuery({ queryKey: linkQueryKeys.stats(id), queryFn: () => fetchLinkStats(id!), enabled: !!id });

export const useCreateLink = () => {
  const queryClient = useQueryClient();
  const { showSuccessNotification, showErrorNotification } = useNotification();
  return useMutation({
    mutationFn: (input: CreateLinkInput) => createLink(input),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: linkQueryKeys.all });
      showSuccessNotification("Short link created");
    },
    onError: (error) => showErrorNotification(error, "Could not create the link"),
  });
};

// Deletes several links at once with a single toast
export const useDeleteLinks = () => {
  const queryClient = useQueryClient();
  const { showSuccessNotification, showErrorNotification } = useNotification();
  return useMutation({
    mutationFn: (ids: string[]) => Promise.all(ids.map((id) => deleteLink(id))),
    onSuccess: (_, ids) => showSuccessNotification(ids.length === 1 ? "Link deleted" : `${ids.length} links deleted`),
    onError: (error) => showErrorNotification(error, "Could not delete the links"),
    onSettled: () => void queryClient.invalidateQueries({ queryKey: linkQueryKeys.all }),
  });
};
