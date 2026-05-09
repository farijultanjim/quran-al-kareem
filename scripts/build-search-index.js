const fs = require('fs');
const path = require('path');

async function build() {
    try {
        console.log('Building search index...');
        const [arabicRes, englishRes] = await Promise.all([
            fetch('https://api.alquran.cloud/v1/quran/quran-uthmani'),
            fetch('https://api.alquran.cloud/v1/quran/en.asad'),
        ]);

        if (!arabicRes.ok || !englishRes.ok) {
            console.error('Failed to fetch Quran data for search index');
            process.exit(0);
        }

        const arabic = await arabicRes.json();
        const english = await englishRes.json();

        const surahs = arabic.data.surahs.map((s) => ({
            number: s.number,
            name: s.name,
            englishName: s.englishName,
            englishNameTranslation: s.englishNameTranslation,
            revelationType: s.revelationType,
            numberOfAyahs: s.numberOfAyahs,
        }));

        const ayahs = [];
        arabic.data.surahs.forEach((surah) => {
            const engSurah = english.data.surahs.find((x) => x.number === surah.number);
            surah.ayahs.forEach((ayah, idx) => {
                ayahs.push({
                    surahNumber: surah.number,
                    surahName: surah.name,
                    surahEnglishName: surah.englishName,
                    ayahNumber: ayah.numberInSurah,
                    text: ayah.text,
                    translation: engSurah?.ayahs?.[idx]?.text || '',
                });
            });
        });

        const out = { surahs, ayahs };
        const outPath = path.join(process.cwd(), 'public', 'search-index.json');
        fs.mkdirSync(path.dirname(outPath), { recursive: true });
        fs.writeFileSync(outPath, JSON.stringify(out));
        console.log('Wrote', outPath);
    } catch (err) {
        console.error('Error building search index', err);
    }
}

build();
