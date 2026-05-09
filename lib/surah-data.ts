import { readFile } from "fs/promises";
import path from "path";
import { cache } from "react";

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

type SurahDataFile = {
  surahs: SurahDetail[];
};

async function loadGeneratedSurahs(): Promise<SurahDetail[] | null> {
  try {
    const filePath = path.join(
      process.cwd(),
      "lib",
      "generated",
      "surah-data.json",
    );
    const raw = await readFile(filePath, "utf8");
    const parsed = JSON.parse(raw) as SurahDataFile;
    return parsed.surahs ?? null;
  } catch {
    return null;
  }
}

async function loadRemoteSurahs(): Promise<SurahDetail[] | null> {
  try {
    const [arabicRes, englishRes] = await Promise.all([
      fetch("https://api.alquran.cloud/v1/quran/ar.alafasy"),
      fetch("https://api.alquran.cloud/v1/quran/en.asad"),
    ]);

    if (!arabicRes.ok || !englishRes.ok) return null;

    const arabicData = await arabicRes.json();
    const englishData = await englishRes.json();

    return arabicData.data.surahs.map((surah: any) => {
      const englishSurah = englishData.data.surahs.find(
        (item: any) => item.number === surah.number,
      );

      return {
        number: surah.number,
        name: surah.name,
        englishName: surah.englishName,
        englishNameTranslation: surah.englishNameTranslation,
        revelationType: surah.revelationType,
        ayahs: surah.ayahs.map((ayah: any, index: number) => ({
          number: ayah.number,
          text: ayah.text,
          audio: ayah.audio || "",
          numberInSurah: ayah.numberInSurah,
          englishText: englishSurah?.ayahs?.[index]?.text || "",
        })),
      };
    });
  } catch {
    return null;
  }
}

export const getGeneratedSurahs = cache(async () => {
  return (await loadGeneratedSurahs()) ?? (await loadRemoteSurahs()) ?? [];
});

export async function getSurahById(id: string) {
  const surahs = await getGeneratedSurahs();
  return surahs.find((surah) => String(surah.number) === id) ?? null;
}
