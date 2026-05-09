"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronLeft, ChevronRight, Pause, Play, X } from "lucide-react";

interface AudioPlayerProps {
  visible: boolean;
  title: string;
  currentTime: number;
  duration: number;
  isPlaying: boolean;
  progress: number;
  onPlayPause: () => void;
  onPrevious?: () => void;
  onNext?: () => void;
  onClose: () => void;
  onSeek: (value: number) => void;
}

function formatTime(timeInSeconds: number) {
  if (!Number.isFinite(timeInSeconds) || timeInSeconds < 0) return "00:00";

  const minutes = Math.floor(timeInSeconds / 60);
  const seconds = Math.floor(timeInSeconds % 60)
    .toString()
    .padStart(2, "0");

  return `${minutes.toString().padStart(2, "0")}:${seconds}`;
}

export function AudioPlayer({
  visible,
  title,
  currentTime,
  duration,
  isPlaying,
  progress,
  onPlayPause,
  onPrevious,
  onNext,
  onClose,
  onSeek,
}: AudioPlayerProps) {
  const [isScrubbing, setIsScrubbing] = useState(false);
  const [hoverTime, setHoverTime] = useState<number | null>(null);
  const [isHovering, setIsHovering] = useState(false);

  const progressPercent = Number.isFinite(progress) ? progress : 0;

  const seekFromPointer = (event: React.PointerEvent<HTMLDivElement>) => {
    const rect = event.currentTarget.getBoundingClientRect();
    const clamp = Math.max(
      0,
      Math.min(1, (event.clientX - rect.left) / rect.width),
    );
    const seekTarget = clamp * duration;
    onSeek(seekTarget);
    setHoverTime(seekTarget);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLDivElement>) => {
    if (e.key === "ArrowLeft") {
      e.preventDefault();
      onSeek(Math.max(0, currentTime - 5));
    } else if (e.key === "ArrowRight") {
      e.preventDefault();
      onSeek(Math.min(duration, currentTime + 5));
    }
  };

  return (
    <AnimatePresence>
      {visible ? (
        <motion.div
          initial={{ y: 120, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 120, opacity: 0 }}
          transition={{ duration: 0.35, ease: [0.76, 0, 0.24, 1] }}
          className="fixed inset-x-0 bottom-0 z-50 border-t border-white/10 bg-[#141414] text-white shadow-[0_-12px_40px_rgba(0,0,0,0.35)]"
        >
          <div
            className="relative h-1 w-full cursor-pointer bg-white/5 transition-colors hover:bg-white/10 touch-none"
            style={{ touchAction: "none" }}
            role="slider"
            aria-valuemin={0}
            aria-valuemax={Math.max(0, duration || 0)}
            aria-valuenow={currentTime}
            tabIndex={0}
            onKeyDown={handleKeyDown}
            onPointerDown={(event) => {
              event.currentTarget.setPointerCapture(event.pointerId);
              setIsScrubbing(true);
              seekFromPointer(event);
            }}
            onPointerMove={(event) => {
              const rect = (
                event.currentTarget as HTMLDivElement
              ).getBoundingClientRect();
              const clamp = Math.max(
                0,
                Math.min(1, (event.clientX - rect.left) / rect.width),
              );
              setHoverTime(clamp * duration);
              setIsHovering(true);
              if (!isScrubbing) return;
              seekFromPointer(event);
            }}
            onPointerUp={(event) => {
              if (isScrubbing) {
                seekFromPointer(event);
              }
              setIsScrubbing(false);
              setIsHovering(false);
              event.currentTarget.releasePointerCapture(event.pointerId);
            }}
            onPointerLeave={() => {
              if (!isScrubbing) setIsHovering(false);
            }}
            onPointerCancel={() => setIsScrubbing(false)}
            onLostPointerCapture={() => setIsScrubbing(false)}
          >
            <div
              className="h-full bg-primary transition-[width] duration-150 ease-linear"
              style={{ width: `${progressPercent}%` }}
            />

            <div
              className="pointer-events-none absolute top-1/2 h-3 w-3 -translate-x-1/2 -translate-y-1/2 rounded-full border border-black/20 bg-primary shadow-[0_4px_12px_rgba(0,0,0,0.45)] transition-[left] duration-150 ease-linear"
              style={{ left: `${progressPercent}%` }}
            />

            {/* hover tooltip */}
            {isHovering && hoverTime !== null && (
              <div
                className="absolute -top-8 z-20 -translate-x-1/2 rounded-md bg-black/80 px-2 py-1 text-xs text-white"
                style={{ left: `${progressPercent}%` }}
              >
                {formatTime(hoverTime)}
              </div>
            )}
          </div>

          <div className="px-4 py-3 sm:px-6 relative">
            <div className="flex items-center justify-between gap-3 py-5">
              {/* Left: surah name / ayah (use title prop) */}
              <div className="min-w-0 hidden md:flex-1">
                <p className="truncate text-sm font-semibold text-white/85">
                  {title}
                </p>
              </div>

              {/* Center: transport controls, time, close (absolutely centered) */}
              <div className="absolute left-1/2 top-1/2 flex -translate-x-1/2 -translate-y-1/2 items-center gap-3 ">
                <p className="text-xs text-white/50">
                  {formatTime(currentTime)}
                </p>
                <button
                  type="button"
                  aria-label="Previous ayah"
                  onClick={onPrevious}
                  disabled={!onPrevious}
                  className="grid h-9 w-9 place-items-center rounded-full hover:bg-white/10 transition-colors disabled:opacity-35 disabled:hover:bg-transparent cursor-pointer"
                >
                  <ChevronLeft className="h-5 w-5" />
                </button>

                <button
                  type="button"
                  aria-label={isPlaying ? "Pause" : "Play"}
                  onClick={onPlayPause}
                  className="grid h-8 w-8 place-items-center rounded-full border  bg-primary text-background shadow-[0_0_0_3px_rgba(66,128,56,0.18)] transition-transform hover:scale-105 cursor-pointer"
                >
                  {isPlaying ? (
                    <Pause className="h-4 w-4 fill-background" />
                  ) : (
                    <Play className="h-4 w-4 fill-background" />
                  )}
                </button>

                <button
                  type="button"
                  aria-label="Next ayah"
                  onClick={onNext}
                  disabled={!onNext}
                  className="grid h-9 w-9 place-items-center rounded-full hover:bg-white/10 transition-colors disabled:opacity-35 disabled:hover:bg-transparent cursor-pointer"
                >
                  <ChevronRight className="h-5 w-5" />
                </button>

                <p className="text-xs text-white/50">{formatTime(duration)}</p>

                <button
                  type="button"
                  aria-label="Close audio player"
                  onClick={onClose}
                  className="grid h-9 w-9 place-items-center rounded-full hover:bg-white/10 transition-colors cursor-pointer"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>
            </div>
          </div>
        </motion.div>
      ) : null}
    </AnimatePresence>
  );
}
