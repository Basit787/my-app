export type ApiError = {
  status: number;
  message: string;
};

export type ApiErrorBody = {
  error?: string;
  message?: string;
  details?: Record<string, string[] | undefined>;
};

export type ApiSuccess<T> = T;

export type ApiResponse<T> = { ok: true; data: T; status: number } | { ok: false; status: number; message: string };

export type ApiMeta = Record<string, unknown>;

export type ApiResponseWithMeta<T> =
  { ok: true; data: T; meta?: ApiMeta; status: number } | { ok: false; status: number; message: string };
