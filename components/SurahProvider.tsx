"use client";

import React, { createContext, useContext, useEffect, useState } from "react";

interface Surah {
  number: number;
  name: string;
  englishName: string;
  englishNameTranslation: string;
  numberOfAyahs?: number;
  revelationType?: string;
}

interface SurahContextValue {
  surahs: Surah[];
  loading: boolean;
  refresh: () => Promise<void>;
}

const SurahContext = createContext<SurahContextValue | undefined>(undefined);

export function SurahProvider({ children }: { children: React.ReactNode }) {
  const [surahs, setSurahs] = useState<Surah[]>([]);
  const [loading, setLoading] = useState(true);

  async function fetchSurahs() {
    setLoading(true);
    try {
      const res = await fetch("https://api.alquran.cloud/v1/surah");
      const data = await res.json();
      setSurahs(data.data || []);
    } catch (err) {
      console.error("Failed to load surahs:", err);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    void fetchSurahs();
  }, []);

  return (
    <SurahContext.Provider value={{ surahs, loading, refresh: fetchSurahs }}>
      {children}
    </SurahContext.Provider>
  );
}

export function useSurahStore() {
  const ctx = useContext(SurahContext);
  if (!ctx) throw new Error("useSurahStore must be used within SurahProvider");
  return ctx;
}
