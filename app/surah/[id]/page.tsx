import SurahClient from "@/components/SurahClient";
import { getSurahById } from "@/lib/surah-data";

export async function generateStaticParams() {
  // Pre-generate 1..114 for SSG
  return Array.from({ length: 114 }, (_, i) => ({ id: String(i + 1) }));
}

export default async function Page({ params }: { params: any }) {
  // `params` can be a Promise in some Next.js runtimes; unwrap it safely.
  const { id } = await params;
  const surah = await getSurahById(id);

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
