import { useEffect, useMemo, useState, type ReactNode } from "react";
import { readThemeCookie } from "./read-theme-cookie";
import { ThemeProviderContext, type Theme } from "./use-theme";
import { writeThemeCookie } from "./write-theme-cookie";

type ThemeProviderProps = {
  children: ReactNode;
  defaultTheme?: Theme;
  storageKey?: string;
  // Parent domain when apps run on subdomains (chat.example.com), so they all share the choice
  cookieDomain?: string;
};

const DARK_QUERY = "(prefers-color-scheme: dark)";

// The cookie is shared by every app on the host; localStorage is only this app's older copy
const readStoredTheme = (storageKey: string): Theme | null => {
  const shared = readThemeCookie();
  if (shared) return shared;
  try {
    return localStorage.getItem(storageKey) as Theme | null;
  } catch {
    return null;
  }
};

// "light" while rendering on the server, where there is no window
const systemTheme = () => (typeof window !== "undefined" && window.matchMedia(DARK_QUERY).matches ? "dark" : "light");

// shadcn's Vite theme provider: toggles the `.dark` class on <html> and remembers the choice for every app on the host;
// open tabs of other apps pick a change up when shown again (or at once where the browser reports cookie changes)
export const ThemeProvider = ({
  children,
  defaultTheme = "system",
  storageKey = "theme",
  cookieDomain,
}: ThemeProviderProps) => {
  const [theme, setThemeState] = useState<Theme>(() => readStoredTheme(storageKey) ?? defaultTheme);
  const [system, setSystem] = useState<"dark" | "light">(systemTheme);
  const resolvedTheme = theme === "system" ? system : theme;

  useEffect(() => {
    const query = window.matchMedia(DARK_QUERY);
    const onChange = () => setSystem(systemTheme());
    query.addEventListener("change", onChange);
    return () => query.removeEventListener("change", onChange);
  }, []);

  useEffect(() => {
    const sync = () => {
      const shared = readThemeCookie();
      if (shared) setThemeState(shared);
    };
    const onVisible = () => {
      if (document.visibilityState === "visible") sync();
    };
    // Same app in another tab
    const onStorage = (event: StorageEvent) => {
      if (event.key === storageKey) sync();
    };
    // Chromium reports cookie changes made by any app on the host
    const cookieStore = (window as { cookieStore?: EventTarget }).cookieStore;

    document.addEventListener("visibilitychange", onVisible);
    window.addEventListener("focus", sync);
    window.addEventListener("storage", onStorage);
    cookieStore?.addEventListener("change", sync);
    return () => {
      document.removeEventListener("visibilitychange", onVisible);
      window.removeEventListener("focus", sync);
      window.removeEventListener("storage", onStorage);
      cookieStore?.removeEventListener("change", sync);
    };
  }, [storageKey]);

  useEffect(() => {
    const root = window.document.documentElement;
    root.classList.remove("light", "dark");
    root.classList.add(resolvedTheme);
  }, [resolvedTheme]);

  const value = useMemo(
    () => ({
      theme,
      resolvedTheme,
      setTheme: (next: Theme) => {
        writeThemeCookie(next, cookieDomain);
        try {
          localStorage.setItem(storageKey, next);
        } catch {
          // Private mode: the choice lasts for this page only
        }
        setThemeState(next);
      },
    }),
    [theme, resolvedTheme, storageKey, cookieDomain],
  );

  return <ThemeProviderContext.Provider value={value}>{children}</ThemeProviderContext.Provider>;
};
