import type { Metadata } from "next";
import { Archivo, Amiri, Scheherazade_New } from "next/font/google";
import "./globals.css";
import { SettingsProvider } from "./_context/SettingsContext";
import { LayoutWrapper } from "@/components/LayoutWrapper";
import { ThemeInitializer } from "@/components/ThemeInitializer";

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
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: `
              try {
                const saved = localStorage.getItem("quran-settings");
                let theme = "system";
                if (saved) {
                  const parsed = JSON.parse(saved);
                  theme = parsed.theme || "system";
                }
                
                let effectiveTheme = theme;
                if (theme === "system") {
                  effectiveTheme = window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
                }
                
                document.documentElement.setAttribute("data-theme", effectiveTheme);
                if (effectiveTheme === "dark" || effectiveTheme === "sepia") {
                  document.documentElement.classList.add("dark");
                } else {
                  document.documentElement.classList.remove("dark");
                }
              } catch(e) {}
            `,
          }}
        />
      </head>
      <body
        className={`${archivo.variable} ${amiri.variable} ${scheherazade.variable} antialiased`}
      >
        <SettingsProvider>
          <ThemeInitializer />
          <LayoutWrapper>{children}</LayoutWrapper>
        </SettingsProvider>
      </body>
    </html>
  );
}
