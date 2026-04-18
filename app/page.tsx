"use client";

import Hero from "@/components/Hero";

export default function Home() {
  return (
    <main className="min-h-screen flex flex-col">
      {/* Hero Section */}
      <Hero />

      {/* Additional sections can be added here */}
      <div className="h-96 bg-background/50" />
    </main>
  );
}
