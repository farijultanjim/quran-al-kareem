"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowLeft } from "lucide-react";
import { useSettings } from "@/app/_context/SettingsContext";
import { Button } from "@/components/Button";

interface Ayah {
  number: number;
  text: string;
  numberInSurah: number;
  englishText?: string;
}

interface SurahDetail {
  number: number;
  name: string;
  englishName: string;
  englishNameTranslation: string;
  revelationType: string;
  ayahs: Ayah[];
}

export default function SurahPage() {
  const params = useParams();
  const surahId = params.id as string;
  const { settings } = useSettings();
  const [surah, setSurah] = useState<SurahDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchSurahDetail() {
      try {
        const [arabicRes, englishRes] = await Promise.all([
          fetch("https://api.alquran.cloud/v1/quran/quran-uthmani"),
          fetch("https://api.alquran.cloud/v1/quran/en.asad"),
        ]);

        if (!arabicRes.ok || !englishRes.ok) {
          throw new Error("Failed to fetch Surah data");
        }

        const arabicData = await arabicRes.json();
        const englishData = await englishRes.json();

        const surahNum = parseInt(surahId);
        const arabicSurah = arabicData.data.surahs[surahNum - 1];
        const englishSurah = englishData.data.surahs[surahNum - 1];

        if (!arabicSurah || !englishSurah) {
          throw new Error("Surah not found");
        }

        // Merge ayahs with translations
        const ayahs = arabicSurah.ayahs.map((ayah: any, index: number) => ({
          ...ayah,
          englishText: englishSurah.ayahs[index]?.text || "",
        }));

        setSurah({
          number: arabicSurah.number,
          name: arabicSurah.name,
          englishName: arabicSurah.englishName,
          englishNameTranslation: arabicSurah.englishNameTranslation,
          revelationType: arabicSurah.revelationType,
          ayahs,
        });

        setLoading(false);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to load Surah");
        setLoading(false);
      }
    }

    fetchSurahDetail();
  }, [surahId]);

  if (loading) {
    return (
      <main className="min-h-screen bg-background pt-32 px-4">
        <div className="max-w-4xl mx-auto">
          <div className="space-y-8">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="space-y-4">
                <div className="h-12 rounded-lg bg-primary/10 animate-pulse" />
                <div className="space-y-2">
                  <div className="h-8 rounded-lg bg-primary/10 animate-pulse w-4/5" />
                  <div className="h-8 rounded-lg bg-primary/10 animate-pulse w-3/5" />
                </div>
              </div>
            ))}
          </div>
        </div>
      </main>
    );
  }

  if (error || !surah) {
    return (
      <main className="min-h-screen bg-background pt-32 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <p className="text-foreground/60 mb-6">
            Error: {error || "Surah not found"}
          </p>
          <Link href="/">
            <Button variant="outlined">← Back to Home</Button>
          </Link>
        </div>
      </main>
    );
  }

  const containerVariants = {
    initial: { opacity: 0 },
    animate: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
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

  return (
    <main className="min-h-screen bg-background pt-32 pb-20 px-4">
      <div className="max-w-4xl mx-auto">
        {/* Header with Back Button */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="mb-12"
        >
          <Link href="/" className="inline-block mb-8">
            <Button variant="icon">
              <ArrowLeft className="w-5 h-5" />
            </Button>
          </Link>

          <div className="text-center mb-8">
            {/* Surah Number and Type */}
            <div className="flex items-center justify-center gap-4 mb-4">
              <span className="px-3 py-1 rounded-lg bg-primary/20 text-primary font-mono text-sm">
                Surah {surah.number}
              </span>
              <span className="px-3 py-1 rounded-lg bg-primary/10 text-primary font-mono text-sm">
                {surah.revelationType}
              </span>
            </div>

            {/* Arabic Name */}
            <h1
              className="text-4xl md:text-5xl font-bold text-right mb-3 leading-tight"
              style={{
                fontFamily:
                  settings.arabicFont === "amiri"
                    ? "'Amiri', serif"
                    : settings.arabicFont === "scheherazade"
                      ? "'Scheherazade New', serif"
                      : "'Traditional Arabic', sans-serif",
                fontSize: `${Math.max(settings.arabicFontSize * 1.8, 2.2)}rem`,
              }}
            >
              {surah.name}
            </h1>

            {/* English Name */}
            <h2 className="text-2xl md:text-3xl font-bold text-primary mb-2">
              {surah.englishName}
            </h2>

            {/* Translation */}
            <p className="text-lg text-foreground/70">
              {surah.englishNameTranslation}
            </p>
          </div>
        </motion.div>

        {/* Ayahs */}
        <motion.div
          variants={containerVariants}
          initial="initial"
          animate="animate"
          className="space-y-8"
        >
          {surah.ayahs.map((ayah, index) => (
            <motion.div
              key={ayah.numberInSurah}
              variants={itemVariants}
              className="p-6 rounded-xl bg-gradient-to-br from-primary/10 to-primary/5 backdrop-blur-sm border border-primary/20 hover:border-primary/40 transition-all"
            >
              {/* Ayah Number */}
              <div className="flex items-center justify-between mb-4">
                <span className="px-3 py-1 rounded-lg bg-primary/20 text-primary font-mono text-sm font-bold">
                  {surah.number}:{ayah.numberInSurah}
                </span>
              </div>

              {/* Arabic Text */}
              <div
                className="text-right mb-6 p-4 rounded-lg bg-background/50 border border-primary/10"
                style={{
                  fontFamily:
                    settings.arabicFont === "amiri"
                      ? "'Amiri', serif"
                      : settings.arabicFont === "scheherazade"
                        ? "'Scheherazade New', serif"
                        : "'Traditional Arabic', sans-serif",
                  fontSize: `${settings.arabicFontSize}rem`,
                  lineHeight: 2,
                }}
              >
                {ayah.text}
              </div>

              {/* English Translation */}
              <div
                className="text-left mb-4 p-4 rounded-lg bg-background/30"
                style={{
                  fontSize: `${settings.translationFontSize}rem`,
                  lineHeight: 1.8,
                }}
              >
                <p className="text-foreground/75">{ayah.englishText}</p>
              </div>
            </motion.div>
          ))}
        </motion.div>

        {/* Back to top button */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="mt-12 flex justify-center"
        >
          <Link href="/">
            <Button variant="outlined">← Back to Surahs</Button>
          </Link>
        </motion.div>
      </div>
    </main>
  );
}
