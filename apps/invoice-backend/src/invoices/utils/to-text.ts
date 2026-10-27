// A trimmed string cut to the column length; null when empty
export const toText = (value: unknown, maxLength: number): string | null => {
  if (typeof value !== "string" && typeof value !== "number") return null;
  const text = String(value).replace(/\s+/g, " ").trim();
  return text ? text.slice(0, maxLength) : null;
};
