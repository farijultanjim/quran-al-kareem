// Main Surah Type
export interface Surah {
  number: number;
  name: string;
  englishName: string;
  englishNameTranslation: string;
  numberOfAyahs: number;
  revelationType: "Meccan" | "Medinan";
}

// Ayah (Verse) Type
export interface Ayah {
  number: number;
  text: string;
  numberInSurah: number;
  juz: number;
  manzil: number;
  page: number;
  ruku: number;
  hizbQuarter: number;
  sajdah: boolean;
  translation?: string;
  transliteration?: string;
}

// Complete Surah with Ayahs
export interface SurahWithAyahs extends Surah {
  ayahs: Ayah[];
}

// Search Result Type
export interface SearchResult {
  surahNumber: number;
  surahName: string;
  ayahNumber: number;
  ayahText: string;
  translation?: string;
}
