"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { useSettings } from "@/app/_context/SettingsContext";
import { useEffect, useState } from "react";

interface DisplaySurah {
  number: number;
  name: string;
  englishName: string;
  englishNameTranslation: string;
  revelationType: string;
  numberOfAyahs: number;
}

const containerVariants = {
  initial: { opacity: 0 },
  animate: {
    opacity: 1,
    transition: {
      staggerChildren: 0.05,
      delayChildren: 0.2,
    },
  },
};

const itemVariants = {
  initial: { opacity: 0, y: 20 },
  animate: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.5 },
  },
};

export function SurahList() {
  const { settings } = useSettings();
  const [surahs, setSurahs] = useState<DisplaySurah[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchSurahs() {
      try {
        const response = await fetch(
          "https://api.alquran.cloud/v1/quran/quran-uthmani",
        );
        if (!response.ok) throw new Error("Failed to fetch Surahs");

        const data = await response.json();
        const surahList = data.data.surahs.map((surah: any) => ({
          number: surah.number,
          name: surah.name,
          englishName: surah.englishName,
          englishNameTranslation: surah.englishNameTranslation,
          revelationType: surah.revelationType,
          numberOfAyahs: surah.ayahs.length,
        }));

        setSurahs(surahList);
        setLoading(false);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to load Surahs");
        setLoading(false);
      }
    }

    fetchSurahs();
  }, []);

  if (loading) {
    return (
      <section className="py-20 px-4">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {[...Array(12)].map((_, i) => (
              <div
                key={i}
                className="h-32 rounded-xl bg-primary/10 animate-pulse"
              />
            ))}
          </div>
        </div>
      </section>
    );
  }

  if (error) {
    return (
      <section className="py-20 px-4">
        <div className="max-w-7xl mx-auto text-center">
          <p className="text-foreground/60">Error loading Surahs: {error}</p>
        </div>
      </section>
    );
  }

  return (
    <section className="py-20 px-4">
      <div className="max-w-7xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="mb-16 text-center"
        >
          <h2 className="text-3xl md:text-5xl font-bold text-primary mb-4">
            All Surahs
          </h2>
          <p className="text-foreground/60 text-lg">
            Explore all 114 chapters of the Holy Qur'an
          </p>
        </motion.div>

        <motion.div
          variants={containerVariants}
          initial="initial"
          animate="animate"
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4"
        >
          {surahs.map((surah) => (
            <motion.div
              key={surah.number}
              variants={itemVariants}
              whileHover={{ y: -5 }}
              whileTap={{ scale: 0.98 }}
            >
              <Link href={`/surah/${surah.number}`}>
                <div className="h-full p-6 rounded-xl bg-gradient-to-br from-primary/10 to-primary/5 backdrop-blur-sm border border-primary/20 hover:border-primary/40 transition-all hover:shadow-lg cursor-pointer group overflow-hidden">
                  {/* Glassmorphic shine effect */}
                  <div className="absolute inset-0 bg-linear-to-r from-white/0 via-white/10 to-white/0 -translate-x-full group-hover:translate-x-full transition-transform duration-500" />

                  <div className="relative">
                    {/* Surah Number and Type */}
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex flex-col">
                        <span className="text-sm font-mono text-primary/60">
                          Surah {surah.number}
                        </span>
                      </div>
                      <span className="text-xs px-2.5 py-1 rounded-lg bg-primary/20 text-primary font-medium">
                        {surah.revelationType}
                      </span>
                    </div>

                    {/* Arabic Name */}
                    <h3
                      className="text-2xl font-bold text-right mb-2 text-foreground"
                      style={{
                        fontFamily:
                          settings.arabicFont === "amiri"
                            ? "'Amiri', serif"
                            : settings.arabicFont === "scheherazade"
                              ? "'Scheherazade New', serif"
                              : "'Traditional Arabic', sans-serif",
                        fontSize: `${Math.max(settings.arabicFontSize * 1.2, 1.4)}rem`,
                      }}
                    >
                      {surah.name}
                    </h3>

                    {/* English Name */}
                    <h4 className="text-lg font-semibold text-primary mb-1">
                      {surah.englishName}
                    </h4>

                    {/* Translation */}
                    <p className="text-sm text-foreground/70 mb-4">
                      {surah.englishNameTranslation}
                    </p>

                    {/* Ayahs Count */}
                    <div className="flex items-center justify-between pt-4 border-t border-primary/10">
                      <span className="text-xs text-foreground/60 font-mono">
                        {surah.numberOfAyahs} verses
                      </span>
                      <span className="text-xs text-primary font-semibold">
                        Read →
                      </span>
                    </div>
                  </div>
                </div>
              </Link>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}
