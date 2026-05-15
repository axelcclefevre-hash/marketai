"use client";

import { getModule, MODULES } from "@/lib/learn-content";
import PremiumGate from "@/components/ui/PremiumGate";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowLeft, ArrowRight, CheckCircle, Clock, BookOpen } from "@phosphor-icons/react";
import dynamic from "next/dynamic";

const CHART_MAP: Record<string, React.ComponentType> = {
  EfficientFrontier:  dynamic(() => import("@/components/learn/charts/EfficientFrontier"),  { ssr: false }),
  DiversificationEffect: dynamic(() => import("@/components/learn/charts/DiversificationEffect"), { ssr: false }),
  CapitalMarketLine:  dynamic(() => import("@/components/learn/charts/CapitalMarketLine"),  { ssr: false }),
  SecurityMarketLine: dynamic(() => import("@/components/learn/charts/SecurityMarketLine"), { ssr: false }),
  OptionPayoff:       dynamic(() => import("@/components/learn/charts/OptionPayoff"),       { ssr: false }),
  BondPriceDuration:  dynamic(() => import("@/components/learn/charts/BondPriceDuration"),  { ssr: false }),
  RiskReturnScatter:  dynamic(() => import("@/components/learn/charts/RiskReturnScatter"),  { ssr: false }),
};

function renderText(text: string) {
  return text.split("\n\n").map((para, i) => {
    const lines = para.split("\n").map((line, j) => {
      const bold = line.replace(/\*\*(.+?)\*\*/g, '<strong class="text-white font-semibold">$1</strong>');
      const em   = bold.replace(/\*(.+?)\*/g, '<em class="italic text-[#d0d0d0]">$1</em>');
      return <span key={j} dangerouslySetInnerHTML={{ __html: em }} className="block" />;
    });
    return <p key={i} className="text-[#b0b0b0] leading-relaxed text-sm mb-3">{lines}</p>;
  });
}

function ModuleInner({ moduleId }: { moduleId: string }) {
  const mod = getModule(moduleId);
  const router = useRouter();

  if (!mod) return (
    <div className="text-center py-20">
      <p className="text-[#ff4757]">Module introuvable.</p>
      <Link href="/learn" className="text-[#00d97e] text-sm mt-2 inline-block">← Retour aux modules</Link>
    </div>
  );

  const idx  = MODULES.findIndex(m => m.id === moduleId);
  const prev = idx > 0 ? MODULES[idx - 1] : null;
  const next = idx < MODULES.length - 1 ? MODULES[idx + 1] : null;

  return (
    <div className="max-w-4xl">
      {/* Back */}
      <Link href="/learn" className="inline-flex items-center gap-1.5 text-sm text-[#6b7280] hover:text-white transition-colors mb-6">
        <ArrowLeft size={14} /> Tous les modules
      </Link>

      {/* Header */}
      <div className="mb-8 pb-6 border-b border-white/[0.07]">
        <div className="flex items-center gap-2 mb-3">
          <span className="text-xs font-semibold text-[#6b7280] uppercase tracking-wider">Module {mod.number}</span>
          <span className="w-1 h-1 rounded-full bg-[#6b7280]" />
          <span className="text-xs text-[#6b7280] flex items-center gap-1"><Clock size={11} /> {mod.duration}</span>
        </div>
        <h1 className="text-3xl font-bold text-white mb-2">{mod.title}</h1>
        <p className="text-[#6b7280]">{mod.subtitle}</p>
      </div>

      {/* Sections */}
      <div className="space-y-12">
        {mod.sections.map((section, i) => {
          const Chart = section.chart ? CHART_MAP[section.chart] : null;
          return (
            <div key={section.id} id={section.id}>
              <h2 className="text-xl font-semibold text-white mb-4 flex items-center gap-3">
                <span
                  className="w-7 h-7 rounded-lg flex items-center justify-center text-xs font-bold flex-shrink-0"
                  style={{ background: `${mod.color}20`, color: mod.color }}
                >
                  {i + 1}
                </span>
                {section.title}
              </h2>

              <div className="space-y-1 mb-5">{renderText(section.content)}</div>

              {section.formula && (
                <div className="bg-[#0d0d0d] border border-white/[0.07] rounded-xl p-5 mb-5 font-mono text-sm">
                  <p className="text-[10px] text-[#6b7280] uppercase tracking-wider mb-2">Formule clé</p>
                  {section.formula.split("\n").map((line, i) => (
                    <p key={i} className={`${line.startsWith("Où") || line.startsWith("-") || line.startsWith("Example") ? "text-[#6b7280] text-xs" : "text-[#00d97e]"} leading-relaxed`}>
                      {line}
                    </p>
                  ))}
                </div>
              )}

              {Chart && (
                <div className="mb-5">
                  <Chart />
                </div>
              )}

              {section.tip && (
                <div className="border-l-2 border-[#ffd32a] pl-4 py-1 bg-[#ffd32a]/5 rounded-r-lg">
                  <p className="text-xs font-semibold text-[#ffd32a] mb-1">Conseil pratique</p>
                  <p className="text-sm text-[#b0b0b0] leading-relaxed">{section.tip}</p>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Key takeaways */}
      <div className="mt-12 bg-[#111111] border border-white/[0.07] rounded-xl p-6">
        <h3 className="text-sm font-semibold text-white uppercase tracking-wider mb-4 flex items-center gap-2">
          <CheckCircle size={16} className="text-[#00d97e]" /> Points clés à retenir
        </h3>
        <ul className="space-y-2.5">
          {mod.keyTakeaways.map((t, i) => (
            <li key={i} className="flex items-start gap-2.5 text-sm text-[#b0b0b0]">
              <span className="w-1.5 h-1.5 rounded-full bg-[#00d97e] flex-shrink-0 mt-1.5" />
              {t}
            </li>
          ))}
        </ul>
      </div>

      {/* Navigation prev/next */}
      <div className="flex items-center justify-between mt-8 pt-6 border-t border-white/[0.07]">
        {prev ? (
          <Link href={`/learn/${prev.id}`} className="flex items-center gap-2 text-sm text-[#6b7280] hover:text-white transition-colors">
            <ArrowLeft size={14} />
            <div>
              <p className="text-[10px] uppercase tracking-wider">Précédent</p>
              <p className="font-medium">{prev.title}</p>
            </div>
          </Link>
        ) : <div />}
        {next ? (
          <Link href={`/learn/${next.id}`} className="flex items-center gap-2 text-sm text-[#6b7280] hover:text-white transition-colors text-right">
            <div>
              <p className="text-[10px] uppercase tracking-wider">Suivant</p>
              <p className="font-medium">{next.title}</p>
            </div>
            <ArrowRight size={14} />
          </Link>
        ) : <div />}
      </div>
    </div>
  );
}

export default function ModuleContent({ moduleId }: { moduleId: string }) {
  return (
    <PremiumGate feature="Apprendre à investir">
      <ModuleInner moduleId={moduleId} />
    </PremiumGate>
  );
}
