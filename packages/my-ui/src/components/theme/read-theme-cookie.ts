import { THEME_COOKIE } from "./theme-cookie-name";
import type { Theme } from "./use-theme";

const THEMES: Theme[] = ["dark", "light", "system"];

// The theme chosen in any app on this host (or this domain's subdomains); null when none was chosen yet
export const readThemeCookie = (): Theme | null => {
  if (typeof document === "undefined") return null;
  const value = document.cookie
    .split("; ")
    .find((cookie) => cookie.startsWith(`${THEME_COOKIE}=`))
    ?.slice(THEME_COOKIE.length + 1);
  return THEMES.includes(value as Theme) ? (value as Theme) : null;
};
