"use client";

import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import {
  Sheet,
  SheetContent,
  SheetHeader,
} from "@/components/ui/Sheet";
import { Input } from "@/components/ui/input";
import { Search } from "lucide-react";
import Link from "next/link";
import { Skeleton } from "@/components/ui/skeleton";

interface Surah {
  number: number;
  name: string;
  englishName: string;
  englishNameTranslation: string;
}

interface SurahSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function SurahSheet({ open, onOpenChange }: SurahSheetProps) {
  const [surahs, setSurahs] = useState<Surah[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    async function fetchSurahs() {
      try {
        const res = await fetch("https://api.alquran.cloud/v1/surah");
        const data = await res.json();
        setSurahs(data.data);
        setLoading(false);
      } catch (err) {
        console.error(err);
        setLoading(false);
      }
    }

    if (open && surahs.length === 0) fetchSurahs();
  }, [open, surahs.length]);

  const filtered = surahs.filter(
    (s) =>
      s.englishName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      s.englishNameTranslation
        .toLowerCase()
        .includes(searchTerm.toLowerCase()) ||
      s.number.toString().includes(searchTerm),
  );

  const pathname = usePathname();
  const currentSurahId = pathname?.split("/").pop()
    ? parseInt(pathname.split("/").pop() as string)
    : null;

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="left">
        <SheetHeader className="p-4 mt-4">
          {/* <SheetTitle>Surahs</SheetTitle>
          <SheetDescription>Choose a Surah</SheetDescription> */}
          <div className="relative">
            <Search className="absolute left-4.5 top-1/2 -translate-y-1/2 w-4 h-4 text-foreground/50" />
            <Input
              placeholder="Search Surah"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-11 h-12 rounded-full border border-border/40 bg-foreground/5"
            />
          </div>
        </SheetHeader>

        <div className="p-4">
          <div className="space-y-3">
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
              filtered.map((s) => (
                <Link
                  key={s.number}
                  href={`/surah/${s.number}`}
                  onClick={() => onOpenChange(false)}
                  className={`flex items-center justify-between gap-3 px-4 py-4 rounded-xl transition-colors border ${
                    currentSurahId === s.number
                      ? "bg-primary/5 border-primary/40"
                      : "border-border/40 hover:bg-primary/5"
                  }`}
                >
                  <div className="flex items-center gap-5 min-w-0">
                    <div className="shrink-0">
                      <div
                        className={`w-8 h-8 grid place-items-center rounded-md transform rotate-45 ${
                          currentSurahId === s.number
                            ? "bg-primary text-foreground/80"
                            : "bg-foreground/5 text-foreground/40"
                        }`}
                      >
                        <span className="-rotate-45 text-xs font-bold">
                          {s.number}
                        </span>
                      </div>
                    </div>

                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-sm text-foreground/80 truncate mb-1">
                        {s.englishName}
                      </p>
                      <p className="text-xs text-foreground/40 truncate">
                        {s.englishNameTranslation}
                      </p>
                    </div>
                  </div>

                  <div className="shrink-0 text-sm text-foreground/60 font-semibold text-right font-scheherazade">
                    <div className="leading-tight">{s.name}</div>
                  </div>
                </Link>
              ))
            )}
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
}
