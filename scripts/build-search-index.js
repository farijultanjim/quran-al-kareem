const fs = require('fs');
const path = require('path');

async function build() {
    try {
        console.log('Building search index...');
        const [arabicRes, englishRes] = await Promise.all([
            fetch('https://api.alquran.cloud/v1/quran/ar.alafasy'),
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
        const surahDetails = arabic.data.surahs.map((surah) => {
            const engSurah = english.data.surahs.find((x) => x.number === surah.number);

            const ayahsForSurah = surah.ayahs.map((ayah, idx) => {
                const item = {
                    number: ayah.number,
                    text: ayah.text,
                    audio: ayah.audio || '',
                    numberInSurah: ayah.numberInSurah,
                    englishText: engSurah?.ayahs?.[idx]?.text || '',
                };

                ayahs.push({
                    surahNumber: surah.number,
                    surahName: surah.name,
                    surahEnglishName: surah.englishName,
                    ayahNumber: ayah.numberInSurah,
                    text: ayah.text,
                    translation: engSurah?.ayahs?.[idx]?.text || '',
                });

                return item;
            });

            return {
                number: surah.number,
                name: surah.name,
                englishName: surah.englishName,
                englishNameTranslation: surah.englishNameTranslation,
                revelationType: surah.revelationType,
                ayahs: ayahsForSurah,
            };
        });

        const out = { surahs, ayahs };
        const outPath = path.join(process.cwd(), 'public', 'search-index.json');
        fs.mkdirSync(path.dirname(outPath), { recursive: true });
        fs.writeFileSync(outPath, JSON.stringify(out));
        console.log('Wrote', outPath);

        const surahDataPath = path.join(process.cwd(), 'lib', 'generated', 'surah-data.json');
        fs.mkdirSync(path.dirname(surahDataPath), { recursive: true });
        fs.writeFileSync(
            surahDataPath,
            JSON.stringify({ surahs: surahDetails })
        );
        console.log('Wrote', surahDataPath);
    } catch (err) {
        console.error('Error building search index', err);
    }
}

build();
