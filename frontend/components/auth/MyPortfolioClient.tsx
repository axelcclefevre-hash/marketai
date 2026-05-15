"use client";

import { useSession } from "next-auth/react";
import { useEffect, useState } from "react";
import { AreaChart, Area, PieChart, Pie, Cell, Tooltip, ResponsiveContainer, XAxis, YAxis } from "recharts";
import PremiumGate from "@/components/ui/PremiumGate";
import RiskQuestionnaire from "@/components/auth/RiskQuestionnaire";
import MetricCard from "@/components/ui/MetricCard";
import { fmt, fmtPct } from "@/lib/api";
import { ArrowsClockwise } from "@phosphor-icons/react";

const COLORS = ["#00d97e","#3b82f6","#ffd32a","#ff4757","#a78bfa","#f97316","#06b6d4","#ec4899","#84cc16","#f59e0b"];

const PROFILE_COLORS: Record<string, string> = {
  conservateur: "#3b82f6",
  equilibre: "#00d97e",
  croissance: "#ffd32a",
  agressif: "#ff4757",
};

export default function MyPortfolioClient() {
  const { data: session } = useSession();
  const user = session?.user as any;

  return (
    <PremiumGate feature="Portefeuille personnel">
      <PortfolioContent token={user?.apiToken} />
    </PremiumGate>
  );
}

function PortfolioContent({ token }: { token: string }) {
  const [portfolio, setPortfolio] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);
  const [showQuestionnaire, setShowQuestionnaire] = useState(false);

  const load = async () => {
    setLoading(true);
    const res = await fetch("/api/user/portfolio", { headers: { Authorization: `Bearer ${token}` } });
    if (res.ok) {
      const d = await res.json();
      setPortfolio(d.portfolio);
    }
    setLoading(false);
  };

  useEffect(() => { if (token) load(); }, [token]);

  const handleCreatePortfolio = async (risk_profile: string) => {
    setCreating(true);
    setShowQuestionnaire(false);
    const res = await fetch("/api/user/portfolio/create", {
      method: "POST",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
      body: JSON.stringify({ risk_profile, initial_capital: 10000 }),
    });
    if (res.ok) {
      const d = await res.json();
      setPortfolio(d.portfolio);
    }
    setCreating(false);
  };

  if (loading) return <div className="text-[#6b7280] text-sm animate-pulse">Chargement...</div>;

  if (creating) return (
    <div className="text-center py-20">
      <div className="text-[#6b7280] text-sm animate-pulse mb-2">Claude construit ton portefeuille...</div>
      <p className="text-xs text-[#6b7280]/60">Analyse des signaux en cours (30-60 secondes)</p>
    </div>
  );

  if (showQuestionnaire) return (
    <div>
      <h1 className="text-2xl font-bold text-white mb-6">Définir mon profil de risque</h1>
      <RiskQuestionnaire onComplete={handleCreatePortfolio} />
    </div>
  );

  if (!portfolio) return (
    <div className="text-center py-20">
      <h1 className="text-2xl font-bold text-white mb-3">Ton portefeuille personnel</h1>
      <p className="text-sm text-[#6b7280] mb-8 max-w-md mx-auto">
        Réponds à quelques questions pour que Claude construise un portefeuille adapté à ton profil de risque.
      </p>
      <button
        onClick={() => setShowQuestionnaire(true)}
        className="px-6 py-3 bg-[#00d97e] text-[#0a0a0a] rounded-lg text-sm font-semibold hover:bg-[#00d97e]/90 transition-colors"
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
  const profileColor = PROFILE_COLORS[portfolio.risk_profile] ?? "#00d97e";

  const chartData = history.map((h: any) => ({ date: h.date, value: h.total_value }));
  const pieData   = positions.map((p: any) => ({ name: p.name, value: p.current_value ?? p.capital_usd }));

  return (
    <div>
      <div className="flex items-start justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-white">Mon portefeuille</h1>
          <div className="flex items-center gap-2 mt-1">
            <span className="w-2 h-2 rounded-full" style={{ background: profileColor }} />
            <span className="text-sm text-[#6b7280]">Profil {portfolio.profile_label ?? portfolio.risk_profile}</span>
          </div>
          {portfolio.strategy_summary && (
            <p className="text-xs text-[#6b7280] mt-1 italic max-w-lg">{portfolio.strategy_summary}</p>
          )}
        </div>
        <button onClick={() => setShowQuestionnaire(true)} className="flex items-center gap-1.5 text-xs text-[#6b7280] hover:text-white transition-colors">
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
        <div className="lg:col-span-2 bg-[#111111] border border-white/[0.07] rounded-xl p-5">
          <h2 className="text-sm font-semibold text-white mb-4">Performance</h2>
          <ResponsiveContainer width="100%" height={200}>
            <AreaChart data={chartData}>
              <defs>
                <linearGradient id="myPortGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor={profileColor} stopOpacity={0.15} />
                  <stop offset="95%" stopColor={profileColor} stopOpacity={0} />
                </linearGradient>
              </defs>
              <XAxis dataKey="date" tick={{ fill: "#6b7280", fontSize: 10 }} tickLine={false} axisLine={false} interval="preserveStartEnd" />
              <YAxis tick={{ fill: "#6b7280", fontSize: 10 }} tickLine={false} axisLine={false} />
              <Tooltip contentStyle={{ background: "#1a1a1a", border: "1px solid rgba(255,255,255,0.08)", borderRadius: 8, color: "#f5f5f5", fontSize: 12 }} />
              <Area type="monotone" dataKey="value" stroke={profileColor} strokeWidth={2} fill="url(#myPortGrad)" dot={false} />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        <div className="bg-[#111111] border border-white/[0.07] rounded-xl p-5">
          <h2 className="text-sm font-semibold text-white mb-3">Allocation</h2>
          <ResponsiveContainer width="100%" height={140}>
            <PieChart>
              <Pie data={pieData} cx="50%" cy="50%" innerRadius={40} outerRadius={65} dataKey="value" strokeWidth={0}>
                {pieData.map((_: any, i: number) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
              </Pie>
              <Tooltip contentStyle={{ background: "#1a1a1a", border: "1px solid rgba(255,255,255,0.08)", borderRadius: 8, color: "#f5f5f5", fontSize: 11 }} formatter={(v: any) => [`$${Number(v).toFixed(0)}`]} />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="bg-[#111111] border border-white/[0.07] rounded-xl overflow-hidden">
        <div className="px-5 py-3 border-b border-white/[0.05]">
          <h2 className="text-sm font-semibold text-white">Positions</h2>
        </div>
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-white/[0.04]">
              {["Actif", "Catégorie", "Signal", "Poids", "Capital", "Rationale"].map(h => (
                <th key={h} className="px-4 py-2.5 text-left text-[10px] font-semibold uppercase tracking-widest text-[#6b7280]">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {positions.map((p: any, i: number) => (
              <tr key={p.name} className="border-b border-white/[0.03] hover:bg-white/[0.01]">
                <td className="px-4 py-3 font-medium text-white">{p.name}</td>
                <td className="px-4 py-3 text-xs text-[#6b7280]">{p.category}</td>
                <td className="px-4 py-3">
                  <span className={`text-xs font-semibold ${p.signal === "BUY" ? "text-[#00d97e]" : p.signal === "SELL" ? "text-[#ff4757]" : "text-[#ffd32a]"}`}>{p.signal}</span>
                </td>
                <td className="px-4 py-3 text-white/70 tabular">{(p.weight * 100).toFixed(1)}%</td>
                <td className="px-4 py-3 text-white tabular">{fmt(p.capital_usd)} $</td>
                <td className="px-4 py-3 text-xs text-[#6b7280] max-w-[200px] truncate">{p.rationale}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
