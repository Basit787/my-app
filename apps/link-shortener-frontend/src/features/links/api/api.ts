import { createApiError, toApiError } from "frontend-common";
import { apiClient } from "@/lib/api-client";
import { linkEndpoints } from "./endpoint";

// Mirrors LinkDto in apps/link-shortener-backend/src/links/dto/link.dto.ts
export type LinkDto = {
  id: string;
  slug: string;
  // Path on this app that redirects to `url`
  shortPath: string;
  url: string;
  title: string | null;
  clickCount: number;
  expiresAt: string | null;
  createdAt: string;
  updatedAt: string;
};

// Mirrors LinkStatsDto: the last 30 days, one entry per day
export type LinkStats = {
  linkId: string;
  totalClicks: number;
  days: { day: string; count: number }[];
};

// Mirrors CreateLinkDto
export type CreateLinkInput = {
  url: string;
  slug?: string;
  title?: string;
  expiresAt?: string;
};

export const fetchLinks = async (): Promise<LinkDto[]> => {
  try {
    const response = await apiClient.get<{ links: LinkDto[] }>(linkEndpoints.list());
    if (!response.ok) throw createApiError(response.message, response.status);
    return response.data.links;
  } catch (error) {
    throw toApiError(error, "Failed to load links");
  }
};

export const createLink = async (input: CreateLinkInput): Promise<LinkDto> => {
  try {
    const response = await apiClient.post<LinkDto>(linkEndpoints.list(), input);
    if (!response.ok) throw createApiError(response.message, response.status);
    return response.data;
  } catch (error) {
    throw toApiError(error, "Failed to create link");
  }
};

export const deleteLink = async (id: string): Promise<void> => {
  try {
    const response = await apiClient.delete<{ ok: true }>(linkEndpoints.link(id));
    if (!response.ok) throw createApiError(response.message, response.status);
  } catch (error) {
    throw toApiError(error, "Failed to delete link");
  }
};

export const fetchLinkStats = async (id: string): Promise<LinkStats> => {
  try {
    const response = await apiClient.get<LinkStats>(linkEndpoints.stats(id));
    if (!response.ok) throw createApiError(response.message, response.status);
    return response.data;
  } catch (error) {
    throw toApiError(error, "Failed to load stats");
  }
};
