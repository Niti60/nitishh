import { useCallback, useEffect, useMemo, useState, type ReactNode } from "react";
import {
  ThemeContext,
  applyThemeToDocument,
  getStoredPreference,
  getSystemPreference,
  STORAGE_KEY,
  type ResolvedTheme,
  type ThemePreference,
} from "../lib/theme";

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [theme, setThemeState] = useState<ThemePreference>("system");
  const [systemTheme, setSystemTheme] = useState<ResolvedTheme>("light");
  const [mounted, setMounted] = useState(false);

  // Initialize preference and system theme after hydration
  useEffect(() => {
    const stored = getStoredPreference();
    const system = getSystemPreference();
    setThemeState(stored);
    setSystemTheme(system);
    setMounted(true);

    const resolved = stored === "system" ? system : stored;
    applyThemeToDocument(resolved);
  }, []);

  // Listen for operating system theme changes
  useEffect(() => {
    if (typeof window === "undefined" || !window.matchMedia) return;

    const mediaQuery = window.matchMedia("(prefers-color-scheme: dark)");

    const handleChange = (e: MediaQueryListEvent) => {
      const nextSystem: ResolvedTheme = e.matches ? "dark" : "light";
      setSystemTheme(nextSystem);

      // If user hasn't set an explicit preference, automatically follow the system
      if (getStoredPreference() === "system") {
        applyThemeToDocument(nextSystem);
      }
    };

    mediaQuery.addEventListener("change", handleChange);
    return () => mediaQuery.removeEventListener("change", handleChange);
  }, []);

  // Compute resolved active theme
  const resolvedTheme: ResolvedTheme = useMemo(() => {
    if (theme === "system") {
      return systemTheme;
    }
    return theme;
  }, [theme, systemTheme]);

  // Set explicit preference
  const setTheme = useCallback((preference: ThemePreference) => {
    setThemeState(preference);
    try {
      if (preference === "system") {
        localStorage.removeItem(STORAGE_KEY);
      } else {
        localStorage.setItem(STORAGE_KEY, preference);
      }
    } catch {
      // Ignore localStorage errors
    }

    const resolved = preference === "system" ? getSystemPreference() : preference;
    applyThemeToDocument(resolved);
  }, []);

  // Toggle theme directly between light and dark, converting system into explicit choice
  const toggleTheme = useCallback(() => {
    const next: ResolvedTheme = resolvedTheme === "dark" ? "light" : "dark";
    setTheme(next);
  }, [resolvedTheme, setTheme]);

  const value = useMemo(
    () => ({
      theme,
      resolvedTheme,
      setTheme,
      toggleTheme,
      mounted,
    }),
    [theme, resolvedTheme, setTheme, toggleTheme, mounted],
  );

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}
