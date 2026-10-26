import type { AnyFieldMeta } from "@tanstack/react-form";

// First message for a field once it has been changed or blurred (errors are strings or Standard Schema issues)
export const fieldError = (meta: AnyFieldMeta): string | undefined => {
  if (!meta.isTouched) return undefined;
  const first: unknown = meta.errors[0];
  if (typeof first === "string") return first;
  if (first && typeof first === "object" && "message" in first && typeof first.message === "string") {
    return first.message;
  }
  return undefined;
};
