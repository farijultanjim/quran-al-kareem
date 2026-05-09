"use client";

import { useEffect, useState, useRef } from "react";
import { useSurahStore } from "./SurahProvider";
import Link from "next/link";
import { useParams } from "next/navigation";
import {
  Sidebar,
  SidebarContent,
  SidebarHeader,
  SidebarFooter,
} from "@/components/ui/sidebar";
import { Input } from "@/components/ui/input";
import { Search } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";

interface Surah {
  number: number;
  name: string;
  englishName: string;
  englishNameTranslation: string;
  numberOfAyahs: number;
  revelationType: string;
}

export function SurahSidebar() {
  const params = useParams();
  const currentSurahId = params.id ? parseInt(params.id as string) : null;
  const [surahs, setSurahs] = useState<Surah[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(true);
  const [headerHidden, setHeaderHidden] = useState(false);
  const scrollRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    // provider handles fetching; local state will sync from context below
  }, []);

  const { surahs: ctxSurahs, loading: ctxLoading } = useSurahStore();
  useEffect(() => {
    setSurahs(ctxSurahs as Surah[]);
    setLoading(ctxLoading);
  }, [ctxSurahs, ctxLoading]);

  useEffect(() => {
    const scrollEl =
      scrollRef.current ?? document.getElementById("surah-scroll-container");
    let prevScrollY = scrollEl
      ? (scrollEl as HTMLElement).scrollTop
      : window.scrollY;

    const onScroll = () => {
      const currentScrollY = scrollEl
        ? (scrollEl as HTMLElement).scrollTop
        : window.scrollY;
      if (currentScrollY > prevScrollY && currentScrollY > 0) {
        setHeaderHidden(true);
      } else if (currentScrollY < prevScrollY || currentScrollY === 0) {
        setHeaderHidden(false);
      }
      prevScrollY = currentScrollY;
    };

    if (scrollEl) {
      (scrollEl as HTMLElement).addEventListener("scroll", onScroll, {
        passive: true,
      });
      return () =>
        (scrollEl as HTMLElement).removeEventListener("scroll", onScroll);
    }

    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // Persist sidebar scroll position and restore it; keep selected surah visible
  useEffect(() => {
    const KEY = "surah-sidebar-scroll-y";
    const container =
      scrollRef.current ?? document.getElementById("surah-scroll-container");
    if (!container) return;

    const saved = sessionStorage.getItem(KEY);
    if (saved) {
      const v = parseInt(saved, 10);
      if (!Number.isNaN(v)) (container as HTMLElement).scrollTop = v;
    }

    if (currentSurahId) {
      // Retry finding the element because the list may render after fetch
      let attempts = 0;
      const tryScroll = () => {
        const el = (container as HTMLElement).querySelector(
          `[data-surah-number="${currentSurahId}"]`,
        );
        if (el instanceof HTMLElement) {
          const offset =
            el.offsetTop -
            (container as HTMLElement).clientHeight / 2 +
            el.clientHeight / 2;
          (container as HTMLElement).scrollTo({
            top: offset,
            behavior: "auto",
          });
          return;
        }
        attempts += 1;
        if (attempts < 10) setTimeout(tryScroll, 80);
      };
      setTimeout(tryScroll, 0);
    }

    let raf = 0;
    const onScrollSave = () => {
      if (raf) cancelAnimationFrame(raf);
      raf = requestAnimationFrame(() => {
        sessionStorage.setItem(
          KEY,
          String((container as HTMLElement).scrollTop || 0),
        );
      });
    };

    (container as HTMLElement).addEventListener("scroll", onScrollSave, {
      passive: true,
    });
    return () => {
      (container as HTMLElement).removeEventListener("scroll", onScrollSave);
      if (raf) cancelAnimationFrame(raf);
    };
  }, [currentSurahId]);

  const filteredSurahs = surahs.filter(
    (surah) =>
      surah.englishName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      surah.englishNameTranslation
        .toLowerCase()
        .includes(searchTerm.toLowerCase()) ||
      surah.number.toString().includes(searchTerm),
  );

  return (
    <Sidebar
      side="left"
      className={`hidden lg:flex min-w-80 top-20 border-r border-border will-change-transform transition-transform duration-500 ease-[cubic-bezier(0.76,0,0.24,1)] ${
        headerHidden ? "-translate-y-20" : "translate-y-0"
      }`}
    >
      <SidebarHeader className="p-5.5">
        {/* <h2 className="text-lg font-bold text-primary mb-3">Surahs</h2> */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-foreground/50" />
          <Input
            placeholder="Search Surah"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10 h-10 rounded-full border border-border/40 bg-foreground/5"
          />
        </div>
      </SidebarHeader>

      <SidebarContent className="px-4">
        <div
          ref={scrollRef}
          id="surah-scroll-container"
          className="space-y-3 px-2"
        >
          {loading ? (
            <div className="space-y-3">
              {Array.from({ length: 8 }).map((_, i) => (
                <div
                  key={i}
                  className="flex items-center justify-between gap-3 px-4 py-4 rounded-xl border border-border/40"
                >
                  <div className="flex items-center gap-5 min-w-0">
                    <div className="shrink-0">
                      <div className="w-8 h-8 grid place-items-center rounded-md transform rotate-45 bg-foreground/5"></div>
                    </div>

                    <div className="flex-1 min-w-0">
                      <Skeleton className="h-3 max-w-[60%] mb-2" />
                      <Skeleton className="h-2 max-w-[40%]" />
                    </div>
                  </div>

                  <div className="shrink-0 text-sm text-foreground/60 font-semibold text-right">
                    <Skeleton className="h-3 w-20" />
                  </div>
                </div>
              ))}
            </div>
          ) : (
            filteredSurahs.map((surah) => (
              <Link
                key={surah.number}
                href={`/surah/${surah.number}`}
                data-surah-number={surah.number}
                className={`flex items-center justify-between gap-3 px-4 py-4 rounded-xl transition-colors border ${
                  currentSurahId === surah.number
                    ? "bg-primary/5 border-primary/40"
                    : "border-border/40 hover:bg-primary/5"
                }`}
              >
                <div className="flex items-center gap-5 min-w-0">
                  <div className="shrink-0">
                    <div
                      className={`w-8 h-8 grid place-items-center rounded-md transform rotate-45 ${
                        currentSurahId === surah.number
                          ? "bg-primary text-foreground/80"
                          : "bg-foreground/5 text-foreground/40"
                      }`}
                    >
                      <span className="-rotate-45 text-xs font-bold">
                        {surah.number}
                      </span>
                    </div>
                  </div>

                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-sm text-foreground/80 truncate mb-1">
                      {surah.englishName}
                    </p>
                    <p className="text-xs text-foreground/40 truncate">
                      {surah.englishNameTranslation}
                    </p>
                  </div>
                </div>

                <div className="shrink-0 text-sm text-foreground/60 font-semibold text-right font-scheherazade">
                  <div className="leading-tight">{surah.name}</div>
                </div>
              </Link>
            ))
          )}
        </div>
      </SidebarContent>

      <SidebarFooter className="p-4 text-xs text-foreground/50">
        <p>All 114 Surahs</p>
      </SidebarFooter>
    </Sidebar>
  );
}
