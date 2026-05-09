import Hero from "@/components/Hero";
import { SurahList } from "@/components/SurahList";

type DisplaySurah = {
  number: number;
  name: string;
  englishName: string;
  englishNameTranslation: string;
  revelationType: string;
  numberOfAyahs: number;
};

async function fetchSurahList(): Promise<DisplaySurah[]> {
  try {
    const res = await fetch("https://api.alquran.cloud/v1/surah", {
      next: { revalidate: 60 * 60 * 24 },
    });
    if (!res.ok) return [];
    const data = await res.json();
    // data.data is expected to be an array of surah metadata
    return data.data.map((s: any) => ({
      number: s.number,
      name: s.name,
      englishName: s.englishName,
      englishNameTranslation: s.englishNameTranslation,
      revelationType: s.revelationType,
      numberOfAyahs: s.numberOfAyahs,
    }));
  } catch (err) {
    console.error("Failed to fetch surah list:", err);
    return [];
  }
}

export default async function Home() {
  const surahs = await fetchSurahList();

  return (
    <main className="min-h-screen flex flex-col bg-background">
      {/* Hero Section */}
      <Hero />
      {/* Surahs List Section */}
      <SurahList initialSurahs={surahs} />
    </main>
  );
}
