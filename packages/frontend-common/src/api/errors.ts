import { isAxiosError, type AxiosError } from "axios";
import type { ApiError, ApiErrorBody } from "./types";

export const API_MESSAGES = {
  timeout: "The request timed out. Please try again.",
  network: "Network error. Check your connection and try again.",
  unauthorized: "Your session has expired. Please sign in again.",
  forbidden: "You do not have permission to perform this action.",
  server: "Something went wrong on the server. Please try again later.",
  unexpected: "An unexpected error occurred.",
} as const;

export const getResponseMessage = (error: AxiosError<ApiErrorBody>) => {
  const data = error.response?.data;
  if (typeof data?.message === "string" && data.message.trim()) return data.message;
  if (typeof data?.error === "string" && data.error.trim()) return data.error;
  return error.message || API_MESSAGES.unexpected;
};

export const resolveNetworkError = (error: AxiosError): ApiError => {
  if (error.message === "Network Error") {
    return { status: 0, message: API_MESSAGES.network };
  }
  return { status: 0, message: error.message || API_MESSAGES.network };
};

export const isApiError = (error: unknown): error is ApiError => {
  return (
    typeof error === "object" &&
    error !== null &&
    "status" in error &&
    "message" in error &&
    typeof (error as ApiError).message === "string"
  );
};

export const createApiError = (message: string, status = 0): Error & { status: number } => {
  const err = new Error(message) as Error & { status: number };
  err.status = status;
  return err;
};

export const resolveMutationError = (error: unknown, fallback: string): string => {
  if (error instanceof Error && error.message.trim()) return error.message;
  if (isApiError(error)) return error.message;
  return fallback;
};

// Message for a toast: API results, raw axios errors and plain errors
export const getErrorMessage = (error: unknown, fallback: string) => {
  if (isApiError(error)) return error.message;
  if (isAxiosError(error)) {
    const data = error.response?.data as ApiErrorBody | undefined;
    if (typeof data?.message === "string") return data.message;
    if (typeof data?.error === "string") return data.error;
    return error.message || fallback;
  }
  if (error instanceof Error) return error.message;
  return fallback;
};
