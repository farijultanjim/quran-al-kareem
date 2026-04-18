"use client";

import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/Sheet";
import { Button } from "@/components/Button";
import { useSettings, type ArabicFont } from "@/app/_context/SettingsContext";
import { RotateCcw } from "lucide-react";
import { useLenis } from "@/lib/lenis";

interface SettingsSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function SettingsSheet({ open, onOpenChange }: SettingsSheetProps) {
  const { settings, updateSettings, resetSettings } = useSettings();
  const lenis = useLenis();
  const [tempSettings, setTempSettings] = useState(settings);

  // Stop Lenis when sheet is open so the background page doesn't scroll
  useEffect(() => {
    if (!lenis) return;
    if (open) {
      lenis.stop();
      return () => lenis.start();
    }
  }, [open, lenis]);

  const arabicFonts: { label: string; value: ArabicFont; preview: string }[] = [
    { label: "Amiri", value: "amiri", preview: "Amiri" },
    { label: "Scheherazade", value: "scheherazade", preview: "Scheherazade" },
    { label: "Traditional", value: "traditional", preview: "Traditional" },
  ];

  const handleFontChange = (font: ArabicFont) => {
    const newSettings = { ...tempSettings, arabicFont: font };
    setTempSettings(newSettings);
    updateSettings({ arabicFont: font });
  };

  const handleArabicSizeChange = (size: number) => {
    const newSettings = { ...tempSettings, arabicFontSize: size };
    setTempSettings(newSettings);
    updateSettings({ arabicFontSize: size });
  };

  const handleTranslationSizeChange = (size: number) => {
    const newSettings = { ...tempSettings, translationFontSize: size };
    setTempSettings(newSettings);
    updateSettings({ translationFontSize: size });
  };

  const handleReset = () => {
    resetSettings();
    setTempSettings({
      arabicFont: "amiri",
      arabicFontSize: 1.125,
      translationFontSize: 0.95,
    });
  };

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="right">
        <SheetHeader>
          <SheetTitle>Settings</SheetTitle>
          <SheetDescription>Customize your reading experience</SheetDescription>
        </SheetHeader>

        <div className="flex flex-col gap-6">
          {/* Arabic Font Selection */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="space-y-3"
          >
            <label className="block text-sm font-semibold text-foreground">
              Arabic Font
            </label>
            <div className="grid gap-2">
              {arabicFonts.map((font) => (
                <Button
                  key={font.value}
                  variant="select"
                  isActive={settings.arabicFont === font.value}
                  onClick={() => handleFontChange(font.value)}
                >
                  <div className="flex flex-col items-start">
                    <span className="text-xs opacity-70">{font.label}</span>
                    <span
                      className="text-sm mt-1 font-semibold"
                      style={{
                        fontFamily:
                          font.value === "amiri"
                            ? "'Amiri', serif"
                            : font.value === "scheherazade"
                              ? "'Scheherazade New', serif"
                              : "'Traditional Arabic', sans-serif",
                      }}
                    >
                      بسم الله الرحمن
                    </span>
                  </div>
                </Button>
              ))}
            </div>
          </motion.div>

          {/* Arabic Font Size */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="space-y-4"
          >
            <div className="flex items-center justify-between">
              <label className="text-sm font-semibold text-foreground">
                Arabic Font Size
              </label>
              <span className="text-xs font-mono text-primary">
                {settings.arabicFontSize.toFixed(2)}rem
              </span>
            </div>

            <div className="space-y-3">
              <input
                type="range"
                min="0.875"
                max="1.875"
                step="0.125"
                value={settings.arabicFontSize}
                onChange={(e) =>
                  handleArabicSizeChange(parseFloat(e.target.value))
                }
                className="w-full h-2 bg-primary/10 rounded-lg appearance-none cursor-pointer accent-primary"
              />
              <div className="flex justify-between text-xs text-foreground/60">
                <span>Small</span>
                <span>Large</span>
              </div>
            </div>

            {/* Preview */}
            <div className="p-3 rounded-lg bg-primary/5 border border-primary/10">
              <p
                className="text-right font-semibold"
                style={{
                  fontSize: `${settings.arabicFontSize}rem`,
                  fontFamily: "'Amiri', serif",
                }}
              >
                يا أيها الناس إنا خلقناكم
              </p>
            </div>
          </motion.div>

          {/* Translation Font Size */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="space-y-4"
          >
            <div className="flex items-center justify-between">
              <label className="text-sm font-semibold text-foreground">
                Translation Font Size
              </label>
              <span className="text-xs font-mono text-primary">
                {settings.translationFontSize.toFixed(2)}rem
              </span>
            </div>

            <div className="space-y-3">
              <input
                type="range"
                min="0.75"
                max="1.25"
                step="0.05"
                value={settings.translationFontSize}
                onChange={(e) =>
                  handleTranslationSizeChange(parseFloat(e.target.value))
                }
                className="w-full h-2 bg-primary/10 rounded-lg appearance-none cursor-pointer accent-primary"
              />
              <div className="flex justify-between text-xs text-foreground/60">
                <span>Small</span>
                <span>Large</span>
              </div>
            </div>

            {/* Preview */}
            <div className="p-3 rounded-lg bg-primary/5 border border-primary/10">
              <p
                style={{
                  fontSize: `${settings.translationFontSize}rem`,
                }}
                className="text-foreground/70"
              >
                O mankind, indeed We have created you from male and female
              </p>
            </div>
          </motion.div>

          {/* Reset Button */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="w-full"
          >
            <Button
              variant="sm-outlined"
              onClick={handleReset}
              className="w-full flex items-center justify-center gap-2"
            >
              <div className="flex items-center gap-3">
                <RotateCcw className="w-4 h-4" />
                <span>Reset to Defaults</span>
              </div>
            </Button>
          </motion.div>

          {/* Info */}
          {/* <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="p-3 rounded-lg bg-primary/5 border border-primary/10"
          >
            <p className="text-xs text-foreground/60">
              💾 Your settings are automatically saved to your device.
            </p>
          </motion.div> */}
        </div>
      </SheetContent>
    </Sheet>
  );
}
