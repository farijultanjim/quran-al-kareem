"use client";

import { useSettings, type Theme } from "@/app/_context/SettingsContext";
import { cn } from "@/lib/utils";

export function ThemeSelector() {
  const { settings, updateSettings } = useSettings();

  const themes: { value: Theme; label: string }[] = [
    { value: "light", label: "Light" },
    { value: "dark", label: "Dark" },
    { value: "sepia", label: "Sepia" },
    { value: "system", label: "System" },
  ];

  return (
    <div className="space-y-3">
      <label className="text-sm font-semibold text-foreground">Theme</label>
      <div className="grid grid-cols-2 gap-2">
        {themes.map((theme) => (
          <button
            key={theme.value}
            onClick={() => updateSettings({ theme: theme.value })}
            className={cn(
              "px-3 py-2 rounded-lg border transition-colors text-sm font-medium",
              settings.theme === theme.value
                ? "bg-primary text-white border-primary"
                : "bg-background border-border text-foreground hover:border-primary",
            )}
          >
            {theme.label}
          </button>
        ))}
      </div>
    </div>
  );
}
