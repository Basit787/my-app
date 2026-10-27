// "2024-03-05", "2024-03-05T10:00:00" or "20240305" (XML date format 102) as YYYY-MM-DD; other formats give null
export const toIsoDate = (value: unknown): string | null => {
  if (typeof value !== "string") return null;
  const text = value.trim();
  const compact = /^(\d{4})(\d{2})(\d{2})$/.exec(text);
  const date = compact ? `${compact[1]}-${compact[2]}-${compact[3]}` : text.slice(0, 10);
  if (!/^\d{4}-\d{2}-\d{2}$/.test(date) || Number.isNaN(Date.parse(date))) return null;
  return date;
};
