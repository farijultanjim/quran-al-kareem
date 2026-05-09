"use client";

import { useState } from "react";
import { SearchModal } from "@/components/SearchModal";

interface LayoutWrapperProps {
  children: React.ReactNode;
}

export function LayoutWrapper({ children }: LayoutWrapperProps) {
  const [searchOpen, setSearchOpen] = useState(false);

  return (
    <>
      <SearchModal open={searchOpen} onOpenChange={setSearchOpen} />
      {children}
    </>
  );
}
