import { THEME_COOKIE } from "./theme-cookie-name";
import type { Theme } from "./use-theme";

const ONE_YEAR_SECONDS = 365 * 24 * 60 * 60;

// Saves the theme for every app; `domain` (e.g. "example.com") also shares it with sibling subdomains
export const writeThemeCookie = (theme: Theme, domain?: string) => {
  const domainPart = domain ? `; Domain=${domain}` : "";
  const secure = window.location.protocol === "https:" ? "; Secure" : "";
  document.cookie = `${THEME_COOKIE}=${theme}; Path=/; Max-Age=${ONE_YEAR_SECONDS}; SameSite=Lax${domainPart}${secure}`;
};
