"use client";

import { useEffect, useState } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { ArrowsClockwise, ArrowSquareOut } from "@phosphor-icons/react";

type NewsItem = { title: string; source: string; url?: string };

async function fetchMacroFull(force = false) {
  const url = `/api/macro-report${force ? "?force=true" : ""}`;
  const res = await fetch(url, { cache: "no-store" });
  if (!res.ok) throw new Error("Failed");
  return res.json() as Promise<{ report: string; news: NewsItem[] }>;
}

export default function MacroClient() {
  const [report, setReport]   = useState("");
  const [news, setNews]       = useState<NewsItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [regen, setRegen]     = useState(false);

  const load = async (force = false) => {
    try {
      if (force) setRegen(true);
      const d = await fetchMacroFull(force);
      setReport(d.report ?? "");
      setNews(d.news ?? []);
    } finally {
      setLoading(false);
      setRegen(false);
    }
  };

  useEffect(() => { load(); }, []);

  return (
    <div>
      {/* Header */}
      <div className="flex items-start justify-between mb-8">
        <div>
          <h1 className="font-serif italic text-3xl font-bold text-white tracking-tight leading-none">
            Rapport macro
          </h1>
          <p className="text-[#6b7280] text-sm mt-1.5">
            Analyse géopolitique & économique · Généré par Claude
          </p>
        </div>
        <button
          onClick={() => load(true)}
          disabled={regen || loading}
          className="flex items-center gap-2 px-3 py-2 bg-white/[0.04] hover:bg-white/[0.08] border border-white/[0.08] rounded-lg text-sm text-[#6b7280] hover:text-white transition-all disabled:opacity-40"
        >
          <ArrowsClockwise size={14} className={regen ? "animate-spin" : ""} />
          <span className="hidden sm:block">Regénérer</span>
        </button>
      </div>

      {loading ? (
        <div className="space-y-3 animate-pulse max-w-3xl">
          <div className="h-5 bg-white/[0.06] rounded w-1/3" />
          {[...Array(6)].map((_, i) => (
            <div key={i} className="h-4 bg-white/[0.04] rounded" style={{ width: `${65 + Math.random() * 30}%` }} />
          ))}
        </div>
      ) : (
        <>
          {/* Rapport — pleine largeur, layout 2 colonnes internes */}
          <div className="grid grid-cols-1 xl:grid-cols-3 gap-6 mb-8">
            {/* Rapport markdown — 2/3 de la largeur */}
            <div className="xl:col-span-2 bg-[#111111] border border-white/[0.07] rounded-xl p-7">
              <ReactMarkdown
                remarkPlugins={[remarkGfm]}
                components={{
                  h2: ({ children }) => (
                    <h2 className="text-sm font-semibold text-white uppercase tracking-widest mt-7 mb-3 first:mt-0 flex items-center gap-2 before:content-[''] before:block before:w-3 before:h-px before:bg-[#00d97e]">
                      {children}
                    </h2>
                  ),
                  strong: ({ children }) => (
                    <strong className="text-white font-semibold">{children}</strong>
                  ),
                  p: ({ children }) => (
                    <p className="text-[#b0b0b0] leading-relaxed text-sm mb-4">{children}</p>
                  ),
                  ul: ({ children }) => (
                    <ul className="space-y-1.5 mb-4 pl-0">{children}</ul>
                  ),
                  li: ({ children }) => (
                    <li className="text-[#b0b0b0] text-sm leading-relaxed flex gap-2">
                      <span className="text-[#00d97e] mt-1 flex-shrink-0">›</span>
                      <span>{children}</span>
                    </li>
                  ),
                }}
              >
                {report}
              </ReactMarkdown>
            </div>

            {/* Panneau droit : infos synthèse + sources */}
            <div className="space-y-4">
              {/* Badge sentiment */}
              <div className="bg-[#111111] border border-white/[0.07] rounded-xl p-5">
                <p className="text-[10px] font-semibold text-[#6b7280] uppercase tracking-widest mb-3">Sources de données</p>
                {[
                  { label: "Prix & indices", value: "Yahoo Finance" },
                  { label: "Crypto", value: "CoinGecko" },
                  { label: "Macro US", value: "FRED" },
                  { label: "Analyse IA", value: "Claude (Anthropic)" },
                  { label: "Actualités", value: news.length > 0 ? `${news.length} articles` : "RSS Finance" },
                ].map(({ label, value }) => (
                  <div key={label} className="flex items-center justify-between py-2 border-b border-white/[0.04] last:border-0">
                    <span className="text-xs text-[#6b7280]">{label}</span>
                    <span className="text-xs text-white font-medium">{value}</span>
                  </div>
                ))}
              </div>

              {/* Disclaimer */}
              <div className="bg-[#ffd32a]/5 border border-[#ffd32a]/15 rounded-xl p-4">
                <p className="text-[11px] text-[#ffd32a]/80 leading-relaxed">
                  Ce rapport est généré automatiquement par IA à des fins d&apos;information. Il ne constitue pas un conseil en investissement.
                </p>
              </div>
            </div>
          </div>

          {/* Actualités — grille pleine largeur en bas */}
          {news.length > 0 && (
            <div>
              <p className="text-[10px] font-semibold text-[#6b7280] uppercase tracking-widest mb-4">
                Actualités utilisées pour l&apos;analyse
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3">
                {news.map((n, i) => (
                  <a
                    key={i}
                    href={n.url || "#"}
                    target={n.url ? "_blank" : "_self"}
                    rel="noopener noreferrer"
                    className="group bg-[#111111] border border-white/[0.07] hover:border-white/[0.14] rounded-xl p-4 transition-all hover:bg-[#161616]"
                  >
                    <div className="flex items-start justify-between gap-2 mb-2">
                      <p className="text-sm text-[#d0d0d0] leading-snug group-hover:text-white transition-colors line-clamp-3">
                        {n.title}
                      </p>
                      {n.url && (
                        <ArrowSquareOut size={13} className="flex-shrink-0 text-[#6b7280] group-hover:text-[#00d97e] mt-0.5 transition-colors" />
                      )}
                    </div>
                    <span className="text-[10px] text-[#6b7280] font-medium uppercase tracking-wider">
                      {n.source}
                    </span>
                  </a>
                ))}
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}
