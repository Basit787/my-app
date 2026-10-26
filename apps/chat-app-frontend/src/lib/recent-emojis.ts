const RECENT_EMOJIS_KEY = "recent_emojis";
const MAX_RECENT = 24;

export const getRecentEmojis = (): string[] => {
  try {
    const raw = localStorage.getItem(RECENT_EMOJIS_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as unknown;
    return Array.isArray(parsed) ? parsed.filter((e): e is string => typeof e === "string") : [];
  } catch {
    return [];
  }
};

export const addRecentEmoji = (emoji: string) => {
  const recent = getRecentEmojis().filter((e) => e !== emoji);
  recent.unshift(emoji);
  localStorage.setItem(RECENT_EMOJIS_KEY, JSON.stringify(recent.slice(0, MAX_RECENT)));
  return recent.slice(0, MAX_RECENT);
};
