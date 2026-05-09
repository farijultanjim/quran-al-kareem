"use client";

import { useEffect } from "react";

/**
 * Component to initialize theme on mount
 * This prevents flash of wrong theme on page load
 */
export function ThemeInitializer() {
  useEffect(() => {
    // Get saved theme or default to system
    const savedSettings = localStorage.getItem("quran-settings");
    let theme = "system";

    if (savedSettings) {
      try {
        const parsed = JSON.parse(savedSettings);
        theme = parsed.theme || "system";
      } catch (error) {
        console.error("Failed to parse settings:", error);
      }
    }

    // Determine effective theme
    let effectiveTheme: "light" | "dark" | "sepia" = theme as any;
    if (theme === "system") {
      const isDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
      effectiveTheme = isDark ? "dark" : "light";
    }

    // Apply theme
    const root = document.documentElement;
    root.setAttribute("data-theme", effectiveTheme);

    if (effectiveTheme === "dark" || effectiveTheme === "sepia") {
      root.classList.add("dark");
    } else {
      root.classList.remove("dark");
    }
  }, []);

  return null;
}
