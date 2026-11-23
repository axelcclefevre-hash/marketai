"use client";

import { useSession } from "next-auth/react";
import Link from "next/link";
import { MODULES } from "@/lib/learn-content";
import PremiumGate from "@/components/ui/PremiumGate";
import { BookOpen, Clock, Star } from "@phosphor-icons/react";

const LEVEL_COLOR: Record<string, string> = {
  "Débutant":      "text-buy bg-buy/10 border-buy/20",
  "Intermédiaire": "text-hold bg-hold/10 border-hold/20",
  "Avancé":        "text-sell bg-sell/10 border-sell/20",
};

function HubContent() {
  return (
    <div>
      <div className="mb-10">
        <div className="flex items-center gap-3 mb-3">
          <BookOpen size={28} className="text-buy" />
          <h1 className="text-3xl font-bold text-white">Apprendre à investir</h1>
        </div>
        <p className="text-muted max-w-2xl leading-relaxed">
          7 modules complets basés sur un cours universitaire d'Investment Management.
          Des fondamentaux aux produits dérivés — avec graphiques interactifs et formules clés.
        </p>
        <div className="flex gap-4 mt-4 text-sm text-muted">
          <span className="flex items-center gap-1"><BookOpen size={14} /> 7 modules</span>
          <span className="flex items-center gap-1"><Clock size={14} /> ~3h de contenu</span>
          <span className="flex items-center gap-1"><Star size={14} /> Niveau Débutant → Avancé</span>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
        {MODULES.map((mod, i) => (
          <Link key={mod.id} href={`/learn/${mod.id}`}>
            <div
              className="group bg-surface border border-white/[0.07] hover:border-white/[0.15] rounded-xl p-6 h-full transition-all hover:bg-[#161616] cursor-pointer"
              style={{ animationDelay: `${i * 60}ms` }}
            >
              <div className="flex items-start justify-between mb-4">
                <div
                  className="w-10 h-10 rounded-lg flex items-center justify-center font-bold text-sm"
                  style={{ background: `${mod.color}18`, color: mod.color, border: `1px solid ${mod.color}30` }}
                >
                  {String(mod.number).padStart(2, "0")}
                </div>
                <span className={`text-[10px] font-semibold uppercase tracking-wider px-2 py-0.5 rounded border ${LEVEL_COLOR[mod.level]}`}>
                  {mod.level}
                </span>
              </div>

              <h2 className="text-base font-semibold text-white mb-1 group-hover:text-buy transition-colors">
                {mod.title}
              </h2>
              <p className="text-xs text-muted mb-4 leading-relaxed">{mod.description}</p>

              <div className="flex items-center justify-between text-xs text-muted">
                <span className="flex items-center gap-1"><Clock size={12} /> {mod.duration}</span>
                <span className="flex items-center gap-1">{mod.sections.length} sections</span>
              </div>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}

export default function LearnHub() {
  return (
    <PremiumGate feature="Apprendre à investir">
      <HubContent />
    </PremiumGate>
  );
}
