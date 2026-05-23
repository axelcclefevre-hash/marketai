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
      <div className="lg:hidden fixed top-0 left-0 right-0 h-14 bg-[#111111] border-b border-white/[0.06] flex items-center justify-between px-4 z-20">
        <button
          onClick={() => setMobileOpen(true)}
          className="w-9 h-9 flex items-center justify-center rounded-lg text-[#6b7280] hover:text-white hover:bg-white/[0.06] transition-colors"
          aria-label="Ouvrir le menu"
        >
          <List size={20} />
        </button>
        <div className="text-lg font-bold text-white tracking-tight">
          Market<span className="text-[#00d97e]">AI</span>
        </div>
        <div className="w-9" /> {/* spacer pour centrer le logo */}
      </div>

      {/* Contenu principal */}
      <main className="flex-1 min-h-screen lg:ml-[260px] pt-14 lg:pt-0">
        <div className="max-w-screen-xl mx-auto px-4 sm:px-6 py-6 lg:py-8">
          {children}
        </div>
      </main>
    </>
  );
}
