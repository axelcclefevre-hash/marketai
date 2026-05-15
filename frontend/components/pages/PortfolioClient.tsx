"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { AreaChart, Area, PieChart, Pie, Cell, Tooltip, ResponsiveContainer, XAxis, YAxis } from "recharts";
import MetricCard from "@/components/ui/MetricCard";
import SignalBadge from "@/components/ui/SignalBadge";
import { fetchPortfolio, fmt, fmtPct } from "@/lib/api";

const COLORS = ["#00d97e","#3b82f6","#ffd32a","#ff4757","#a78bfa","#f97316","#06b6d4","#ec4899","#84cc16","#f59e0b"];

export default function PortfolioClient() {
  const [data, setData]     = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [range, setRange]   = useState("Max");

  useEffect(() => {
    fetchPortfolio().then(setData).finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="flex items-center justify-center h-96 text-[#6b7280] text-sm animate-pulse">Chargement du portefeuille...</div>;
  if (!data) return <div className="text-[#ff4757] text-sm">Erreur de chargement.</div>;

  const port      = data.portfolio ?? {};
  const history   = port.history ?? [];
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

      {/* Positions table */}
      <div className="bg-[#111111] border border-white/[0.07] rounded-xl overflow-hidden">
        <div className="px-5 py-4 border-b border-white/[0.06]">
          <h2 className="text-sm font-semibold text-white">Positions ({positions.length})</h2>
        </div>
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-white/[0.04]">
              {["Actif","Signal","Poids","Prix entrée","Prix actuel","Valeur","P&L","P&L %"].map(h => (
                <th key={h} className="px-4 py-3 text-left text-[10px] font-semibold uppercase tracking-widest text-[#6b7280]">{h}</th>
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
                  <td className="px-4 py-3 text-white/70 tabular">{fmt(p["Prix entrée ($)"])}</td>
                  <td className="px-4 py-3 text-white tabular">{fmt(p["Prix actuel ($)"])}</td>
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
  );
}
