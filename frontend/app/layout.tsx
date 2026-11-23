import type { Metadata } from "next";
import { Fira_Sans, Fira_Code } from "next/font/google";
import "./globals.css";
import AppShell from "@/components/layout/AppShell";

const sans = Fira_Sans({ subsets: ["latin"], weight: ["400", "500"], variable: "--font-sans", display: "swap" });
const mono = Fira_Code({ subsets: ["latin"], weight: ["400", "500"], variable: "--font-mono", display: "swap" });

export const metadata: Metadata = {
  title: "MarketAI",
  description: "Analyse de marchés financiers en temps réel · IA · Backtesting",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="fr" className={`${sans.variable} ${mono.variable}`}>
      <body className="flex min-h-screen antialiased">
        <AppShell>{children}</AppShell>
      </body>
    </html>
  );
}
