"use client";

import { useState, useEffect, useRef, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Search, X } from "lucide-react";
import Link from "next/link";
import { useSettings } from "@/app/_context/SettingsContext";
import { useLenis } from "@/lib/lenis";

interface SearchSurah {
  number: number;
  name: string;
  englishName: string;
  englishNameTranslation: string;
  revelationType: string;
  numberOfAyahs: number;
}

interface SearchAyah {
  surahNumber: number;
  surahName: string;
  surahEnglishName: string;
  ayahNumber: number;
  text: string;
  translation: string;
}

interface SearchModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function SearchModal({ open, onOpenChange }: SearchModalProps) {
  const { settings } = useSettings();
  const lenis = useLenis();
  const [query, setQuery] = useState("");
  const [debouncedQuery, setDebouncedQuery] = useState("");
  const [allSurahs, setAllSurahs] = useState<SearchSurah[]>([]);
  const [allAyahs, setAllAyahs] = useState<SearchAyah[]>([]);
  const hasFetchedRef = useRef(false);
  const debounceTimerRef = useRef<ReturnType<typeof setTimeout> | undefined>(
    undefined,
  );

  // Debounce the search query
  useEffect(() => {
    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current);
    }

    debounceTimerRef.current = setTimeout(() => {
      setDebouncedQuery(query);
    }, 300); // Wait 300ms after user stops typing

    return () => {
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current);
      }
    };
  }, [query]);

  // Fetch all surahs and ayahs on component mount
  useEffect(() => {
    if (!open || hasFetchedRef.current) return;

    async function fetchData() {
      try {
        // Fetch Arabic and English translations in parallel
        const [arabicRes, englishRes] = await Promise.all([
          fetch("https://api.alquran.cloud/v1/quran/quran-uthmani"),
          fetch("https://api.alquran.cloud/v1/quran/en.asad"),
        ]);

        const arabicData = await arabicRes.json();
        const englishData = await englishRes.json();

        // Process Surahs
        const surahs = arabicData.data.surahs.map((surah: SearchSurah) => ({
          number: surah.number,
          name: surah.name,
          englishName: surah.englishName,
          englishNameTranslation: surah.englishNameTranslation,
          revelationType: surah.revelationType,
          numberOfAyahs: surah.numberOfAyahs,
        }));

        // Process Ayahs with translations
        const ayahs: SearchAyah[] = [];
        arabicData.data.surahs.forEach((surah: any) => {
          const englishSurah = englishData.data.surahs.find(
            (s: any) => s.number === surah.number,
          );

          surah.ayahs.forEach((ayah: any, index: number) => {
            const englishAyah = englishSurah?.ayahs[index];
            ayahs.push({
              surahNumber: surah.number,
              surahName: surah.name,
              surahEnglishName: surah.englishName,
              ayahNumber: ayah.numberInSurah,
              text: ayah.text,
              translation: englishAyah?.text || "",
            });
          });
        });

        setAllSurahs(surahs);
        setAllAyahs(ayahs);
        hasFetchedRef.current = true;
      } catch (err) {
        console.error("Failed to fetch data:", err);
      }
    }

    fetchData();
  }, [open]);

  // Calculate results for both surahs and ayahs
  const results = useMemo(() => {
    if (!debouncedQuery.trim()) return { surahs: [], ayahs: [] };

    const lowerQuery = debouncedQuery.toLowerCase();

    // Search surahs
    const surahResults = allSurahs.filter((surah) => {
      const numberMatch = surah.number.toString().includes(lowerQuery);
      const englishNameMatch = surah.englishName
        .toLowerCase()
        .includes(lowerQuery);
      const translationMatch = surah.englishNameTranslation
        .toLowerCase()
        .includes(lowerQuery);

      return numberMatch || englishNameMatch || translationMatch;
    });

    // Search ayahs by translation text - limit to 50 results for performance
    const ayahResults = allAyahs
      .filter((ayah) => {
        return (
          ayah.translation.toLowerCase().includes(lowerQuery) ||
          ayah.text.toLowerCase().includes(lowerQuery)
        );
      })
      .slice(0, 50); // Limit to 50 results

    return { surahs: surahResults, ayahs: ayahResults };
  }, [debouncedQuery, allSurahs, allAyahs]);

  // Close on escape key
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape" && open) {
        onOpenChange(false);
      }
    };

    window.addEventListener("keydown", handleEscape);
    return () => window.removeEventListener("keydown", handleEscape);
  }, [open, onOpenChange]);

  // Stop Lenis when modal is open so the background page doesn't scroll
  useEffect(() => {
    if (!lenis) return;
    if (open) {
      lenis.stop();
      return () => lenis.start();
    }
  }, [open, lenis]);

  return (
    <AnimatePresence>
      {open && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => onOpenChange(false)}
            className="fixed inset-0 z-40 bg-black/50 backdrop-blur-sm"
          />

          {/* Modal */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: -20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: -20 }}
            transition={{ duration: 0.2 }}
            className="fixed top-20 left-1/2 right-4 md:right-auto z-50 w-full md:w-175 -translate-x-1/2 md:left-1/2"
          >
            <div className="bg-background/95 backdrop-blur-xl rounded-2xl border border-primary/20 shadow-2xl overflow-hidden">
              {/* Search Input */}
              <div className="relative p-4 md:p-6 border-b border-primary/10">
                <div className="flex items-center gap-3">
                  <Search className="w-5 h-5 text-primary/60 shrink-0" />
                  <input
                    type="text"
                    placeholder="Search Surahs, verses by name, number, or text..."
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    autoFocus
                    className="flex-1 bg-transparent text-foreground placeholder-foreground/40 outline-none text-lg"
                  />
                  {query && debouncedQuery !== query && (
                    <motion.div
                      animate={{ rotate: 360 }}
                      transition={{ duration: 1, repeat: Infinity }}
                      className="w-5 h-5 border-2 border-primary/30 border-t-primary rounded-full flex-shrink-0"
                    />
                  )}
                  {query && debouncedQuery === query && (
                    <motion.button
                      initial={{ opacity: 0, scale: 0.8 }}
                      animate={{ opacity: 1, scale: 1 }}
                      onClick={() => setQuery("")}
                      className="p-1 hover:bg-primary/10 rounded-lg transition-colors"
                    >
                      <X className="w-5 h-5 text-foreground/60" />
                    </motion.button>
                  )}
                </div>
              </div>

              {/* Results */}
              <div className="max-h-[60vh] overflow-y-auto overscroll-contain" data-lenis-prevent>
                {query &&
                results.surahs.length === 0 &&
                results.ayahs.length === 0 ? (
                  <div className="p-8 text-center">
                    <p className="text-foreground/60">
                      No results found matching &quot;{query}&quot;
                    </p>
                  </div>
                ) : results.surahs.length > 0 || results.ayahs.length > 0 ? (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ staggerChildren: 0.02 }}
                  >
                    {/* Surahs Section */}
                    {results.surahs.length > 0 && (
                      <>
                        <div className="px-4 md:px-6 py-3 sticky top-0 bg-primary/5 border-b border-primary/10">
                          <p className="text-xs font-semibold text-primary/60 uppercase tracking-wide">
                            Surahs ({results.surahs.length})
                          </p>
                        </div>
                        {results.surahs.map((surah, index) => (
                          <motion.div
                            key={`surah-${surah.number}`}
                            initial={{ opacity: 0, x: -10 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: index * 0.01 }}
                          >
                            <Link href={`/surah/${surah.number}`}>
                              <motion.button
                                onClick={() => {
                                  onOpenChange(false);
                                  setQuery("");
                                }}
                                whileHover={{ x: 4 }}
                                className="w-full px-4 md:px-6 py-4 text-left hover:bg-primary/5 border-b border-primary/5 transition-colors group"
                              >
                                <div className="flex items-start justify-between gap-4">
                                  <div className="flex-1 min-w-0">
                                    <div className="flex items-center gap-3 mb-2">
                                      <span className="text-sm font-mono text-primary/60 flex-shrink-0">
                                        {surah.number}
                                      </span>
                                      <h3 className="font-bold text-foreground text-lg truncate">
                                        {surah.englishName}
                                      </h3>
                                      <span className="text-xs px-2 py-1 rounded-lg bg-primary/20 text-primary font-medium flex-shrink-0">
                                        {surah.revelationType}
                                      </span>
                                    </div>

                                    {/* Arabic Name */}
                                    <p
                                      className="text-right mb-1 truncate"
                                      style={{
                                        fontFamily:
                                          settings.arabicFont === "amiri"
                                            ? "'Amiri', serif"
                                            : settings.arabicFont ===
                                                "scheherazade"
                                              ? "'Scheherazade New', serif"
                                              : "'Traditional Arabic', sans-serif",
                                        fontSize: "1rem",
                                        color: "rgb(29, 80, 58)",
                                      }}
                                    >
                                      {surah.name}
                                    </p>

                                    <p className="text-sm text-foreground/60 truncate">
                                      {surah.englishNameTranslation} •{" "}
                                      {surah.numberOfAyahs} verses
                                    </p>
                                  </div>

                                  <div className="text-primary/40 group-hover:text-primary/60 transition-colors flex-shrink-0">
                                    →
                                  </div>
                                </div>
                              </motion.button>
                            </Link>
                          </motion.div>
                        ))}
                      </>
                    )}

                    {/* Ayahs Section */}
                    {results.ayahs.length > 0 && (
                      <>
                        <div className="px-4 md:px-6 py-3 sticky top-0 bg-background border-b border-primary/10">
                          <p className="text-xs font-semibold text-primary/60 uppercase tracking-wide">
                            Verses ({results.ayahs.length}
                            {results.ayahs.length === 50 && "+"}){" "}
                            {results.ayahs.length === 50 && (
                              <span className="text-primary/50 normal-case">
                                - showing first 50
                              </span>
                            )}
                          </p>
                        </div>
                        {results.ayahs.map((ayah, index) => (
                          <motion.div
                            key={`ayah-${ayah.surahNumber}-${ayah.ayahNumber}`}
                            initial={{ opacity: 0, x: -10 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: index * 0.01 }}
                          >
                            <Link href={`/surah/${ayah.surahNumber}`}>
                              <motion.button
                                onClick={() => {
                                  onOpenChange(false);
                                  setQuery("");
                                }}
                                whileHover={{ x: 4 }}
                                className="w-full px-4 md:px-6 py-4 text-left hover:bg-primary/5 border-b border-primary/5 last:border-0 transition-colors group"
                              >
                                <div className="flex items-start justify-between gap-4">
                                  <div className="flex-1 min-w-0">
                                    <div className="flex items-center gap-2 mb-2">
                                      <span className="text-xs font-mono text-primary/60 flex-shrink-0">
                                        {ayah.surahNumber}:{ayah.ayahNumber}
                                      </span>
                                      <span className="text-sm font-semibold text-primary">
                                        {ayah.surahEnglishName}
                                      </span>
                                    </div>

                                    {/* Arabic Text */}
                                    <p
                                      className="text-right mb-2 line-clamp-2"
                                      style={{
                                        fontFamily:
                                          settings.arabicFont === "amiri"
                                            ? "'Amiri', serif"
                                            : settings.arabicFont ===
                                                "scheherazade"
                                              ? "'Scheherazade New', serif"
                                              : "'Traditional Arabic', sans-serif",
                                        fontSize: "0.95rem",
                                        color: "rgb(29, 80, 58)",
                                      }}
                                    >
                                      {ayah.text}
                                    </p>

                                    {/* Translation */}
                                    <p className="text-sm text-foreground/70 line-clamp-2">
                                      {ayah.translation}
                                    </p>
                                  </div>

                                  <div className="text-primary/40 group-hover:text-primary/60 transition-colors flex-shrink-0 mt-1">
                                    →
                                  </div>
                                </div>
                              </motion.button>
                            </Link>
                          </motion.div>
                        ))}
                      </>
                    )}
                  </motion.div>
                ) : null}
              </div>

              {/* Footer Info */}
              {!query && (
                <div className="p-4 md:p-6 border-t border-primary/10 bg-primary/5">
                  <p className="text-xs text-foreground/60 text-center">
                    Search by Surah name, number, or verse text (wait 300ms for
                    results)
                  </p>
                </div>
              )}
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
