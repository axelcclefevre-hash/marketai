"use client";

import { useState } from "react";
import { List, X } from "@phosphor-icons/react";
import Sidebar from "./Sidebar";

export default function AppShell({ children }: { children: React.ReactNode }) {
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <>
      <Sidebar mobileOpen={mobileOpen} onClose={() => setMobileOpen(false)} />

      {/* Backdrop mobile */}
      {mobileOpen && (
        <div
          className="fixed inset-0 bg-black/60 z-30 lg:hidden"
          onClick={() => setMobileOpen(false)}
        />
      )}

      {/* Top bar mobile */}
      <div className="lg:hidden fixed top-0 left-0 right-0 h-14 bg-deep border-b border-border flex items-center justify-between px-4 z-20">
        <button
          onClick={() => setMobileOpen(true)}
          className="w-9 h-9 flex items-center justify-center rounded-lg text-muted hover:text-primary hover:bg-white/[0.06] transition-colors"
          aria-label="Ouvrir le menu"
        >
          <List size={20} />
        </button>
        <div className="text-lg font-medium text-primary tracking-tight">
          Market<span className="text-buy">AI</span>
        </div>
        <div className="w-9" /> {/* spacer pour centrer le logo */}
      </div>

      {/* Contenu principal */}
      <main className="flex-1 min-w-0 min-h-screen lg:ml-[240px] pt-14 lg:pt-0">
        <div className="max-w-[1200px] mx-auto px-4 sm:px-8 py-6 lg:py-10">
          {children}
        </div>
      </main>
    </>
  );
}
