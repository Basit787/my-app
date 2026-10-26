import { createApiError, toApiError } from "frontend-common";
import { apiClient } from "@/lib/api-client";
import { imageEndpoints } from "./endpoint";

// Mirrors ImageDto in apps/image-upload-backend/src/types/image-dto.ts
export type UploadedImage = {
  id: string;
  name: string;
  mimeType: string;
  size: number;
  status: "scheduled" | "active";
  scheduledAt: string | null;
  deletedAt: string | null;
  // When a binned image is deleted for good
  purgeAt: string | null;
  createdAt: string;
};

// One page of images; mirrors ImagePageDto in the backend
export type ImagePage = {
  images: UploadedImage[];
  total: number;
  page: number;
  pageSize: number;
};

// Mirrors ImageCountsDto in the backend
export type ImageCounts = { active: number; scheduled: number; bin: number };

export const fetchImages = async (status: UploadedImage["status"], page: number): Promise<ImagePage> => {
  try {
    const response = await apiClient.get<ImagePage>(imageEndpoints.list(status, page));
    if (!response.ok) throw createApiError(response.message, response.status);
    return response.data;
  } catch (error) {
    throw toApiError(error, "Failed to load images");
  }
};

export const fetchBin = async (page: number): Promise<ImagePage> => {
  try {
    const response = await apiClient.get<ImagePage>(imageEndpoints.bin(page));
    if (!response.ok) throw createApiError(response.message, response.status);
    return response.data;
  } catch (error) {
    throw toApiError(error, "Failed to load the bin");
  }
};

export const fetchImageCounts = async (): Promise<ImageCounts> => {
  try {
    const response = await apiClient.get<ImageCounts>(imageEndpoints.counts());
    if (!response.ok) throw createApiError(response.message, response.status);
    return response.data;
  } catch (error) {
    throw toApiError(error, "Failed to load image counts");
  }
};

// `scheduledAt` (ISO) publishes the image later instead of right away
export const uploadImage = async (file: File, scheduledAt?: string): Promise<UploadedImage> => {
  const body = new FormData();
  body.append("file", file);
  if (scheduledAt) body.append("scheduledAt", scheduledAt);
  try {
    const response = await apiClient.postForm<UploadedImage>(imageEndpoints.upload(), body);
    if (!response.ok) throw createApiError(response.message, response.status);
    return response.data;
  } catch (error) {
    throw toApiError(error, "Failed to upload image");
  }
};

export const downloadImage = async (id: string): Promise<Blob> => {
  try {
    const response = await apiClient.getBlob(imageEndpoints.file(id));
    if (!response.ok) throw createApiError(response.message, response.status);
    return response.data;
  } catch (error) {
    throw toApiError(error, "Failed to load image");
  }
};

export const deleteImage = async (id: string): Promise<void> => {
  try {
    const response = await apiClient.delete<{ ok: true }>(imageEndpoints.remove(id));
    if (!response.ok) throw createApiError(response.message, response.status);
  } catch (error) {
    throw toApiError(error, "Failed to delete image");
  }
};

export const restoreImage = async (id: string): Promise<UploadedImage> => {
  try {
    const response = await apiClient.post<UploadedImage>(imageEndpoints.restore(id));
    if (!response.ok) throw createApiError(response.message, response.status);
    return response.data;
  } catch (error) {
    throw toApiError(error, "Failed to restore image");
  }
};

// Only images already in the bin can be deleted for good
export const purgeImage = async (id: string): Promise<void> => {
  try {
    const response = await apiClient.delete<{ ok: true }>(imageEndpoints.purge(id));
    if (!response.ok) throw createApiError(response.message, response.status);
  } catch (error) {
    throw toApiError(error, "Failed to delete image");
  }
};
