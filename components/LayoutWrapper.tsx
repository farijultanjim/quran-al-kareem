"use client";

import { useState } from "react";
import Header from "@/components/Header";
import { SettingsSheet } from "@/components/SettingsSheet";
import { SearchModal } from "@/components/SearchModal";

interface LayoutWrapperProps {
  children: React.ReactNode;
}

export function LayoutWrapper({ children }: LayoutWrapperProps) {
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);

  return (
    <>
      <Header
        onSearchClick={() => setSearchOpen(true)}
        onSettingsClick={() => setSettingsOpen(true)}
      />
      <SettingsSheet open={settingsOpen} onOpenChange={setSettingsOpen} />
      <SearchModal open={searchOpen} onOpenChange={setSearchOpen} />
      {children}
    </>
  );
}
