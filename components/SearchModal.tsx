"use client";

import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Search, X } from "lucide-react";
import Link from "next/link";
import { useSettings } from "@/app/_context/SettingsContext";

interface SearchSurah {
  number: number;
  name: string;
  englishName: string;
  englishNameTranslation: string;
  revelationType: string;
  numberOfAyahs: number;
}

interface SearchModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function SearchModal({ open, onOpenChange }: SearchModalProps) {
  const { settings } = useSettings();
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<SearchSurah[]>([]);
  const [allSurahs, setAllSurahs] = useState<SearchSurah[]>([]);
  const hasFetchedRef = useRef(false);

  // Fetch all surahs on component mount
  useEffect(() => {
    if (!open || hasFetchedRef.current) return;

    async function fetchSurahs() {
      try {
        const response = await fetch(
          "https://api.alquran.cloud/v1/quran/quran-uthmani",
        );
        const data = await response.json();
        interface ApiSurah extends SearchSurah {
          ayahs: { length: number };
        }
        const surahs = data.data.surahs.map((surah: ApiSurah) => ({
          number: surah.number,
          name: surah.name,
          englishName: surah.englishName,
          englishNameTranslation: surah.englishNameTranslation,
          revelationType: surah.revelationType,
          numberOfAyahs: surah.ayahs.length,
        }));
        setAllSurahs(surahs);
        hasFetchedRef.current = true;
      } catch (err) {
        console.error("Failed to fetch surahs:", err);
      }
    }

    fetchSurahs();
  }, [open]);

  // Handle search
  useEffect(() => {
    if (!query.trim()) {
      setResults([]);
      return;
    }

    const lowerQuery = query.toLowerCase();

    const filtered = allSurahs.filter((surah) => {
      const numberMatch = surah.number.toString().includes(lowerQuery);
      const englishNameMatch = surah.englishName
        .toLowerCase()
        .includes(lowerQuery);
      const translationMatch = surah.englishNameTranslation
        .toLowerCase()
        .includes(lowerQuery);

      return numberMatch || englishNameMatch || translationMatch;
    });

    setResults(filtered);
  }, [query, allSurahs]);

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
            className="fixed top-20 left-1/2 right-4 md:right-auto z-50 w-full md:w-[500px] -translate-x-1/2 md:translate-x-0 md:left-1/2 md:-translate-x-1/2"
          >
            <div className="bg-background/95 backdrop-blur-xl rounded-2xl border border-primary/20 shadow-2xl overflow-hidden">
              {/* Search Input */}
              <div className="relative p-4 md:p-6 border-b border-primary/10">
                <div className="flex items-center gap-3">
                  <Search className="w-5 h-5 text-primary/60 flex-shrink-0" />
                  <input
                    type="text"
                    placeholder="Search Surahs by name or number..."
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    autoFocus
                    className="flex-1 bg-transparent text-foreground placeholder-foreground/40 outline-none text-lg"
                  />
                  {query && (
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
              <div className="max-h-[60vh] overflow-y-auto">
                {loading ? (
                  <div className="flex items-center justify-center py-12">
                    <div className="w-6 h-6 border-2 border-primary/30 border-t-primary rounded-full animate-spin" />
                  </div>
                ) : query && results.length === 0 ? (
                  <div className="p-8 text-center">
                    <p className="text-foreground/60">
                      No Surahs found matching &quot;{query}&quot;
                    </p>
                  </div>
                ) : results.length > 0 ? (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ staggerChildren: 0.05 }}
                  >
                    {results.map((surah, index) => (
                      <motion.div
                        key={surah.number}
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: index * 0.02 }}
                      >
                        <Link href={`/surah/${surah.number}`}>
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
                                        : settings.arabicFont === "scheherazade"
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
                  </motion.div>
                ) : null}
              </div>

              {/* Footer Info */}
              {!query && (
                <div className="p-4 md:p-6 border-t border-primary/10 bg-primary/5">
                  <p className="text-xs text-foreground/60 text-center">
                    Start typing to search for Surahs by name or number
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
