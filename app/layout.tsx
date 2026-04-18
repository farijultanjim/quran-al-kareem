import type { Metadata } from "next";
import { Archivo, Amiri, Scheherazade_New } from "next/font/google";
import "./globals.css";
import { SettingsProvider } from "./_context/SettingsContext";
import Header from "@/components/Header";
import { LenisProvider } from "@/lib/lenis";

const archivo = Archivo({
  subsets: ["latin"],
  variable: "--font-archivo",
  weight: ["400", "500", "600", "700"],
});

const amiri = Amiri({
  subsets: ["arabic"],
  variable: "--font-amiri",
  weight: ["400", "700"],
});

const scheherazade = Scheherazade_New({
  subsets: ["arabic"],
  variable: "--font-scheherazade",
  weight: ["400", "500", "600", "700"],
});

export const metadata: Metadata = {
  title: "Quran - Qur'an Al-Kareem",
  description:
    "Read, search, and study the Qur'an with customizable Arabic fonts and translations",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${archivo.variable} ${amiri.variable} ${scheherazade.variable} antialiased`}
      >
        <LenisProvider>
          <SettingsProvider>
            <Header />
            {children}
          </SettingsProvider>
        </LenisProvider>
      </body>
    </html>
  );
}
