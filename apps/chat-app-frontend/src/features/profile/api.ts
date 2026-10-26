import { profileEndpoints, type PresenceStatus } from "frontend-common";
import { apiClient } from "@/lib/api-client";
import { createApiError, toApiError } from "frontend-common";

export type { PresenceStatus };

export const fetchPresenceStatus = async (): Promise<PresenceStatus> => {
  try {
    const response = await apiClient.get<{ status: PresenceStatus }>(profileEndpoints.status());
    if (!response.ok) throw createApiError(response.message, response.status);
    return response.data.status;
  } catch (error) {
    throw toApiError(error, "Failed to load status");
  }
};

export const updatePresenceStatus = async (status: PresenceStatus): Promise<PresenceStatus> => {
  try {
    const response = await apiClient.patch<{ status: PresenceStatus }>(profileEndpoints.status(), { status });
    if (!response.ok) throw createApiError(response.message, response.status);
    return response.data.status;
  } catch (error) {
    throw toApiError(error, "Failed to update status");
  }
};
