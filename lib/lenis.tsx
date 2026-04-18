"use client";

import { ReactLenis, useLenis } from "lenis/react";
import { frame, cancelFrame } from "framer-motion";
import { useEffect, useRef } from "react";
import type { LenisRef } from "lenis/react";

export { useLenis };

export function LenisProvider({ children }: { children: React.ReactNode }) {
  const lenisRef = useRef<LenisRef>(null);

  useEffect(() => {
    function update(data: { timestamp: number }) {
      const time = data.timestamp;
      lenisRef.current?.lenis?.raf(time);
    }

    frame.update(update, true);

    return () => cancelFrame(update);
  }, []);

  return (
    <ReactLenis
      root
      options={{
        autoRaf: false,
        // Tell Lenis to hand back control when the scroll target
        // is inside an element marked with data-lenis-prevent
        prevent: (node: Element) => {
          let el: Element | null = node;
          while (el) {
            if (el.hasAttribute?.("data-lenis-prevent")) return true;
            el = el.parentElement;
          }
          return false;
        },
      }}
      ref={lenisRef}
    >
      {children}
    </ReactLenis>
  );
}
