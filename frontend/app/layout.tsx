import type { Metadata } from "next";
import localFont from "next/font/local";
import "./globals.css";
import Sidebar from "@/components/layout/Sidebar";
import SessionProvider from "@/components/layout/SessionProvider";

const geistSans = localFont({
  src: "./fonts/GeistVF.woff",
  variable: "--font-geist-sans",
  weight: "100 900",
});
const geistMono = localFont({
  src: "./fonts/GeistMonoVF.woff",
  variable: "--font-geist-mono",
  weight: "100 900",
});

export const metadata: Metadata = {
  title: "MarketAI",
  description: "Analyse de marchés financiers en temps réel · IA · Backtesting",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="fr" className={`${geistSans.variable} ${geistMono.variable}`}>
      <body className="flex min-h-screen bg-[#0a0a0a] antialiased">
        <SessionProvider>
          <Sidebar />
          <main className="flex-1 min-h-screen" style={{ marginLeft: 260 }}>
            <div className="max-w-screen-xl mx-auto px-6 py-8">
              {children}
            </div>
          </main>
        </SessionProvider>
      </body>
    </html>
  );
}
