import { useEffect, useMemo, useState, type ReactNode } from "react";
import { ThemeProviderContext, type Theme } from "./use-theme";

type ThemeProviderProps = {
  children: ReactNode;
  defaultTheme?: Theme;
  storageKey?: string;
};

const DARK_QUERY = "(prefers-color-scheme: dark)";

const readStoredTheme = (storageKey: string): Theme | null => {
  try {
    return localStorage.getItem(storageKey) as Theme | null;
  } catch {
    return null;
  }
};

// "light" while rendering on the server, where there is no window
const systemTheme = () => (typeof window !== "undefined" && window.matchMedia(DARK_QUERY).matches ? "dark" : "light");

// shadcn's Vite theme provider: toggles the `.dark` class on <html> and remembers the choice
export const ThemeProvider = ({ children, defaultTheme = "system", storageKey = "theme" }: ThemeProviderProps) => {
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
    const root = window.document.documentElement;
    root.classList.remove("light", "dark");
    root.classList.add(resolvedTheme);
  }, [resolvedTheme]);

  const value = useMemo(
    () => ({
      theme,
      resolvedTheme,
      setTheme: (next: Theme) => {
        try {
          localStorage.setItem(storageKey, next);
        } catch {
          // Private mode: the choice lasts for this page only
        }
        setThemeState(next);
      },
    }),
    [theme, resolvedTheme, storageKey],
  );

  return <ThemeProviderContext.Provider value={value}>{children}</ThemeProviderContext.Provider>;
};
