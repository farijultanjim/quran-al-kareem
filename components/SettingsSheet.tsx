"use client";

import React from "react";
import { motion } from "framer-motion";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/Sheet";
import { Button } from "@/components/ui/Button";
import { useSettings, type ArabicFont } from "@/app/_context/SettingsContext";
import { RotateCcw, ChevronDown } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { ThemeSelector } from "@/components/ThemeSelector";

interface SettingsSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function SettingsSheet({ open, onOpenChange }: SettingsSheetProps) {
  const { settings, updateSettings, resetSettings } = useSettings();

  const arabicFonts: { label: string; value: ArabicFont; preview: string }[] = [
    { label: "Amiri", value: "amiri", preview: "Amiri" },
    { label: "Scheherazade", value: "scheherazade", preview: "Scheherazade" },
    { label: "Traditional", value: "traditional", preview: "Traditional" },
  ];

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="right" className="flex flex-col">
        <SheetHeader className="mb-6 p-5">
          <SheetTitle>Reading Settings</SheetTitle>
        </SheetHeader>

        <div className="px-5.5 space-y-6 mb-16">
          {/* Font Settings */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.05 }}
            className="space-y-3"
          >
            <div className="flex items-center gap-3 mb-7">
              <div className="w-5 h-5 grid place-items-center rounded-full bg-primary text-foreground text-xs font-black">
                T
              </div>
              <h3 className="text-sm font-semibold text-foreground">
                Font Settings
              </h3>
            </div>

            <div className="space-y-6">
              {/* Arabic Font Size */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <label className="text-sm font-semibold text-foreground">
                    Arabic Font Size
                  </label>
                  <span className="text-sm font-semibold text-primary">
                    {Math.round(settings.arabicFontSize * 30)}
                  </span>
                </div>
                <input
                  title="Arabic font size"
                  type="range"
                  min="1.15"
                  max="2.875"
                  step="0.125"
                  value={settings.arabicFontSize}
                  onChange={(e) =>
                    updateSettings({
                      arabicFontSize: parseFloat(e.target.value),
                    })
                  }
                  className="w-full h-1.5 bg-primary/10 rounded-lg appearance-none cursor-pointer accent-primary"
                />
              </div>

              {/* Translation Font Size */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <label className="text-sm font-semibold text-foreground">
                    Translation Font Size
                  </label>
                  <span className="text-sm font-semibold text-primary">
                    {Math.round(settings.translationFontSize * 18)}
                  </span>
                </div>
                <input
                  title="Translation font size"
                  type="range"
                  min="0.75"
                  max="2.25"
                  step="0.05"
                  value={settings.translationFontSize}
                  onChange={(e) =>
                    updateSettings({
                      translationFontSize: parseFloat(e.target.value),
                    })
                  }
                  className="w-full h-1.5 bg-primary/10 rounded-lg appearance-none cursor-pointer accent-primary "
                />
              </div>

              {/* Arabic Font Face Dropdown */}
              <div className="space-y-4">
                <label className="text-sm font-semibold text-foreground pb-4">
                  Arabic Font Face
                </label>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <button className="w-full flex items-center justify-between rounded-lg px-4 py-3 bg-background border border-border/40">
                      <span className="text-sm font-medium">
                        {arabicFonts.find(
                          (f) => f.value === settings.arabicFont,
                        )?.label || "Select font"}
                      </span>
                      <ChevronDown className="w-4 h-4 text-foreground/60" />
                    </button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent className="">
                    {arabicFonts.map((font) => (
                      <DropdownMenuItem
                        key={font.value}
                        onClick={() =>
                          updateSettings({ arabicFont: font.value })
                        }
                        className="py-3 bg-background hover:bg-primary/5 data-[state=open]:bg-primary/10 cursor-pointer"
                      >
                        {font.label}
                      </DropdownMenuItem>
                    ))}
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </div>
          </motion.div>
        </div>

        {/* Reset Button - Sticky at bottom */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="pt-6 border-t border-border"
        >
          <Button
            onClick={resetSettings}
            className="w-full flex items-center justify-center gap-2"
            variant="outlined"
          >
            <div className="flex items-center gap-2">
              <RotateCcw className="w-4 h-4" />
              <span>Reset</span>
            </div>
          </Button>
        </motion.div>
      </SheetContent>
    </Sheet>
  );
}
