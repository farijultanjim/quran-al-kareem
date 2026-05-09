"use client";

import { useEffect, useRef, useCallback } from "react";
import { SCROLL_RETRY_DELAY_MS, MAX_SCROLL_ATTEMPTS } from "@/lib/constants";

interface ScrollToElementOptions {
  containerId?: string;
  elementId: string;
  behavior?: ScrollBehavior;
  block?: ScrollLogicalPosition;
  maxAttempts?: number;
}

/**
 * Hook to scroll an element into view with retry logic
 * Handles async DOM rendering by retrying with delays
 */
export function useScrollToElement() {
  const attemptsRef = useRef<Map<string, number>>(new Map());

  const scrollToElement = useCallback(
    ({
      containerId,
      elementId,
      behavior = "smooth",
      block = "center",
      maxAttempts = MAX_SCROLL_ATTEMPTS,
    }: ScrollToElementOptions) => {
      const key = `${containerId}-${elementId}`;

      const tryScroll = () => {
        const container = containerId
          ? document.getElementById(containerId)
          : undefined;
        const element = document.getElementById(elementId);

        if (element) {
          element.scrollIntoView({ behavior, block });
          attemptsRef.current.delete(key);
          return;
        }

        const attempts = (attemptsRef.current.get(key) ?? 0) + 1;
        if (attempts < maxAttempts) {
          attemptsRef.current.set(key, attempts);
          setTimeout(tryScroll, SCROLL_RETRY_DELAY_MS);
        } else {
          attemptsRef.current.delete(key);
        }
      };

      tryScroll();
    },
    [],
  );

  return { scrollToElement };
}
