import { useEffect, useMemo } from "react";
import { keepPreviousData, useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useNotification } from "my-ui";
import {
  deleteImage,
  downloadImage,
  fetchBin,
  fetchImageCounts,
  fetchImages,
  purgeImage,
  restoreImage,
  uploadImage,
  type UploadedImage,
} from "./api";

// Every list, bin page and the counts sit under IMAGES_KEY, so invalidating it refreshes them all
const IMAGES_KEY = ["images"];

// The previous page stays on screen while the next one loads
export const useImages = (status: UploadedImage["status"], page: number) =>
  useQuery({
    queryKey: [...IMAGES_KEY, status, page],
    queryFn: () => fetchImages(status, page),
    placeholderData: keepPreviousData,
  });

export const useBin = (page: number) =>
  useQuery({
    queryKey: [...IMAGES_KEY, "bin", page],
    queryFn: () => fetchBin(page),
    placeholderData: keepPreviousData,
  });

export const useImageCounts = () => useQuery({ queryKey: [...IMAGES_KEY, "counts"], queryFn: fetchImageCounts });

// Image bytes fetched with the access token, as an object URL revoked when it changes or unmounts.
// Kept outside IMAGES_KEY so list refreshes don't download every image again.
export const useImageUrl = (id: string) => {
  const file = useQuery({ queryKey: ["image-file", id], queryFn: () => downloadImage(id), staleTime: Infinity });
  const url = useMemo(() => (file.data ? URL.createObjectURL(file.data) : null), [file.data]);

  useEffect(
    () => () => {
      if (url) URL.revokeObjectURL(url);
    },
    [url],
  );

  return { url, isError: file.isError };
};

type UploadInput = { files: File[]; scheduledAt?: string };

export const useUploadImages = () => {
  const queryClient = useQueryClient();
  const { showSuccessNotification, showErrorNotification } = useNotification();

  return useMutation({
    // One request per file; the first failure stops the batch
    mutationFn: async ({ files, scheduledAt }: UploadInput) => {
      for (const file of files) await uploadImage(file, scheduledAt);
      return files.length;
    },
    onSuccess: (count, { scheduledAt }) => {
      const noun = count === 1 ? "Image" : `${count} images`;
      showSuccessNotification(scheduledAt ? `${noun} scheduled` : `${noun} uploaded`);
    },
    onError: (err) => showErrorNotification(err, "Could not upload image"),
    onSettled: () => void queryClient.invalidateQueries({ queryKey: IMAGES_KEY }),
  });
};

export const useDeleteImage = () => {
  const queryClient = useQueryClient();
  const { showSuccessNotification, showErrorNotification } = useNotification();

  return useMutation({
    mutationFn: deleteImage,
    onSuccess: () => {
      showSuccessNotification("Moved to the bin");
      void queryClient.invalidateQueries({ queryKey: IMAGES_KEY });
    },
    onError: (err) => showErrorNotification(err, "Could not delete image"),
  });
};

export const useRestoreImage = () => {
  const queryClient = useQueryClient();
  const { showSuccessNotification, showErrorNotification } = useNotification();

  return useMutation({
    mutationFn: restoreImage,
    onSuccess: () => {
      showSuccessNotification("Image restored");
      void queryClient.invalidateQueries({ queryKey: IMAGES_KEY });
    },
    onError: (err) => showErrorNotification(err, "Could not restore image"),
  });
};

export const usePurgeImage = () => {
  const queryClient = useQueryClient();
  const { showSuccessNotification, showErrorNotification } = useNotification();

  return useMutation({
    mutationFn: purgeImage,
    onSuccess: () => {
      showSuccessNotification("Image deleted permanently");
      void queryClient.invalidateQueries({ queryKey: IMAGES_KEY });
    },
    onError: (err) => showErrorNotification(err, "Could not delete image"),
  });
};
