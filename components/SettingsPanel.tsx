"use client";

import React, { useState } from "react";
import { useSettings, type ArabicFont } from "@/app/_context/SettingsContext";

interface SettingsPanelProps {
  isOpen?: boolean;
  onClose?: () => void;
}

export const SettingsPanel: React.FC<SettingsPanelProps> = ({
  isOpen = true,
  onClose,
}) => {
  const { settings, updateSettings, resetSettings } = useSettings();
  const [hasChanges, setHasChanges] = useState(false);

  const handleFontChange = (font: ArabicFont) => {
    updateSettings({ arabicFont: font });
    setHasChanges(true);
  };

  const handleArabicSizeChange = (size: number) => {
    updateSettings({ arabicFontSize: size });
    setHasChanges(true);
  };

  const handleTranslationSizeChange = (size: number) => {
    updateSettings({ translationFontSize: size });
    setHasChanges(true);
  };

  const handleReset = () => {
    resetSettings();
    setHasChanges(false);
  };

  const arabicFonts: { label: string; value: ArabicFont }[] = [
    { label: "Amiri", value: "amiri" },
    { label: "Scheherazade", value: "scheherazade" },
    { label: "Traditional", value: "traditional" },
  ];

  return (
    <aside
      className={`
        fixed inset-y-16 right-0 z-30 w-64 transform bg-white dark:bg-neutral-800 border-l 
        border-border shadow-lg transition-transform duration-300
        ${isOpen ? "translate-x-0" : "translate-x-full"}
        lg:static lg:inset-auto lg:translate-x-0 lg:z-auto lg:w-80 lg:border-l
        overflow-y-auto
      `}
    >
      <div className="p-6 space-y-8">
        {/* Close Button for Mobile */}
        <div className="flex items-center justify-between lg:hidden">
          <h2 className="text-lg font-bold">Settings</h2>
          <button
            onClick={onClose}
            className="text-xl font-bold text-muted-fg hover:text-foreground"
            aria-label="Close settings"
          >
            ✕
          </button>
        </div>

        <div className="hidden lg:block">
          <h2 className="text-lg font-bold mb-4">Settings</h2>
        </div>

        {/* Arabic Font Selection */}
        <div className="space-y-3">
          <label className="block text-sm font-semibold text-foreground">
            Arabic Font
          </label>
          <div className="space-y-2">
            {arabicFonts.map((font) => (
              <button
                key={font.value}
                onClick={() => handleFontChange(font.value)}
                className={`
                  w-full px-4 py-3 rounded-lg text-left transition-colors
                  ${
                    settings.arabicFont === font.value
                      ? "bg-primary text-white font-semibold"
                      : "bg-muted-bg dark:bg-neutral-700 hover:bg-primary/20 text-foreground"
                  }
                `}
              >
                <span className="arabic" style={{ fontFamily: font.value }}>
                  بسم الله
                </span>
                <p className="text-xs mt-1">{font.label}</p>
              </button>
            ))}
          </div>
        </div>

        {/* Arabic Font Size */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <label className="text-sm font-semibold text-foreground">
              Arabic Font Size
            </label>
            <span className="text-sm font-mono text-primary">
              {settings.arabicFontSize.toFixed(2)}rem
            </span>
          </div>
          <input
            type="range"
            min="0.875"
            max="1.875"
            step="0.125"
            value={settings.arabicFontSize}
            onChange={(e) => handleArabicSizeChange(parseFloat(e.target.value))}
            className="w-full h-2 bg-muted-bg dark:bg-neutral-700 rounded-lg appearance-none cursor-pointer accent-primary"
          />
          <div className="flex justify-between text-xs text-muted-fg">
            <span>Small</span>
            <span>Large</span>
          </div>
          <div className="p-3 bg-muted-bg dark:bg-neutral-700 rounded-lg">
            <p
              className="arabic text-center"
              style={{ fontSize: `${settings.arabicFontSize}rem` }}
            >
              يا أيها الناس
            </p>
          </div>
        </div>

        {/* Translation Font Size */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <label className="text-sm font-semibold text-foreground">
              Translation Font Size
            </label>
            <span className="text-sm font-mono text-primary">
              {settings.translationFontSize.toFixed(2)}rem
            </span>
          </div>
          <input
            type="range"
            min="0.75"
            max="1.25"
            step="0.05"
            value={settings.translationFontSize}
            onChange={(e) =>
              handleTranslationSizeChange(parseFloat(e.target.value))
            }
            className="w-full h-2 bg-muted-bg dark:bg-neutral-700 rounded-lg appearance-none cursor-pointer accent-primary"
          />
          <div className="flex justify-between text-xs text-muted-fg">
            <span>Small</span>
            <span>Large</span>
          </div>
          <div className="p-3 bg-muted-bg dark:bg-neutral-700 rounded-lg">
            <p
              className="translation text-center"
              style={{ fontSize: `${settings.translationFontSize}rem` }}
            >
              O mankind, indeed We have created you
            </p>
          </div>
        </div>

        {/* Reset Button */}
        <button
          onClick={handleReset}
          className="w-full px-4 py-3 rounded-lg bg-muted-bg dark:bg-neutral-700 hover:bg-primary/10 text-foreground font-medium transition-colors"
        >
          Reset to Default
        </button>

        {/* Info */}
        <div className="p-3 bg-primary/10 dark:bg-primary/20 rounded-lg">
          <p className="text-xs text-muted-fg">
            Your settings are automatically saved to your device.
          </p>
        </div>
      </div>
    </aside>
  );
};
