"use client";

import { useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";
import { Copy, Pause, Play } from "lucide-react";
import { useSettings } from "@/app/_context/SettingsContext";
import { Button } from "@/components/ui/Button";
import { AudioPlayer } from "@/components/AudioPlayer";

interface Ayah {
  number: number;
  text: string;
  audio: string;
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

export default function SurahClient({ surah }: { surah: SurahDetail }) {
  const { settings } = useSettings();
  const [activeAyahIndex, setActiveAyahIndex] = useState<number | null>(null);
  const [ayahDurations, setAyahDurations] = useState<number[]>([]);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [copiedAyah, setCopiedAyah] = useState<number | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    const getAudioDuration = (url: string) =>
      new Promise<number>((resolve) => {
        const audio = new Audio();
        audio.preload = "metadata";

        const cleanup = () => {
          audio.removeEventListener("loadedmetadata", onLoaded);
          audio.removeEventListener("error", onError);
        };

        const onLoaded = () => {
          const audioDuration = Number.isFinite(audio.duration)
            ? audio.duration
            : 0;
          cleanup();
          resolve(audioDuration);
        };

        const onError = () => {
          cleanup();
          resolve(0);
        };

        audio.addEventListener("loadedmetadata", onLoaded);
        audio.addEventListener("error", onError);
        audio.src = url;
      });

    let cancelled = false;

    const loadDurations = async () => {
      if (!surah) return;
      const durations = await Promise.all(
        surah.ayahs.map((ayah) => getAudioDuration(ayah.audio)),
      );
      if (!cancelled) {
        setAyahDurations(durations);
      }
    };

    void loadDurations();

    return () => {
      cancelled = true;
    };
  }, [surah]);

  useEffect(() => {
    return () => {
      audioRef.current?.pause();
      audioRef.current = null;
    };
  }, []);

  useEffect(() => {
    if (activeAyahIndex !== null) {
      const ayahElement = document.getElementById(`ayah-${activeAyahIndex}`);

      if (ayahElement) {
        ayahElement.scrollIntoView({ behavior: "smooth", block: "center" });
      }
    }
  }, [activeAyahIndex]);

  const syncAudioState = (audio: HTMLAudioElement, ayahIndex: number) => {
    const updateProgress = () => {
      setCurrentTime(audio.currentTime);
      setDuration(audio.duration || 0);

      if (audio.duration > 0) {
        setAyahDurations((current) => {
          if (current[ayahIndex] === audio.duration) return current;
          const next = [...current];
          next[ayahIndex] = audio.duration;
          return next;
        });
      }
    };

    audio.addEventListener("timeupdate", updateProgress);
    audio.addEventListener("loadedmetadata", updateProgress);
    audio.addEventListener("durationchange", updateProgress);

    audio.onplay = () => setIsPlaying(true);
    audio.onpause = () => setIsPlaying(false);
    audio.onended = () => {
      setIsPlaying(false);

      if (surah && ayahIndex < surah.ayahs.length - 1) {
        void playAyahAtIndex(ayahIndex + 1);
        return;
      }

      const endTime = Number.isFinite(audio.duration)
        ? audio.duration
        : currentTime;
      setDuration(endTime);
      setCurrentTime(endTime);
    };
    audio.onerror = () => {
      setIsPlaying(false);
    };

    return () => {
      audio.removeEventListener("timeupdate", updateProgress);
      audio.removeEventListener("loadedmetadata", updateProgress);
      audio.removeEventListener("durationchange", updateProgress);
    };
  };

  const playAyahAtIndex = async (index: number, startAtSeconds = 0) => {
    const ayah = surah?.ayahs[index];
    if (!ayah?.audio) return;

    try {
      if (activeAyahIndex === index && audioRef.current) {
        if (isPlaying) {
          audioRef.current.pause();
        } else {
          await audioRef.current.play();
        }
        return;
      }

      audioRef.current?.pause();

      const audio = new Audio(ayah.audio);
      audioRef.current = audio;
      setActiveAyahIndex(index);
      setCurrentTime(0);
      setDuration(0);

      if (startAtSeconds > 0) {
        audio.addEventListener(
          "loadedmetadata",
          () => {
            const seekTarget = Math.min(
              startAtSeconds,
              audio.duration || startAtSeconds,
            );
            audio.currentTime = seekTarget;
            setCurrentTime(seekTarget);
          },
          { once: true },
        );
      }

      const cleanup = syncAudioState(audio, index);
      await audio.play();

      audio.addEventListener("ended", cleanup, { once: true });
    } catch (playError) {
      console.error("Failed to play audio:", playError);
      setIsPlaying(false);
    }
  };

  const handlePlayAudio = async (ayah: Ayah) => {
    if (!surah) return;
    const index = surah.ayahs.findIndex(
      (item) => item.numberInSurah === ayah.numberInSurah,
    );
    if (index >= 0) {
      await playAyahAtIndex(index);
    }
  };

  const handlePreviousAyah = async () => {
    if (!surah || activeAyahIndex === null) return;
    const previousIndex = Math.max(activeAyahIndex - 1, 0);
    await playAyahAtIndex(previousIndex);
  };

  const handleNextAyah = async () => {
    if (!surah || activeAyahIndex === null) return;
    const nextIndex = Math.min(activeAyahIndex + 1, surah.ayahs.length - 1);
    await playAyahAtIndex(nextIndex);
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
      return;
    }

    void playAyahAtIndex(targetIndex, remaining);
  };

  const handleClosePlayer = () => {
    audioRef.current?.pause();
    audioRef.current = null;
    setActiveAyahIndex(null);
    setCurrentTime(0);
    setDuration(0);
    setIsPlaying(false);
  };

  const activeAyah =
    activeAyahIndex !== null ? surah?.ayahs[activeAyahIndex] : null;

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

  return (
    <>
      <main className="min-h-screen bg-background pb-28 mt-10">
        <div className="w-full max-w-none mx-auto">
          {/* Header with Back Button */}
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="mb-12"
          >
            <div className="text-center mb-8 ">
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

              <h2 className="text-2xl md:text-3xl font-semibold text-primary mb-">
                {surah.englishName}
              </h2>
              <p className="text-lg text-foreground/80 mb-1">
                {surah.englishNameTranslation}
              </p>
              <div className="flex items-center justify-center gap-3 text-xs text-foreground/40 text-center">
                <p> Surah {surah.number},</p>
                <p>{surah.revelationType}</p>
              </div>
            </div>
          </motion.div>

          <motion.div className=" border-b border-border ">
            {surah.ayahs.map((ayah, index) => (
              <motion.div
                id={`ayah-${index}`}
                key={ayah.numberInSurah}
                className={`p-6 border-b border-border transition-colors ${activeAyahIndex === index && isPlaying ? "bg-primary/15 " : ""}`}
              >
                <div className="flex flex-col lg:flex-row justify-between gap-3 p-4">
                  <div className="flex items-center gap-2 lg:flex-col lg:items-center lg:gap-4">
                    <div className="flex items-center justify-between">
                      <span className="text-primary tracking-wide text-sm">
                        {surah.number}:{ayah.numberInSurah}
                      </span>
                    </div>

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
                        <Pause className="w-4 h-4 " />
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
                      className="text-right mb-4 py-4 lg:pl-4"
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
            ))}
          </motion.div>
        </div>
      </main>

      <AudioPlayer
        visible={Boolean(activeAyah)}
        title={
          activeAyah
            ? `${surah?.englishName ?? "Surah"} : ${activeAyah.numberInSurah}`
            : ""
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
          if (audioRef.current) {
            if (isPlaying) {
              audioRef.current.pause();
            } else {
              void audioRef.current.play();
            }
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
