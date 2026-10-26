import { createContext, useContext } from "react";

export type Theme = "dark" | "light" | "system";

export type ThemeContextValue = {
  theme: Theme;
  // The theme actually applied, with "system" resolved to light or dark
  resolvedTheme: "dark" | "light";
  setTheme: (theme: Theme) => void;
};

export const ThemeProviderContext = createContext<ThemeContextValue | null>(null);

export const useTheme = () => {
  const context = useContext(ThemeProviderContext);
  if (!context) throw new Error("useTheme must be used within a ThemeProvider");
  return context;
};
