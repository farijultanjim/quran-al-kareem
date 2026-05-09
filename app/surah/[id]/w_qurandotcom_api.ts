"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";
import { Copy, Pause, Play } from "lucide-react";

import { useSettings } from "@/app/_context/SettingsContext";
import { Button } from "@/components/ui/Button";
import { AudioPlayer } from "@/components/AudioPlayer";

type QuranAudioSegment = [number, number, number, number];

interface QuranWord {
  id: number;
  position: number;
  audio_url: string | null;
  char_type_name: string;
  code_v1: string;
  text: string;
  translation?: { text?: string };
  transliteration?: { text?: string | null };
}

interface QuranVerse {
  id: number;
  verse_number: number;
  verse_key: string;
  text_uthmani: string;
  words: QuranWord[];
  translations?: Array<{ text?: string }>;
  audio?: { url?: string; segments?: QuranAudioSegment[] };
}

interface QuranChapter {
  id: number;
  revelation_place: string;
  name_simple: string;
  name_arabic: string;
  translated_name?: { name?: string };
}

interface Ayah {
  number: number;
  numberInSurah: number;
  verseKey: string;
  text: string;
  englishText: string;
  audio: string;
  words: QuranWord[];
  audioSegments: QuranAudioSegment[];
}

interface SurahDetail {
  number: number;
  name: string;
  englishName: string;
  englishNameTranslation: string;
  revelationType: string;
  ayahs: Ayah[];
}

const QURAN_API_BASE = "https://api.quran.com/api/v4";
const QURAN_AUDIO_BASE = "https://verses.quran.com/";
const TRANSLATION_ID = 20;
const QURAN_RECITER = "Alafasy";

function stripHtml(value: string) {
  return value
    .replace(/<[^>]+>/g, "")
    .replace(/\s+/g, " ")
    .trim();
}

function buildAudioUrl(path?: string) {
  if (!path) return "";
  return new URL(path.replace(/^\/+/, ""), QURAN_AUDIO_BASE).toString();
}

function buildFallbackAudioUrl(verseKey: string) {
  const [chapter, verse] = verseKey.split(":");
  const chapterNumber = chapter.padStart(3, "0");
  const verseNumber = verse.padStart(3, "0");

  return `${QURAN_AUDIO_BASE}${QURAN_RECITER}/mp3/${chapterNumber}${verseNumber}.mp3`;
}

function verseDuration(segments: QuranAudioSegment[]) {
  if (!segments.length) return 0;
  return (segments[segments.length - 1]?.[3] ?? 0) / 1000;
}

function wordIndexAtTime(segments: QuranAudioSegment[], seconds: number) {
  if (!segments.length) return null;

  const ms = seconds * 1000;
  for (const segment of segments) {
    const [wordIndex, , startMs, endMs] = segment;
    if (ms >= startMs && ms <= endMs) return wordIndex;
  }

  return segments[segments.length - 1]?.[0] ?? null;
}

export default function SurahPage() {
  const params = useParams();
  const surahId = params.id as string;
  const { settings } = useSettings();
  const audioRef = useRef<HTMLAudioElement | null>(null);

  const [surah, setSurah] = useState<SurahDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeAyahIndex, setActiveAyahIndex] = useState<number | null>(null);
  const [currentWordIndex, setCurrentWordIndex] = useState<number | null>(null);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [copiedAyah, setCopiedAyah] = useState<number | null>(null);
  const [ayahDurations, setAyahDurations] = useState<number[]>([]);

  useEffect(() => {
    let cancelled = false;

    const fetchSurah = async () => {
      try {
        setLoading(true);
        setError(null);
        setSurah(null);
        setActiveAyahIndex(null);
        setCurrentWordIndex(null);
        setCurrentTime(0);
        setDuration(0);
        setIsPlaying(false);
        setAyahDurations([]);

        audioRef.current?.pause();
        audioRef.current = null;

        const [chapterResponse, versesResponse] = await Promise.all([
          fetch(`${QURAN_API_BASE}/chapters/${surahId}`),
          fetch(
            `${QURAN_API_BASE}/verses/by_chapter/${surahId}?words=true&translations=${TRANSLATION_ID}&language=en&fields=text_uthmani,audio&recitation=7`,
          ),
        ]);

        if (!chapterResponse.ok)
          throw new Error(`Failed to load chapter ${surahId}`);
        if (!versesResponse.ok)
          throw new Error(`Failed to load verses for surah ${surahId}`);

        const chapterData = await chapterResponse.json();
        const versesData = await versesResponse.json();

        const chapter: QuranChapter | undefined =
          chapterData.chapter ??
          chapterData.chapters?.[0] ??
          chapterData.data?.chapter;
        const verses: QuranVerse[] =
          versesData.verses ?? versesData.data?.verses ?? [];

        if (!chapter || !verses.length)
          throw new Error("Surah data is incomplete");

        const ayahs: Ayah[] = verses.map((verse) => ({
          number: verse.id,
          numberInSurah: verse.verse_number,
          verseKey: verse.verse_key,
          text: verse.text_uthmani,
          englishText: stripHtml(verse.translations?.[0]?.text ?? ""),
          audio:
            buildAudioUrl(verse.audio?.url) ||
            buildFallbackAudioUrl(verse.verse_key),
          words: verse.words ?? [],
          audioSegments: verse.audio?.segments ?? [],
        }));

        if (cancelled) return;

        setSurah({
          number: chapter.id,
          name: chapter.name_arabic,
          englishName: chapter.name_simple,
          englishNameTranslation:
            chapter.translated_name?.name ?? chapter.name_simple,
          revelationType:
            chapter.revelation_place === "makkah" ? "Meccan" : "Medinan",
          ayahs,
        });
        setAyahDurations(
          ayahs.map((ayah) => verseDuration(ayah.audioSegments)),
        );
      } catch (loadError) {
        if (cancelled) return;
        console.error("Failed to load surah:", loadError);
        setError(
          loadError instanceof Error
            ? loadError.message
            : "Failed to load surah",
        );
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    void fetchSurah();

    return () => {
      cancelled = true;
      audioRef.current?.pause();
    };
  }, [surahId]);

  useEffect(() => {
    if (activeAyahIndex === null || !isPlaying) return;

    const element = document.getElementById(`ayah-${activeAyahIndex}`);
    element?.scrollIntoView({ behavior: "smooth", block: "center" });
  }, [activeAyahIndex, isPlaying]);

  const syncAudioState = (
    audio: HTMLAudioElement,
    ayahIndex: number,
    segments: QuranAudioSegment[],
  ) => {
    const update = () => {
      setCurrentTime(audio.currentTime);
      setDuration(
        Number.isFinite(audio.duration)
          ? audio.duration
          : verseDuration(segments),
      );
      setCurrentWordIndex(wordIndexAtTime(segments, audio.currentTime));
    };

    const onEnded = () => {
      setIsPlaying(false);
      setCurrentWordIndex(
        segments.length ? (segments[segments.length - 1]?.[0] ?? null) : null,
      );

      if (surah && ayahIndex < surah.ayahs.length - 1) {
        void playAyahAtIndex(ayahIndex + 1);
      }
    };

    audio.addEventListener("timeupdate", update);
    audio.addEventListener("loadedmetadata", update);
    audio.addEventListener("durationchange", update);
    audio.addEventListener("play", () => setIsPlaying(true));
    audio.addEventListener("pause", () => setIsPlaying(false));
    audio.addEventListener("ended", onEnded);
    audio.addEventListener("error", () => setIsPlaying(false));

    return () => {
      audio.removeEventListener("timeupdate", update);
      audio.removeEventListener("loadedmetadata", update);
      audio.removeEventListener("durationchange", update);
      audio.removeEventListener("ended", onEnded);
    };
  };

  const playAyahAtIndex = async (index: number, startAtSeconds = 0) => {
    if (!surah) return;

    const ayah = surah.ayahs[index];
    if (!ayah) return;

    // Resolve audio source, prefer existing ayah.audio but try fallback if empty
    let audioSrc = ayah.audio ?? "";
    if (!audioSrc || !audioSrc.trim()) {
      try {
        audioSrc = buildFallbackAudioUrl(ayah.verseKey);
      } catch (e) {
        console.error(
          "Failed to build fallback audio URL for",
          ayah.verseKey,
          e,
        );
        audioSrc = "";
      }
    }

    if (!audioSrc) {
      console.error("Missing audio source for ayah", ayah.verseKey);
      setError("Missing audio source for this verse");
      return;
    }

    if (activeAyahIndex === index && audioRef.current) {
      if (isPlaying) {
        audioRef.current.pause();
      } else {
        await audioRef.current.play();
      }
      return;
    }

    audioRef.current?.pause();

    const audio = new Audio();
    audio.src = audioSrc;
    console.debug("Using audio src:", audio.src, "for ayah", ayah.verseKey);
    audio.preload = "metadata";
    audio.load();
    audioRef.current = audio;

    setActiveAyahIndex(index);
    setCurrentTime(0);
    setDuration(0);
    setCurrentWordIndex(null);

    const detach = syncAudioState(audio, index, ayah.audioSegments);

    audio.addEventListener(
      "loadedmetadata",
      () => {
        if (startAtSeconds > 0) {
          audio.currentTime = Math.min(
            startAtSeconds,
            audio.duration || startAtSeconds,
          );
          setCurrentTime(audio.currentTime);
          setCurrentWordIndex(
            wordIndexAtTime(ayah.audioSegments, audio.currentTime),
          );
        }
      },
      { once: true },
    );

    try {
      await audio.play();
    } catch (playError) {
      detach();
      console.error("Failed to play audio:", playError);
    }
  };

  const handlePlayAudio = async (ayah: Ayah) => {
    if (!surah) return;
    const index = surah.ayahs.findIndex(
      (item) => item.numberInSurah === ayah.numberInSurah,
    );
    if (index >= 0) await playAyahAtIndex(index);
  };

  const handlePreviousAyah = async () => {
    if (!surah || activeAyahIndex === null) return;
    await playAyahAtIndex(Math.max(activeAyahIndex - 1, 0));
  };

  const handleNextAyah = async () => {
    if (!surah || activeAyahIndex === null) return;
    await playAyahAtIndex(
      Math.min(activeAyahIndex + 1, surah.ayahs.length - 1),
    );
  };

  const handleSeek = (seekTime: number) => {
    if (!surah || ayahDurations.length !== surah.ayahs.length) {
      if (!audioRef.current) return;
      audioRef.current.currentTime = seekTime;
      setCurrentTime(seekTime);
      return;
    }

    let remaining = seekTime;
    let targetIndex = 0;

    for (let i = 0; i < ayahDurations.length; i += 1) {
      const segment = ayahDurations[i] || 0;
      if (remaining <= segment || i === ayahDurations.length - 1) {
        targetIndex = i;
        break;
      }
      remaining -= segment;
    }

    if (activeAyahIndex === targetIndex && audioRef.current) {
      audioRef.current.currentTime = remaining;
      setCurrentTime(remaining);
      setCurrentWordIndex(
        wordIndexAtTime(surah.ayahs[targetIndex].audioSegments, remaining),
      );
      return;
    }

    void playAyahAtIndex(targetIndex, remaining);
  };

  const handleClosePlayer = () => {
    audioRef.current?.pause();
    audioRef.current = null;
    setActiveAyahIndex(null);
    setCurrentWordIndex(null);
    setCurrentTime(0);
    setDuration(0);
    setIsPlaying(false);
  };

  const activeAyah =
    activeAyahIndex !== null ? surah?.ayahs[activeAyahIndex] : null;
  const completedAyahDuration =
    activeAyahIndex !== null
      ? ayahDurations
          .slice(0, activeAyahIndex)
          .reduce((sum, value) => sum + value, 0)
      : 0;
  const effectiveCurrentAyahDuration =
    activeAyahIndex !== null ? ayahDurations[activeAyahIndex] || duration : 0;
  const surahTotalDuration = ayahDurations.reduce(
    (sum, value) => sum + value,
    0,
  );
  const surahCurrentTime =
    completedAyahDuration +
    Math.min(currentTime, effectiveCurrentAyahDuration || currentTime);
  const surahProgress =
    surahTotalDuration > 0 ? (surahCurrentTime / surahTotalDuration) * 100 : 0;

  const handleCopyAyah = async (ayah: Ayah) => {
    const textToCopy = [
      `${surah?.number}:${ayah.numberInSurah}`,
      ayah.text,
      ayah.englishText,
    ]
      .filter(Boolean)
      .join("\n\n");

    try {
      await navigator.clipboard.writeText(textToCopy);
      setCopiedAyah(ayah.numberInSurah);
      window.setTimeout(
        () =>
          setCopiedAyah((current) =>
            current === ayah.numberInSurah ? null : current,
          ),
        1200,
      );
    } catch (copyError) {
      console.error("Failed to copy ayah:", copyError);
    }
  };

  useEffect(() => {
    return () => {
      audioRef.current?.pause();
    };
  }, []);

  if (loading) {
    return (
      <main className="min-h-screen bg-background px-4 mt-10">
        <div className="w-full max-w-none mx-auto">
          <div className="space-y-8">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="space-y-4">
                <div className="h-12 rounded-lg bg-foreground/10 animate-pulse" />
                <div className="space-y-2">
                  <div className="h-8 rounded-lg bg-foreground/10 animate-pulse w-4/5" />
                  <div className="h-8 rounded-lg bg-foreground/10 animate-pulse w-3/5" />
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
      <main className="min-h-screen bg-background px-4">
        <div className="w-full max-w-none mx-auto text-center">
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
      transition: { staggerChildren: 0.1, delayChildren: 0.2 },
    },
  };

  const itemVariants = {
    initial: { opacity: 0, y: 20 },
    animate: { opacity: 1, y: 0, transition: { duration: 0.5 } },
  };

  return (
    <>
      <main className="min-h-screen bg-background pb-28 mt-10">
        <div className="w-full max-w-none mx-auto">
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="mb-12"
          >
            <div className="text-center mb-8">
              <h1
                className="text-3xl md:text-4xl text-right mb-10 leading-tight px-8"
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

              <h2 className="text-2xl md:text-3xl font-semibold text-primary mb-1">
                {surah.englishName}
              </h2>
              <p className="text-lg text-foreground/80 mb-1">
                {surah.englishNameTranslation}
              </p>
              <div className="flex items-center justify-center gap-3 text-xs text-foreground/40 text-center">
                <p>Surah {surah.number},</p>
                <p>{surah.revelationType}</p>
              </div>
            </div>
          </motion.div>

          <motion.div
            variants={containerVariants}
            initial="initial"
            animate="animate"
            className="border-b border-border"
          >
            {surah.ayahs.map((ayah, index) => {
              const words = ayah.words.filter(
                (word) => word.char_type_name === "word",
              );

              return (
                <motion.div
                  id={`ayah-${index}`}
                  key={ayah.numberInSurah}
                  variants={itemVariants}
                  className={`p-6 border-b border-border transition-colors ${activeAyahIndex === index && isPlaying ? "bg-primary/15" : ""}`}
                >
                  <div className="flex flex-col lg:flex-row justify-between gap-3 p-4">
                    <div className="flex items-center gap-2 lg:flex-col lg:items-center lg:gap-4">
                      <span className="text-primary tracking-wide text-sm">
                        {surah.number}:{ayah.numberInSurah}
                      </span>

                      <button
                        aria-label={
                          activeAyahIndex === index && isPlaying
                            ? "Pause audio"
                            : "Play audio"
                        }
                        onClick={() => handlePlayAudio(ayah)}
                        className="text-foreground/60 p-2 rounded-full hover:bg-primary/10 transition-colors cursor-pointer"
                      >
                        {activeAyahIndex === index && isPlaying ? (
                          <Pause className="w-4 h-4" />
                        ) : (
                          <Play className="w-4 h-4" />
                        )}
                      </button>

                      <button
                        aria-label="Copy ayah"
                        onClick={() => handleCopyAyah(ayah)}
                        className="text-foreground/60 p-2 rounded-full hover:bg-primary/10 transition-colors cursor-pointer"
                      >
                        {copiedAyah === ayah.numberInSurah ? (
                          <span className="text-xs font-bold">✓</span>
                        ) : (
                          <Copy className="w-4 h-4" />
                        )}
                      </button>
                    </div>

                    <div>
                      <div
                        className="text-right mb-4 py-4 lg:pl-4 leading-loose"
                        dir="rtl"
                        lang="ar"
                        style={{
                          fontFamily:
                            settings.arabicFont === "amiri"
                              ? "'Amiri', serif"
                              : settings.arabicFont === "scheherazade"
                                ? "'Scheherazade New', serif"
                                : "'Traditional Arabic', sans-serif",
                          fontSize: `${settings.arabicFontSize}rem`,
                          lineHeight: 2,
                          whiteSpace: "pre-wrap",
                          unicodeBidi: "plaintext",
                          textRendering: "optimizeLegibility",
                        }}
                      >
                        {ayah.text}
                      </div>

                      {activeAyahIndex === index &&
                      currentWordIndex !== null ? (
                        <div className="mb-2 flex justify-end">
                          {(() => {
                            const activeWord = words[currentWordIndex];

                            if (!activeWord) return null;

                            return (
                              <div className="rounded-full border border-primary/20 bg-primary/10 px-3 py-1 text-xs text-primary">
                                {activeWord.transliteration?.text ??
                                  activeWord.translation?.text ??
                                  activeWord.text}
                              </div>
                            );
                          })()}
                        </div>
                      ) : null}

                      <div
                        className="text-justify lg:text-left py-4 lg:pl-4"
                        style={{
                          fontSize: `${settings.translationFontSize}rem`,
                          lineHeight: 1.8,
                        }}
                      >
                        <p className="text-foreground/75">{ayah.englishText}</p>
                      </div>
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </motion.div>

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

      <AudioPlayer
        visible={Boolean(activeAyah)}
        title={
          activeAyah ? `${surah.englishName} : ${activeAyah.numberInSurah}` : ""
        }
        currentTime={surahTotalDuration > 0 ? surahCurrentTime : currentTime}
        duration={surahTotalDuration > 0 ? surahTotalDuration : duration}
        isPlaying={isPlaying}
        progress={
          surahTotalDuration > 0
            ? surahProgress
            : duration > 0
              ? (currentTime / duration) * 100
              : 0
        }
        onPlayPause={() => {
          if (!audioRef.current) return;
          if (isPlaying) {
            audioRef.current.pause();
          } else {
            void audioRef.current.play();
          }
        }}
        onPrevious={
          activeAyahIndex !== null && activeAyahIndex > 0
            ? handlePreviousAyah
            : undefined
        }
        onNext={
          activeAyahIndex !== null &&
          activeAyahIndex < (surah?.ayahs.length ?? 0) - 1
            ? handleNextAyah
            : undefined
        }
        onClose={handleClosePlayer}
        onSeek={handleSeek}
      />
    </>
  );
}
