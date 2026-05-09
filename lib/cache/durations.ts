/**
 * Audio duration caching utilities
 */

const DURATION_CACHE_PREFIX = "surah-durations-";

export function loadDurationsFromCache(
  surahNumber: number,
  expectedLength: number,
): number[] {
  try {
    if (typeof window === "undefined") return [];

    const key = `${DURATION_CACHE_PREFIX}${surahNumber}`;
    const raw = localStorage.getItem(key);

    if (!raw) return Array(expectedLength).fill(0);

    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed) || parsed.length !== expectedLength) {
      return Array(expectedLength).fill(0);
    }

    return parsed.map((v: any) => (typeof v === "number" ? v : 0));
  } catch {
    return Array(expectedLength).fill(0);
  }
}

export function saveDurationsToCache(
  surahNumber: number,
  durations: number[],
): void {
  try {
    if (typeof window === "undefined") return;
    const key = `${DURATION_CACHE_PREFIX}${surahNumber}`;
    localStorage.setItem(key, JSON.stringify(durations));
  } catch {
    // Silently fail if localStorage is unavailable
  }
}

export async function getAudioDuration(url: string): Promise<number> {
  return new Promise<number>((resolve) => {
    if (!url) return resolve(0);

    const audio = new Audio();
    audio.preload = "metadata";

    const cleanup = () => {
      audio.removeEventListener("loadedmetadata", onLoaded);
      audio.removeEventListener("error", onError);
    };

    const onLoaded = () => {
      const duration = Number.isFinite(audio.duration) ? audio.duration : 0;
      cleanup();
      resolve(duration);
    };

    const onError = () => {
      cleanup();
      resolve(0);
    };

    audio.addEventListener("loadedmetadata", onLoaded);
    audio.addEventListener("error", onError);
    audio.src = url;
  });
}
