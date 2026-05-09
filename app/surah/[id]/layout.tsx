"use client";

import { useState } from "react";
import { SidebarProvider } from "@/components/ui/sidebar";
import Header from "@/components/Header";
import { SearchModal } from "@/components/SearchModal";
import { SurahSidebar } from "@/components/SurahSidebar";
import { SettingsSidebar } from "@/components/SettingsSidebar";
import { SettingsSheet } from "@/components/SettingsSheet";
import { SurahSheet } from "@/components/SurahSheet";

interface SurahLayoutProps {
  children: React.ReactNode;
}

export default function SurahLayout({ children }: SurahLayoutProps) {
  const [searchOpen, setSearchOpen] = useState(false);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [surahOpen, setSurahOpen] = useState(false);

  return (
    <div className="relative h-screen w-full overflow-hidden">
      {/* Fixed Header */}
      <Header
        onSearchClick={() => setSearchOpen(true)}
        onSettingsClick={() => setSettingsOpen(true)}
        onMenuClick={() => setSurahOpen(true)}
      />

      <SearchModal open={searchOpen} onOpenChange={setSearchOpen} />

      {/* Fixed Sidebars + Scrollable Main Content */}
      <SidebarProvider className="relative [--sidebar-width:20rem] h-full w-full overflow-x-hidden">
        {/* Left Sidebar - Surahs */}
        <SurahSidebar />

        {/* Main Content Area - Scrollable */}
        <main
          id="surah-scroll-container"
          className="min-w-0 h-full overflow-y-auto no-scrollbar pt-20 lg:absolute lg:inset-y-0 lg:left-80 lg:right-80 lg:w-auto"
        >
          {children}
        </main>

        {/* Right Sidebar - Settings */}
        <SettingsSidebar />
      </SidebarProvider>

      {/* Settings Sheet for Mobile */}
      <SettingsSheet open={settingsOpen} onOpenChange={setSettingsOpen} />
      <SurahSheet open={surahOpen} onOpenChange={setSurahOpen} />
    </div>
  );
}
