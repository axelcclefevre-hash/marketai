"use client";

import { useEffect, useState } from "react";
import { fetchCorrelationMatrix } from "@/lib/api";

function getColor(val: number) {
  if (val >= 0.7)  return "rgba(0,217,126,0.70)";
  if (val >= 0.4)  return "rgba(0,217,126,0.30)";
  if (val >= 0.1)  return "rgba(255,255,255,0.06)";
  if (val >= -0.1) return "rgba(255,255,255,0.02)";
  if (val >= -0.4) return "rgba(255,71,87,0.20)";
  return "rgba(255,71,87,0.50)";
}

export default function CorrelationsClient() {
  const [data, setData]     = useState<{ labels: string[]; matrix: number[][] } | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchCorrelationMatrix().then(setData).finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="flex items-center justify-center h-96 text-[#6b7280] text-sm animate-pulse">Calcul des corrélations...</div>;
  if (!data)   return <div className="text-[#ff4757] text-sm">Erreur de chargement.</div>;

  const { labels, matrix } = data;

  return (
    <div>
      <div className="mb-8">
        <h1 className="font-serif italic text-3xl font-bold text-white tracking-tight leading-none">Corrélations</h1>
        <p className="text-[#6b7280] text-sm mt-1.5">Matrice de corrélation de Pearson · 35 derniers jours</p>
      </div>

      <div className="bg-[#111111] border border-white/[0.07] rounded-xl p-5 overflow-x-auto">
        <table className="text-xs border-separate" style={{ borderSpacing: 2 }}>
          <thead>
            <tr>
              <th className="w-24" />
              {labels.map(l => (
                <th key={l} className="text-[#6b7280] font-medium pb-2 px-1 text-right whitespace-nowrap max-w-[60px] truncate">
                  <span style={{ writingMode: "vertical-rl", transform: "rotate(180deg)", display: "inline-block" }}>{l}</span>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {matrix.map((row, i) => (
              <tr key={labels[i]}>
                <td className="text-[#6b7280] font-medium pr-2 text-right whitespace-nowrap">{labels[i]}</td>
                {row.map((val, j) => (
                  <td
                    key={j}
                    title={`${labels[i]} / ${labels[j]}: ${val?.toFixed(2) ?? "—"}`}
                    className="w-8 h-8 text-center tabular text-white rounded"
                    style={{ background: getColor(val ?? 0), fontSize: 9 }}
                  >
                    {val != null ? val.toFixed(2) : "—"}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="mt-4 flex items-center gap-4 text-xs text-[#6b7280]">
        <div className="flex items-center gap-2">
          <span className="w-3 h-3 rounded-sm bg-[#00d97e]" /> Forte corrélation positive (&gt; 0.7)
        </div>
        <div className="flex items-center gap-2">
          <span className="w-3 h-3 rounded-sm bg-[#ff4757]" /> Forte corrélation négative (&lt; -0.4)
        </div>
      </div>
    </div>
  );
}
