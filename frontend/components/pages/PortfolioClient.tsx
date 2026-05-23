"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { AreaChart, Area, PieChart, Pie, Cell, Tooltip, ResponsiveContainer, XAxis, YAxis } from "recharts";
import MetricCard from "@/components/ui/MetricCard";
import SignalBadge from "@/components/ui/SignalBadge";
import { fetchPortfolio, fmt, fmtPct } from "@/lib/api";

const COLORS = ["#00d97e","#3b82f6","#ffd32a","#ff4757","#a78bfa","#f97316","#06b6d4","#ec4899","#84cc16","#f59e0b"];

const STRATEGY_BLOCKS = [
  {
    title: "Thèse d'investissement",
    body: "Le portefeuille suit une approche quantitative basée sur les signaux d'analyse de Claude AI. Chaque actif reçoit un signal BUY, HOLD ou SELL assorti d'un score de confiance (0–100 %). Seuls les actifs en signal BUY avec une confiance suffisante entrent dans l'allocation.",
  },
  {
    title: "Univers d'investissement",
    body: "Actions mondiales (tech, énergie, santé), crypto-monnaies majeures et matières premières. Les indices boursiers, les obligations et les actifs cotés en JPY sont exclus car non directement investissables ou sujets à des biais de conversion.",
  },
  {
    title: "Règles de diversification",
    body: "Maximum 15 positions simultanées. Aucune catégorie ne peut dépasser 40 % du portefeuille. Limit de 4 actifs par catégorie. En l'absence de signaux BUY, le portefeuille bascule en équipondération sur les actifs éligibles.",
  },
  {
    title: "Rééquilibrage quotidien",
    body: "Le portefeuille est rééquilibré une fois par jour, automatiquement, au moment du premier appel. La valeur totale est recalculée en USD avant redistribution selon les nouveaux poids cibles. L'historique de chaque modification est conservé 60 jours.",
  },
];

function ChangelogEntry({ entry, isLatest }: { entry: any; isLatest: boolean }) {
  const hasChanges =
    entry.added?.length > 0 || entry.removed?.length > 0 || entry.reweighted?.length > 0;

  return (
    <div className={`flex gap-4 pb-5 last:pb-0 relative`}>
      {/* Timeline line */}
      <div className="flex flex-col items-center flex-shrink-0">
        <div
          className={`w-2.5 h-2.5 rounded-full mt-0.5 flex-shrink-0 ${
            isLatest ? "bg-[#00d97e] shadow-[0_0_6px_#00d97e]" : "bg-white/20"
          }`}
        />
        <div className="w-px flex-1 bg-white/[0.06] mt-1" />
      </div>

      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 mb-2">
          <span className="text-xs font-semibold text-white tabular">
            {new Date(entry.date).toLocaleDateString("fr-FR", {
              weekday: "short",
              day: "numeric",
              month: "short",
              year: "numeric",
            })}
          </span>
          {isLatest && (
            <span className="text-[10px] font-semibold uppercase tracking-widest text-[#00d97e] bg-[#00d97e]/10 px-1.5 py-0.5 rounded">
              Aujourd'hui
            </span>
          )}
        </div>

        <p className="text-xs text-[#6b7280] mb-2 leading-relaxed">{entry.summary}</p>

        {hasChanges && (
          <div className="space-y-1.5">
            {entry.added?.length > 0 && (
              <div className="flex flex-wrap gap-1.5">
                {entry.added.map((name: string) => (
                  <span
                    key={name}
                    className="inline-flex items-center gap-1 text-[10px] font-medium text-[#00d97e] bg-[#00d97e]/10 px-2 py-0.5 rounded-full"
                  >
                    + {name}
                  </span>
                ))}
              </div>
            )}
            {entry.removed?.length > 0 && (
              <div className="flex flex-wrap gap-1.5">
                {entry.removed.map((name: string) => (
                  <span
                    key={name}
                    className="inline-flex items-center gap-1 text-[10px] font-medium text-[#ff4757] bg-[#ff4757]/10 px-2 py-0.5 rounded-full"
                  >
                    − {name}
                  </span>
                ))}
              </div>
            )}
            {entry.reweighted?.length > 0 && (
              <div className="flex flex-wrap gap-1.5">
                {entry.reweighted.slice(0, 4).map((r: any) => (
                  <span
                    key={r.name}
                    className="text-[10px] font-medium text-[#ffd32a] bg-[#ffd32a]/10 px-2 py-0.5 rounded-full"
                  >
                    {r.name} {r.old_pct}%→{r.new_pct}%
                  </span>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

export default function PortfolioClient() {
  const [data, setData]       = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [range, setRange]     = useState("Max");

  useEffect(() => {
    fetchPortfolio().then(setData).finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="flex items-center justify-center h-96 text-[#6b7280] text-sm animate-pulse">Chargement du portefeuille...</div>;
  if (!data) return <div className="text-[#ff4757] text-sm">Erreur de chargement.</div>;

  const port      = data.portfolio ?? {};
  const history   = port.history ?? [];
  const changelog = (port.changelog ?? []).slice().reverse(); // du plus récent au plus ancien
  const positions = data.positions ?? [];
  const last      = history[history.length - 1] ?? {};
  const initial   = port.initial_capital ?? 10000;
  const pnl       = (last.total_value ?? initial) - initial;
  const createdAt = port.created_at ? new Date(port.created_at).toLocaleDateString("fr-FR") : "—";

  const rangeMap: Record<string, number> = { "7J": 7, "1M": 30, "3M": 90, "Max": 9999 };
  const chartData = history.slice(-rangeMap[range]).map((h: any) => ({
    date:  h.date,
    value: h.total_value,
    ret:   h.return_pct,
  }));

  const pieData = positions.map((p: any) => ({
    name:  p["Actif"],
    value: p["Valeur ($)"] ?? 0,
  }));

  return (
    <div>
      <div className="mb-8">
        <h1 className="font-serif italic text-3xl font-bold text-white tracking-tight leading-none">Portefeuille</h1>
        <p className="text-[#6b7280] text-sm mt-1.5">Portefeuille fictif · Capital initial {fmt(initial)} $</p>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-8">
        <MetricCard label="Valeur totale" value={`${fmt(last.total_value)} $`} index={0} />
        <MetricCard label="P&L total" value={`${pnl >= 0 ? "+" : ""}${fmt(pnl)} $`} deltaPositive={pnl >= 0} delta={fmtPct(last.return_pct)} index={1} />
        <MetricCard label="Capital initial" value={`${fmt(initial)} $`} index={2} />
        <MetricCard label="Créé le" value={createdAt} index={3} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5 mb-8">
        {/* Performance chart */}
        <div className="lg:col-span-2 bg-[#111111] border border-white/[0.07] rounded-xl p-5">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-sm font-semibold text-white">Performance</h2>
            <div className="flex gap-1">
              {["7J","1M","3M","Max"].map(r => (
                <button key={r} onClick={() => setRange(r)}
                  className={`px-2.5 py-1 rounded text-xs font-medium transition-all ${range === r ? "bg-white text-[#0a0a0a]" : "text-[#6b7280] hover:text-white"}`}>
                  {r}
                </button>
              ))}
            </div>
          </div>
          <ResponsiveContainer width="100%" height={220}>
            <AreaChart data={chartData}>
              <defs>
                <linearGradient id="grad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#00d97e" stopOpacity={0.15} />
                  <stop offset="95%" stopColor="#00d97e" stopOpacity={0} />
                </linearGradient>
              </defs>
              <XAxis dataKey="date" tick={{ fill: "#6b7280", fontSize: 11 }} tickLine={false} axisLine={false} interval="preserveStartEnd" />
              <YAxis tick={{ fill: "#6b7280", fontSize: 11 }} tickLine={false} axisLine={false} tickFormatter={v => `$${(v/1000).toFixed(0)}k`} />
              <Tooltip contentStyle={{ background: "#1a1a1a", border: "1px solid rgba(255,255,255,0.08)", borderRadius: 8, color: "#f5f5f5", fontSize: 12 }} formatter={(v: any) => [`$${Number(v).toLocaleString("fr-FR", {minimumFractionDigits: 0})}`, "Valeur"]} />
              <Area type="monotone" dataKey="value" stroke="#00d97e" strokeWidth={2} fill="url(#grad)" dot={false} />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        {/* Pie chart */}
        <div className="bg-[#111111] border border-white/[0.07] rounded-xl p-5">
          <h2 className="text-sm font-semibold text-white mb-4">Allocation</h2>
          <ResponsiveContainer width="100%" height={180}>
            <PieChart>
              <Pie data={pieData} cx="50%" cy="50%" innerRadius={50} outerRadius={80} dataKey="value" strokeWidth={0}>
                {pieData.map((_: any, i: number) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
              </Pie>
              <Tooltip contentStyle={{ background: "#1a1a1a", border: "1px solid rgba(255,255,255,0.08)", borderRadius: 8, color: "#f5f5f5", fontSize: 12 }} formatter={(v: any) => [`$${Number(v).toFixed(0)}`, ""]} />
            </PieChart>
          </ResponsiveContainer>
          <div className="space-y-1.5 mt-2">
            {pieData.slice(0,6).map((p: any, i: number) => (
              <div key={p.name} className="flex items-center justify-between text-xs">
                <div className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-sm flex-shrink-0" style={{ background: COLORS[i % COLORS.length] }} />
                  <span className="text-[#6b7280] truncate max-w-[100px]">{p.name}</span>
                </div>
                <span className="text-white tabular">{fmt(p.value)} $</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Stratégie + Changelog */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5 mb-8">
        {/* Stratégie — 2/3 de la largeur */}
        <div className="lg:col-span-2 bg-[#111111] border border-white/[0.07] rounded-xl p-5">
          <h2 className="text-sm font-semibold text-white mb-5">Stratégie d'investissement</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {STRATEGY_BLOCKS.map((block) => (
              <div key={block.title} className="bg-white/[0.03] border border-white/[0.05] rounded-lg p-4">
                <h3 className="text-xs font-semibold text-white mb-2 uppercase tracking-wider">{block.title}</h3>
                <p className="text-xs text-[#6b7280] leading-relaxed">{block.body}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Journal des modifications — 1/3 */}
        <div className="bg-[#111111] border border-white/[0.07] rounded-xl p-5">
          <h2 className="text-sm font-semibold text-white mb-5">Journal des modifications</h2>
          {changelog.length === 0 ? (
            <p className="text-xs text-[#6b7280]">Le journal sera alimenté dès le premier rééquilibrage quotidien.</p>
          ) : (
            <div className="overflow-y-auto max-h-[340px] pr-1">
              {changelog.map((entry: any, i: number) => (
                <ChangelogEntry key={entry.date} entry={entry} isLatest={i === 0} />
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Positions table */}
      <div className="bg-[#111111] border border-white/[0.07] rounded-xl overflow-hidden">
        <div className="px-5 py-4 border-b border-white/[0.06]">
          <h2 className="text-sm font-semibold text-white">Positions ({positions.length})</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm min-w-[540px]">
            <thead>
              <tr className="border-b border-white/[0.04]">
                {[
                  { label: "Actif",       hide: false },
                  { label: "Signal",      hide: false },
                  { label: "Poids",       hide: false },
                  { label: "Prix entrée", hide: true  },
                  { label: "Prix actuel", hide: true  },
                  { label: "Valeur",      hide: false },
                  { label: "P&L",         hide: false },
                  { label: "P&L %",       hide: false },
                ].map(({ label, hide }) => (
                  <th key={label} className={`px-4 py-3 text-left text-[10px] font-semibold uppercase tracking-widest text-[#6b7280] ${hide ? "hidden sm:table-cell" : ""}`}>
                    {label}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {positions.map((p: any, i: number) => {
                const pnl = p["P&L ($)"] ?? 0;
                return (
                  <motion.tr key={p["Actif"]} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: i * 0.03 }}
                    className="border-b border-white/[0.03] hover:bg-white/[0.02] transition-colors">
                    <td className="px-4 py-3 font-medium text-white">{p["Actif"]}</td>
                    <td className="px-4 py-3"><SignalBadge signal={p["Signal"]} /></td>
                    <td className="px-4 py-3 text-white/70 tabular">{p["Poids"]}</td>
                    <td className="px-4 py-3 text-white/70 tabular hidden sm:table-cell">{fmt(p["Prix entrée ($)"])}</td>
                    <td className="px-4 py-3 text-white tabular hidden sm:table-cell">{fmt(p["Prix actuel ($)"])}</td>
                    <td className="px-4 py-3 text-white tabular">{fmt(p["Valeur ($)"])}</td>
                    <td className={`px-4 py-3 tabular font-medium ${pnl >= 0 ? "text-[#00d97e]" : "text-[#ff4757]"}`}>{fmt(pnl)}</td>
                    <td className={`px-4 py-3 tabular font-medium ${pnl >= 0 ? "text-[#00d97e]" : "text-[#ff4757]"}`}>{fmtPct(p["P&L (%)"])}</td>
                  </motion.tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
