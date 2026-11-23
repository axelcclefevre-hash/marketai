"use client";

import { useEffect, useState } from "react";
import { AreaChart, Area, PieChart, Pie, Cell, Tooltip, ResponsiveContainer, XAxis, YAxis } from "recharts";
import RiskQuestionnaire from "@/components/auth/RiskQuestionnaire";
import MetricCard from "@/components/ui/MetricCard";
import { fmt, fmtPct } from "@/lib/api";
import { ArrowsClockwise } from "@phosphor-icons/react";

const COLORS = ["#4cc38a","#3b82f6","#d9a441","#e5484d","#a78bfa","#f97316","#06b6d4","#ec4899","#84cc16","#f59e0b"];

const PROFILE_COLORS: Record<string, string> = {
  conservateur: "#3b82f6",
  equilibre: "#4cc38a",
  croissance: "#d9a441",
  agressif: "#e5484d",
};

export default function MyPortfolioClient() {
  const [portfolio, setPortfolio] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);
  const [showQuestionnaire, setShowQuestionnaire] = useState(false);

  const load = async () => {
    setLoading(true);
    const res = await fetch("/api/user/portfolio");
    if (res.ok) {
      const d = await res.json();
      setPortfolio(d.portfolio);
    }
    setLoading(false);
  };

  useEffect(() => { load(); }, []);

  const handleCreatePortfolio = async (risk_profile: string) => {
    setCreating(true);
    setShowQuestionnaire(false);
    const res = await fetch("/api/user/portfolio/create", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ risk_profile, initial_capital: 10000 }),
    });
    if (res.ok) {
      const d = await res.json();
      setPortfolio(d.portfolio);
    }
    setCreating(false);
  };

  if (loading) return <div className="text-muted text-sm animate-pulse">Chargement...</div>;

  if (creating) return (
    <div className="text-center py-20">
      <div className="text-muted text-sm animate-pulse mb-2">Claude construit ton portefeuille...</div>
      <p className="text-xs text-muted/60">Via `claude -p` en local, compte 30 à 90 secondes</p>
    </div>
  );

  if (showQuestionnaire) return (
    <div>
      <h1 className="text-2xl font-medium text-primary mb-6">Définir mon profil de risque</h1>
      <RiskQuestionnaire onComplete={handleCreatePortfolio} />
    </div>
  );

  if (!portfolio) return (
    <div className="text-center py-20">
      <h1 className="text-2xl font-medium text-primary mb-3">Ton portefeuille personnel</h1>
      <p className="text-sm text-muted mb-8 max-w-md mx-auto">
        Réponds à quelques questions pour que Claude construise un portefeuille adapté à ton profil de risque.
      </p>
      <button
        onClick={() => setShowQuestionnaire(true)}
        className="px-6 py-3 bg-buy text-bg rounded-lg text-sm font-medium hover:bg-buy/90 transition-colors"
      >
        Commencer le questionnaire
      </button>
    </div>
  );

  const positions = portfolio.positions ?? [];
  const history   = portfolio.history ?? [];
  const last      = history[history.length - 1] ?? {};
  const initial   = portfolio.initial_capital ?? 10000;
  const pnl       = (last.total_value ?? initial) - initial;
  const profileColor = PROFILE_COLORS[portfolio.risk_profile] ?? "#4cc38a";

  const chartData = history.map((h: any) => ({ date: h.date, value: h.total_value }));
  const pieData   = positions.map((p: any) => ({ name: p.name, value: p.current_value ?? p.capital_usd }));

  return (
    <div>
      <div className="flex items-start justify-between mb-6">
        <div>
          <h1 className="text-2xl font-medium text-primary">Mon portefeuille</h1>
          <div className="flex items-center gap-2 mt-1">
            <span className="w-2 h-2 rounded-full" style={{ background: profileColor }} />
            <span className="text-sm text-muted">Profil {portfolio.profile_label ?? portfolio.risk_profile}</span>
          </div>
          {portfolio.strategy_summary && (
            <p className="text-xs text-muted mt-1 italic max-w-lg">{portfolio.strategy_summary}</p>
          )}
        </div>
        <button onClick={() => setShowQuestionnaire(true)} className="flex items-center gap-1.5 text-xs text-muted hover:text-primary transition-colors">
          <ArrowsClockwise size={13} /> Reconfigurer
        </button>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-6">
        <MetricCard label="Valeur totale" value={`${fmt(last.total_value)} $`} index={0} />
        <MetricCard label="P&L" value={`${pnl >= 0 ? "+" : ""}${fmt(pnl)} $`} delta={fmtPct(last.return_pct)} deltaPositive={pnl >= 0} index={1} />
        <MetricCard label="Capital initial" value={`${fmt(initial)} $`} index={2} />
        <MetricCard label="Positions" value={String(positions.length)} index={3} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5 mb-6">
        <div className="lg:col-span-2 card p-5">
          <h2 className="text-sm font-medium text-primary mb-4">Performance</h2>
          <ResponsiveContainer width="100%" height={200}>
            <AreaChart data={chartData}>
              <defs>
                <linearGradient id="myPortGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor={profileColor} stopOpacity={0.15} />
                  <stop offset="95%" stopColor={profileColor} stopOpacity={0} />
                </linearGradient>
              </defs>
              <XAxis dataKey="date" tick={{ fill: "#85858b", fontSize: 10 }} tickLine={false} axisLine={false} interval="preserveStartEnd" />
              <YAxis tick={{ fill: "#85858b", fontSize: 10 }} tickLine={false} axisLine={false} />
              <Tooltip contentStyle={{ background: "#232325", border: "1px solid rgba(255,255,255,0.08)", borderRadius: 8, color: "#ededed", fontSize: 12 }} />
              <Area type="monotone" dataKey="value" stroke={profileColor} strokeWidth={2} fill="url(#myPortGrad)" dot={false} />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        <div className="card p-5">
          <h2 className="text-sm font-medium text-primary mb-3">Allocation</h2>
          <ResponsiveContainer width="100%" height={140}>
            <PieChart>
              <Pie data={pieData} cx="50%" cy="50%" innerRadius={40} outerRadius={65} dataKey="value" strokeWidth={0}>
                {pieData.map((_: any, i: number) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
              </Pie>
              <Tooltip contentStyle={{ background: "#232325", border: "1px solid rgba(255,255,255,0.08)", borderRadius: 8, color: "#ededed", fontSize: 11 }} formatter={(v: any) => [`$${Number(v).toFixed(0)}`]} />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="card overflow-hidden">
        <div className="px-5 py-3 border-b border-white/[0.05]">
          <h2 className="text-sm font-medium text-primary">Positions</h2>
        </div>
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-white/[0.04]">
              {["Actif", "Catégorie", "Signal", "Poids", "Capital", "Rationale"].map(h => (
                <th key={h} className="px-4 py-2.5 text-left text-xs font-medium text-muted">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {positions.map((p: any, i: number) => (
              <tr key={p.name} className="border-b border-white/[0.03] hover:bg-white/[0.01]">
                <td className="px-4 py-3 font-medium text-primary">{p.name}</td>
                <td className="px-4 py-3 text-xs text-muted">{p.category}</td>
                <td className="px-4 py-3">
                  <span className={`text-xs font-medium ${p.signal === "BUY" ? "text-buy" : p.signal === "SELL" ? "text-sell" : "text-hold"}`}>{p.signal}</span>
                </td>
                <td className="px-4 py-3 text-primary/70 tabular">{(p.weight * 100).toFixed(1)}%</td>
                <td className="px-4 py-3 text-primary tabular">{fmt(p.capital_usd)} $</td>
                <td className="px-4 py-3 text-xs text-muted max-w-[200px] truncate">{p.rationale}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
