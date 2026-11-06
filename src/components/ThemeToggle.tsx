import { Moon, Sun } from "lucide-react";
import { useTheme } from "../lib/theme";

interface ThemeToggleProps {
  className?: string;
}

export function ThemeToggle({ className = "" }: ThemeToggleProps) {
  const { resolvedTheme, toggleTheme, mounted } = useTheme();

  // Consistent label on initial hydration to avoid hydration mismatch
  const label = mounted
    ? resolvedTheme === "dark"
      ? "Switch to light mode"
      : "Switch to dark mode"
    : "Switch to dark mode";

  return (
    <button
      type="button"
      className={`theme-toggle-btn ${className}`.trim()}
      aria-label={label}
      title={label}
      onClick={toggleTheme}
    >
      <Sun className="theme-icon--sun size-3.5" aria-hidden="true" />
      <Moon className="theme-icon--moon size-3.5" aria-hidden="true" />
    </button>
  );
}

