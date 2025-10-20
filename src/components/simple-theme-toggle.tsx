"use client";

import { Moon, Sun } from "lucide-react";
import { useTheme } from "next-themes";

export function SimpleThemeToggle() {
  const { setTheme, theme } = useTheme();

  return (
    <button
      onClick={() => setTheme(theme === "light" ? "dark" : "light")}
      className="h-10 w-10 flex items-center justify-center rounded-md border-2 border-primary bg-primary/10 hover:bg-primary/20 transition-all duration-200 hover:scale-105 active:scale-95"
      title={`Alternar para tema ${theme === "light" ? "escuro" : "claro"}`}
    >
      <div className="relative">
        <Sun className="h-5 w-5 rotate-0 scale-100 transition-all duration-300 dark:-rotate-90 dark:scale-0 text-primary" />
        <Moon className="absolute h-5 w-5 top-0 left-0 rotate-90 scale-0 transition-all duration-300 dark:rotate-0 dark:scale-100 text-primary" />
      </div>
      <span className="sr-only">Alternar tema</span>
    </button>
  );
}
