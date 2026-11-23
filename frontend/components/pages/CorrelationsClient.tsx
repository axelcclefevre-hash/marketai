"use client";

import { useEffect, useState } from "react";
import { fetchCorrelationMatrix } from "@/lib/api";

// Échelle continue : intensité proportionnelle à |corr| (gris clair = positif, rouge = négatif)
function getColor(val: number) {
  const a = Math.min(Math.abs(val), 1) * 0.55;
  return val >= 0 ? `rgba(237,237,237,${a * 0.6})` : `rgba(229,72,77,${a})`;
}

export default function CorrelationsClient() {
  const [data, setData]     = useState<{ labels: string[]; matrix: number[][] } | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchCorrelationMatrix().then(setData).finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="flex items-center justify-center h-96 text-muted text-sm animate-pulse">Calcul des corrélations...</div>;
  if (!data)   return <div className="text-sell text-sm">Erreur de chargement.</div>;

  const { labels, matrix } = data;

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl font-medium text-primary tracking-tight">Corrélations</h1>
        <p className="text-muted text-sm mt-1.5">Matrice de corrélation de Pearson · 35 derniers jours</p>
      </div>

      <div className="card p-5 overflow-x-auto">
        <table className="text-xs border-separate" style={{ borderSpacing: 2 }}>
          <thead>
            <tr>
              <th className="w-24" />
              {labels.map(l => (
                <th key={l} className="text-muted font-medium pb-2 px-1 text-right whitespace-nowrap max-w-[60px] truncate">
                  <span style={{ writingMode: "vertical-rl", transform: "rotate(180deg)", display: "inline-block" }}>{l}</span>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {matrix.map((row, i) => (
              <tr key={labels[i]}>
                <td className="text-muted font-medium pr-2 text-right whitespace-nowrap">{labels[i]}</td>
                {row.map((val, j) => (
                  <td
                    key={j}
                    title={`${labels[i]} / ${labels[j]}: ${val?.toFixed(2) ?? "—"}`}
                    className="w-8 h-8 text-center tabular text-primary rounded"
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

      <div className="mt-4 flex items-center gap-4 text-xs text-muted">
        <div className="flex items-center gap-2">
          <span className="w-3 h-3 rounded-sm bg-buy" /> Forte corrélation positive (&gt; 0.7)
        </div>
        <div className="flex items-center gap-2">
          <span className="w-3 h-3 rounded-sm bg-sell" /> Forte corrélation négative (&lt; -0.4)
        </div>
      </div>
    </div>
  );
}
