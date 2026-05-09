"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
} from "@/components/ui/sidebar";
import { useSettings, type ArabicFont } from "@/app/_context/SettingsContext";
import { RotateCcw } from "lucide-react";
import { Button } from "@/components/ui/Button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { ChevronDown } from "lucide-react";

export function SettingsSidebar() {
  const { settings, updateSettings, resetSettings } = useSettings();
  const [headerHidden, setHeaderHidden] = useState(false);

  useEffect(() => {
    const scrollEl = document.getElementById("surah-scroll-container");
    let prevScrollY = scrollEl ? scrollEl.scrollTop : window.scrollY;

    const onScroll = () => {
      const currentScrollY = scrollEl ? scrollEl.scrollTop : window.scrollY;
      if (currentScrollY > prevScrollY && currentScrollY > 0) {
        setHeaderHidden(true);
      } else if (currentScrollY < prevScrollY || currentScrollY === 0) {
        setHeaderHidden(false);
      }
      prevScrollY = currentScrollY;
    };

    if (scrollEl) {
      scrollEl.addEventListener("scroll", onScroll, { passive: true });
      return () => scrollEl.removeEventListener("scroll", onScroll);
    }

    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const arabicFonts: { label: string; value: ArabicFont; preview: string }[] = [
    { label: "Amiri", value: "amiri", preview: "Amiri" },
    { label: "Scheherazade", value: "scheherazade", preview: "Scheherazade" },
    { label: "Traditional", value: "traditional", preview: "Traditional" },
  ];

  return (
    <Sidebar
      side="right"
      className={`hidden lg:flex min-w-80 top-20 border-l border-border will-change-transform transition-transform duration-500 ease-[cubic-bezier(0.76,0,0.24,1)] ${
        headerHidden ? "-translate-y-20" : "translate-y-0"
      }`}
    >
      <SidebarHeader className="p-5.5">
        <h2 className="text-lg font-bold text-primary">Reading Settings</h2>
      </SidebarHeader>

      <SidebarContent className="px-5.5 space-y-6">
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
                  updateSettings({ arabicFontSize: parseFloat(e.target.value) })
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
                      {arabicFonts.find((f) => f.value === settings.arabicFont)
                        ?.label || "Select font"}
                    </span>
                    <ChevronDown className="w-4 h-4 text-foreground/60" />
                  </button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="">
                  {arabicFonts.map((font) => (
                    <DropdownMenuItem
                      key={font.value}
                      onClick={() => updateSettings({ arabicFont: font.value })}
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
      </SidebarContent>

      <SidebarFooter>
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
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
      </SidebarFooter>
    </Sidebar>
  );
}
