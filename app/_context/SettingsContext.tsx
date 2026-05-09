"use client";

import React, {
  createContext,
  useContext,
  useEffect,
  useState,
  ReactNode,
} from "react";

export type ArabicFont = "amiri" | "scheherazade" | "traditional";
export type Theme = "light" | "dark" | "sepia" | "system";

export interface Settings {
  arabicFont: ArabicFont;
  arabicFontSize: number; // in rem
  translationFontSize: number; // in rem
  theme: Theme;
}

interface SettingsContextType {
  settings: Settings;
  updateSettings: (newSettings: Partial<Settings>) => void;
  resetSettings: () => void;
}

const DEFAULT_SETTINGS: Settings = {
  arabicFont: "amiri",
  arabicFontSize: 1.125,
  translationFontSize: 0.95,
  theme: "system",
};

export const THEME_COLORS = {
  light: {
    background: "#FFFFFF",
    primary: "#428038",
  },
  dark: {
    background: "#0D0D0D",
    primary: "#428038",
  },
  sepia: {
    background: "#F8F5EC",
    primary: "#97724E",
  },
};

const SettingsContext = createContext<SettingsContextType | undefined>(
  undefined,
);

export const SettingsProvider: React.FC<{ children: ReactNode }> = ({
  children,
}) => {
  const [settings, setSettings] = useState<Settings>(DEFAULT_SETTINGS);
  const [mounted, setMounted] = useState(false);

  // Load settings from localStorage
  useEffect(() => {
    const savedSettings = localStorage.getItem("quran-settings");
    if (savedSettings) {
      try {
        const parsed = JSON.parse(savedSettings);
        setSettings({ ...DEFAULT_SETTINGS, ...parsed });
      } catch (error) {
        console.error("Failed to parse settings:", error);
      }
    }
    setMounted(true);
  }, []);

  // Apply CSS variables when settings change
  useEffect(() => {
    if (!mounted) return;

    const root = document.documentElement;

    // Determine effective theme (system -> light/dark based on OS preference)
    let effectiveTheme: "light" | "dark" | "sepia" = settings.theme as any;
    if (settings.theme === "system") {
      const isDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
      effectiveTheme = isDark ? "dark" : "light";
    }

    // Apply theme colors
    const themeColors = THEME_COLORS[effectiveTheme];
    root.style.setProperty("--background", themeColors.background);
    root.style.setProperty("--primary", themeColors.primary);
    root.setAttribute("data-theme", effectiveTheme);

    // Set Tailwind dark mode class
    if (effectiveTheme === "dark" || effectiveTheme === "sepia") {
      root.classList.add("dark");
    } else {
      root.classList.remove("dark");
    }

    // Set font size variables
    root.style.setProperty(
      "--arabic-font-size",
      `${settings.arabicFontSize}rem`,
    );
    root.style.setProperty(
      "--translation-font-size",
      `${settings.translationFontSize}rem`,
    );

    // Set font family
    const fontMap: Record<ArabicFont, string> = {
      amiri: "'Amiri', serif",
      scheherazade: "'Scheherazade New', serif",
      traditional: "'Traditional Arabic', 'Amiri', sans-serif",
    };
    root.style.setProperty("--font-arabic", fontMap[settings.arabicFont]);

    // Save to localStorage
    localStorage.setItem("quran-settings", JSON.stringify(settings));
  }, [settings, mounted]);

  const updateSettings = (newSettings: Partial<Settings>) => {
    setSettings((prev) => ({ ...prev, ...newSettings }));
  };

  const resetSettings = () => {
    setSettings(DEFAULT_SETTINGS);
  };

  return (
    <SettingsContext.Provider
      value={{ settings, updateSettings, resetSettings }}
    >
      {children}
    </SettingsContext.Provider>
  );
};

export const useSettings = () => {
  const context = useContext(SettingsContext);
  if (!context) {
    throw new Error("useSettings must be used within SettingsProvider");
  }
  return context;
};
