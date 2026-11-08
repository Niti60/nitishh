import { createContext, useContext } from "react";

export type ThemePreference = "system" | "light" | "dark";
export type ResolvedTheme = "light" | "dark";

export interface ThemeContextValue {
  theme: ThemePreference;
  resolvedTheme: ResolvedTheme;
  setTheme: (preference: ThemePreference) => void;
  toggleTheme: () => void;
  mounted: boolean;
}

export const STORAGE_KEY = "theme";

export const ThemeContext = createContext<ThemeContextValue | null>(null);

/**
 * Reads the system color scheme preference.
 */
export function getSystemPreference(): ResolvedTheme {
  if (typeof window === "undefined" || !window.matchMedia) {
    return "light";
  }
  return window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
}

/**
 * Reads stored preference from localStorage.
 */
export function getStoredPreference(): ThemePreference {
  if (typeof window === "undefined") return "system";
  try {
    const val = localStorage.getItem(STORAGE_KEY);
    if (val === "light" || val === "dark") {
      return val;
    }
  } catch {
    // Ignore localStorage access errors (e.g. incognito restrictions)
  }
  return "system";
}

/**
 * Updates the <html> element class and color-scheme style.
 */
export function applyThemeToDocument(resolved: ResolvedTheme) {
  if (typeof document === "undefined") return;
  const root = document.documentElement;
  const isDark = resolved === "dark";
  root.classList.toggle("dark", isDark);
  root.style.colorScheme = resolved;
}

export function useTheme(): ThemeContextValue {
  const context = useContext(ThemeContext);
  if (!context) {
    return {
      theme: "system",
      resolvedTheme: "light",
      setTheme: () => {},
      toggleTheme: () => {},
      mounted: false,
    };
  }
  return context;
}
