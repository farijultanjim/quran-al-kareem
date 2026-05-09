import SurahClient from "@/components/SurahClient";

type Ayah = {
  number: number;
  text: string;
  audio: string;
  numberInSurah: number;
  englishText?: string;
};

type SurahDetail = {
  number: number;
  name: string;
  englishName: string;
  englishNameTranslation: string;
  revelationType: string;
  ayahs: Ayah[];
};

export async function generateStaticParams() {
  // Pre-generate 1..114 for SSG
  return Array.from({ length: 114 }, (_, i) => ({ id: String(i + 1) }));
}

async function fetchSurah(id: string): Promise<SurahDetail | null> {
  try {
    const arabicRes = await fetch(
      `https://api.alquran.cloud/v1/surah/${id}/ar.alafasy`,
      { next: { revalidate: 60 * 60 * 24 } },
    );
    const englishRes = await fetch(
      `https://api.alquran.cloud/v1/surah/${id}/en.asad`,
      { next: { revalidate: 60 * 60 * 24 } },
    );

    if (!arabicRes.ok || !englishRes.ok) return null;

    const arabicData = await arabicRes.json();
    const englishData = await englishRes.json();

    const arabicSurah = arabicData.data;
    const englishSurah = englishData.data;

    const ayahs: Ayah[] = arabicSurah.ayahs.map((ayah: any, idx: number) => ({
      number: ayah.number,
      text: ayah.text,
      audio: ayah.audio || "",
      numberInSurah: ayah.numberInSurah,
      englishText: englishSurah?.ayahs?.[idx]?.text || "",
    }));

    return {
      number: arabicSurah.number,
      name: arabicSurah.name,
      englishName: arabicSurah.englishName,
      englishNameTranslation: arabicSurah.englishNameTranslation,
      revelationType: arabicSurah.revelationType,
      ayahs,
    };
  } catch (err) {
    console.error("Failed to fetch surah:", err);
    return null;
  }
}

export default async function Page({ params }: { params: any }) {
  // `params` can be a Promise in some Next.js runtimes; unwrap it safely.
  const { id } = await params;
  const surah = await fetchSurah(id);

  if (!surah) {
    return (
      <main className="min-h-screen bg-background px-4">
        <div className="w-full max-w-none mx-auto text-center">
          <p className="text-foreground/60 mb-6">Surah not found</p>
        </div>
      </main>
    );
  }

  return <SurahClient surah={surah} />;
}
