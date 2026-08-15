"use client";

import { useTheme } from "./ThemeProvider";
import { Sun, Moon, Monitor } from "lucide-react";

interface ThemeToggleProps {
  variant?: "icon" | "dropdown";
}

export default function ThemeToggle({ variant = "icon" }: ThemeToggleProps) {
  const { theme, resolvedTheme, setTheme, toggleTheme } = useTheme();

  if (variant === "dropdown") {
    return (
      <div className="relative group">
        <button
          className="flex items-center gap-2 px-3 py-2 rounded-xl text-sm font-medium transition-all
                     bg-[var(--surface-tertiary)] text-[var(--text-secondary)] hover:text-[var(--text-primary)]"
        >
          {resolvedTheme === "dark" ? (
            <Moon size={16} className="text-brand-400" />
          ) : (
            <Sun size={16} className="text-amber-500" />
          )}
          <span className="capitalize">{theme}</span>
        </button>

        <div
          className="absolute right-0 top-full mt-2 w-36 py-1 rounded-xl border shadow-lg opacity-0 invisible
                        group-hover:opacity-100 group-hover:visible transition-all duration-200 z-50
                        bg-[var(--surface-primary)] border-[var(--border-default)]"
        >
          {(["light", "dark", "system"] as const).map((t) => (
            <button
              key={t}
              onClick={() => setTheme(t)}
              className={`flex items-center gap-2 w-full px-3 py-2 text-sm transition-colors
                         hover:bg-[var(--surface-tertiary)] ${
                           theme === t
                             ? "text-brand-500 font-medium"
                             : "text-[var(--text-secondary)]"
                         }`}
            >
              {t === "light" && <Sun size={14} />}
              {t === "dark" && <Moon size={14} />}
              {t === "system" && <Monitor size={14} />}
              <span className="capitalize">{t}</span>
            </button>
          ))}
        </div>
      </div>
    );
  }

  return (
    <button
      onClick={toggleTheme}
      className="relative flex items-center justify-center w-10 h-10 rounded-xl transition-all duration-300
                 bg-[var(--surface-tertiary)] hover:bg-[var(--surface-primary)] hover:shadow-md
                 border border-transparent hover:border-[var(--border-default)]"
      aria-label={`Switch to ${resolvedTheme === "dark" ? "light" : "dark"} mode`}
    >
      <div className="relative w-5 h-5">
        <Sun
          size={20}
          className={`absolute inset-0 transition-all duration-300 text-amber-500 ${
            resolvedTheme === "dark"
              ? "opacity-0 rotate-90 scale-0"
              : "opacity-100 rotate-0 scale-100"
          }`}
        />
        <Moon
          size={20}
          className={`absolute inset-0 transition-all duration-300 text-brand-400 ${
            resolvedTheme === "dark"
              ? "opacity-100 rotate-0 scale-100"
              : "opacity-0 -rotate-90 scale-0"
          }`}
        />
      </div>
    </button>
  );
}
