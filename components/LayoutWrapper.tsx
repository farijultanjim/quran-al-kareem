"use client";

import { useState } from "react";
import Header from "@/components/Header";
import { SearchModal } from "@/components/SearchModal";
import { ErrorBoundary } from "@/components/ErrorBoundary";
import { SurahProvider } from "./SurahProvider";
import { ModalProvider, useModals } from "@/app/_context/ModalContext";

interface LayoutWrapperProps {
  children: React.ReactNode;
}

function LayoutWrapperInner({ children }: LayoutWrapperProps) {
  const [searchOpen, setSearchOpen] = useState(false);
  const { setSettingsOpen, setSurahOpen } = useModals();

  return (
    <ErrorBoundary>
      <Header
        onSearchClick={() => setSearchOpen(true)}
        onSettingsClick={() => setSettingsOpen(true)}
        onMenuClick={() => setSurahOpen(true)}
      />
      <SearchModal open={searchOpen} onOpenChange={setSearchOpen} />
      {children}
    </ErrorBoundary>
  );
}

export function LayoutWrapper({ children }: LayoutWrapperProps) {
  return (
    <SurahProvider>
      <ModalProvider>
        <LayoutWrapperInner>{children}</LayoutWrapperInner>
      </ModalProvider>
    </SurahProvider>
  );
}
