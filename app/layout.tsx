import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { UiLangProvider } from "@/lib/i18n";
import ThemeToggle from "@/components/ThemeToggle";
import LangToggle from "@/components/LangToggle";

const THEME_INIT_SCRIPT = `
(function () {
  try {
    var stored = localStorage.getItem("theme");
    var theme = stored === "light" || stored === "dark"
      ? stored
      : (window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light");
    document.documentElement.setAttribute("data-theme", theme);
  } catch (e) {}
})();
`;

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Kromo Inggil — Sinau Basa Jawa Alus",
  description:
    "Belajar unggah-ungguh basa Jawa halus (kromo inggil) lewat latihan singkat harian.",
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="id"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
      suppressHydrationWarning
    >
      <body>
        <script dangerouslySetInnerHTML={{ __html: THEME_INIT_SCRIPT }} />
        <UiLangProvider>
          <div className="app-toolbar">
            <LangToggle />
            <ThemeToggle />
          </div>
          <main className="app-content">{children}</main>
          <footer className="app-footer">
            <a
              href="https://saweria.co/wahyufa"
              target="_blank"
              rel="noopener noreferrer"
            >
              Beri Dukungan
            </a>
          </footer>
        </UiLangProvider>
      </body>
    </html>
  );
}
