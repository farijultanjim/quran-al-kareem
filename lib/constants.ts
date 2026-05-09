/**
 * Global constants for consistent configuration across the app
 */

export const SCROLL_RETRY_DELAY_MS = 80;
export const MAX_SCROLL_ATTEMPTS = 10;
export const AUDIO_CACHE_WINDOW = 3;

export const STORAGE_KEYS = {
  SURAH_SHEET_SCROLL: "surah-sheet-scroll-y",
  SURAH_SIDEBAR_SCROLL: "surah-sidebar-scroll-y",
  THEME: "theme-preference",
  SETTINGS: "app-settings",
} as const;
