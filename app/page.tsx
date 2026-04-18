"use client";

import Hero from "@/components/Hero";
import { SurahList } from "@/components/SurahList";

export default function Home() {
  return (
    <main className="min-h-screen flex flex-col bg-background">
      {/* Hero Section */}
      <Hero />
      {/* Surahs List Section */}
      <SurahList />
    </main>
  );
}
