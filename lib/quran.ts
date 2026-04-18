import { Surah, Ayah } from "./types";

export interface SurahWithAyahs extends Surah {
  ayahs: Ayah[];
}

export interface QuranApiResponse {
  code: number;
  status: string;
  data: {
    surahs: SurahWithAyahs[];
    edition: {
      identifier: string;
      language: string;
      name: string;
      englishName: string;
      format: string;
      type: string;
    };
  };
}

const ARABIC_API = "https://api.alquran.cloud/v1/quran/quran-uthmani";
const ENGLISH_API = "https://api.alquran.cloud/v1/quran/en.asad";

export async function fetchQuranData() {
  try {
    const [arabicRes, englishRes] = await Promise.all([
      fetch(ARABIC_API, { next: { revalidate: 86400 } }),
      fetch(ENGLISH_API, { next: { revalidate: 86400 } }),
    ]);

    if (!arabicRes.ok || !englishRes.ok) {
      throw new Error("Failed to fetch Quran data");
    }

    const arabicData: QuranApiResponse = await arabicRes.json();
    const englishData: QuranApiResponse = await englishRes.json();

    // Merge the data
    const surahs = arabicData.data.surahs.map((surah, index) => ({
      ...surah,
      englishAyahs: englishData.data.surahs[index]?.ayahs || [],
    }));

    return surahs;
  } catch (error) {
    console.error("Error fetching Quran data:", error);
    throw error;
  }
}

export async function fetchSurahDetail(surahNumber: number) {
  try {
    const [arabicRes, englishRes] = await Promise.all([
      fetch(ARABIC_API, { next: { revalidate: 86400 } }),
      fetch(ENGLISH_API, { next: { revalidate: 86400 } }),
    ]);

    if (!arabicRes.ok || !englishRes.ok) {
      throw new Error("Failed to fetch Surah detail");
    }

    const arabicData: QuranApiResponse = await arabicRes.json();
    const englishData: QuranApiResponse = await englishRes.json();

    const arabicSurah = arabicData.data.surahs[surahNumber - 1];
    const englishSurah = englishData.data.surahs[surahNumber - 1];

    if (!arabicSurah || !englishSurah) {
      throw new Error("Surah not found");
    }

    // Merge ayahs
    const ayahs = arabicSurah.ayahs.map((ayah, index) => ({
      ...ayah,
      englishText: englishSurah.ayahs[index]?.text || "",
    }));

    return {
      ...arabicSurah,
      ayahs,
    };
  } catch (error) {
    console.error("Error fetching Surah detail:", error);
    throw error;
  }
}
