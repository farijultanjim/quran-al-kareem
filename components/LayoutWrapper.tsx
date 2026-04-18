"use client";

import { useState } from "react";
import Header from "@/components/Header";
import { SettingsSheet } from "@/components/SettingsSheet";

interface LayoutWrapperProps {
  children: React.ReactNode;
}

export function LayoutWrapper({ children }: LayoutWrapperProps) {
  const [settingsOpen, setSettingsOpen] = useState(false);

  return (
    <>
      <Header onSettingsClick={() => setSettingsOpen(true)} />
      <SettingsSheet open={settingsOpen} onOpenChange={setSettingsOpen} />
      {children}
    </>
  );
}
