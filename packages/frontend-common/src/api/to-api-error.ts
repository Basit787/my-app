import { isAxiosError } from "axios";
import { createApiError, getErrorMessage, isApiError } from "./errors";

type StatusError = Error & { status: number };

const hasStatus = (error: unknown): error is StatusError =>
  error instanceof Error && "status" in error && typeof error.status === "number";

// Any failure inside an API call as one shape: an Error with the server's message (or `fallback`) and the HTTP status
export const toApiError = (error: unknown, fallback: string): StatusError => {
  if (isAxiosError(error)) return createApiError(getErrorMessage(error, fallback), error.response?.status ?? 0);
  if (hasStatus(error)) return error.message.trim() ? error : createApiError(fallback, error.status);
  if (isApiError(error)) return createApiError(error.message.trim() || fallback, error.status);
  if (error instanceof Error && error.message.trim()) return createApiError(error.message, 0);
  return createApiError(fallback, 0);
};
