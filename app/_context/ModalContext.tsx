"use client";

import React, { createContext, useContext, useState } from "react";

interface ModalContextValue {
  settingsOpen: boolean;
  setSettingsOpen: (open: boolean) => void;
  surahOpen: boolean;
  setSurahOpen: (open: boolean) => void;
}

const ModalContext = createContext<ModalContextValue | undefined>(undefined);

export function ModalProvider({ children }: { children: React.ReactNode }) {
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [surahOpen, setSurahOpen] = useState(false);

  return (
    <ModalContext.Provider
      value={{ settingsOpen, setSettingsOpen, surahOpen, setSurahOpen }}
    >
      {children}
    </ModalContext.Provider>
  );
}

export function useModals() {
  const ctx = useContext(ModalContext);
  if (!ctx) throw new Error("useModals must be used within ModalProvider");
  return ctx;
}
