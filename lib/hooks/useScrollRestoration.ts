"use client";

import { useEffect, useRef } from "react";
import {
  STORAGE_KEYS,
  SCROLL_RETRY_DELAY_MS,
  MAX_SCROLL_ATTEMPTS,
} from "@/lib/constants";

type StorageKeyType = keyof typeof STORAGE_KEYS;

interface UseScrollRestorationOptions {
  storageKey: StorageKeyType;
  isOpen: boolean;
  selectedItemSelector?: string;
  selectedItemId?: number | string | null;
}

/**
 * Hook to restore scroll position and scroll selected item into view
 * Handles async DOM rendering with retry logic
 */
export function useScrollRestoration({
  storageKey,
  isOpen,
  selectedItemSelector,
  selectedItemId,
}: UseScrollRestorationOptions) {
  const containerRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const container = containerRef.current;
    if (!container || !isOpen) return;

    const actualStorageKey = STORAGE_KEYS[storageKey];

    // Restore scroll position from sessionStorage
    const saved = sessionStorage.getItem(actualStorageKey);
    if (saved) {
      const y = parseInt(saved, 10);
      if (!Number.isNaN(y)) {
        container.scrollTop = y;
      }
    }

    // Scroll to selected item with retry logic
    if (selectedItemSelector && selectedItemId) {
      let attempts = 0;
      const tryScroll = () => {
        const el = container.querySelector(
          `${selectedItemSelector}="${selectedItemId}"`,
        );
        if (el instanceof HTMLElement) {
          const offset =
            el.offsetTop - container.clientHeight / 2 + el.clientHeight / 2;
          container.scrollTo({ top: offset, behavior: "auto" });
          return;
        }
        attempts += 1;
        if (attempts < MAX_SCROLL_ATTEMPTS) {
          setTimeout(tryScroll, SCROLL_RETRY_DELAY_MS);
        }
      };
      setTimeout(tryScroll, 0);
    }

    // Save scroll position on scroll
    let raf = 0;
    const onScroll = () => {
      if (raf) cancelAnimationFrame(raf);
      raf = requestAnimationFrame(() => {
        sessionStorage.setItem(
          actualStorageKey,
          String(container.scrollTop || 0),
        );
      });
    };

    container.addEventListener("scroll", onScroll, { passive: true });
    return () => {
      container.removeEventListener("scroll", onScroll);
      if (raf) cancelAnimationFrame(raf);
    };
  }, [isOpen, selectedItemId, selectedItemSelector, storageKey]);

  return containerRef;
}
