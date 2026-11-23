"use client";

import { useEffect, useState } from "react";
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, ReferenceLine, AreaChart, Area } from "recharts";
import MetricCard from "@/components/ui/MetricCard";
import { fetchMarketData, runBacktest, fmt, fmtPct } from "@/lib/api";

const STRATEGIES = [
  { value: "sma",  label: "SMA Crossover" },
  { value: "rsi",  label: "RSI Mean Reversion" },
  { value: "macd", label: "MACD Signal" },
];

const PERIODS = [
  { value: 90, label: "90 jours" },
  { value: 60, label: "60 jours" },
  { value: 30, label: "30 jours" },
];

export default function BacktestClient() {
  const [assets, setAssets]       = useState<string[]>([]);
  const [asset, setAsset]         = useState("");
  const [strategy, setStrategy]   = useState("sma");
  const [period, setPeriod]       = useState(90);
  const [result, setResult]       = useState<any>(null);
  const [loading, setLoading]     = useState(false);
  const [running, setRunning]     = useState(false);

  useEffect(() => {
    setLoading(true);
    fetch("/api/market-data", { cache: "no-store" })
      .then(r => r.json())
      .then(d => {
        const names = Object.keys(d.assets ?? {}).filter((n: string) => !d.assets[n]?.error && d.assets[n]?.prices?.length > 0);
        setAssets(names);
        if (names.length) setAsset(names[0]);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const handleRun = async () => {
    if (!asset) return;
    setRunning(true);
    try {
      const r = await runBacktest(asset, strategy, period);
      setResult(r);
    } catch {
      setResult(null);
    } finally {
      setRunning(false);
    }
  };

  const metrics = result?.metrics;
  const chartData = result
    ? result.dates.map((d: string, i: number) => ({
        date:      d,
        strategy:  result.portfolio_norm[i],
        benchmark: result.benchmark_norm[i],
      }))
    : [];

  const ddData = result
    ? result.dates.map((d: string, i: number) => {
        const peak = Math.max(...result.portfolio.slice(0, i + 1));
        const dd = ((result.portfolio[i] - peak) / peak) * 100;
        return { date: d, drawdown: dd };
      })
    : [];

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl font-medium text-primary tracking-tight">Backtesting</h1>
        <p className="text-muted text-sm mt-1.5">Simulation de stratégies techniques</p>
      </div>

      {/* Controls */}
      <div className="flex flex-wrap gap-3 mb-6">
        <select value={asset} onChange={e => setAsset(e.target.value)}
          className="bg-surface border border-white/[0.08] rounded-lg px-3 py-2 text-sm text-primary focus:outline-none focus:border-white/20">
          {assets.map(a => <option key={a} value={a}>{a}</option>)}
        </select>
        <select value={strategy} onChange={e => setStrategy(e.target.value)}
          className="bg-surface border border-white/[0.08] rounded-lg px-3 py-2 text-sm text-primary focus:outline-none focus:border-white/20">
          {STRATEGIES.map(s => <option key={s.value} value={s.value}>{s.label}</option>)}
        </select>
        <select value={period} onChange={e => setPeriod(Number(e.target.value))}
          className="bg-surface border border-white/[0.08] rounded-lg px-3 py-2 text-sm text-primary focus:outline-none focus:border-white/20">
          {PERIODS.map(p => <option key={p.value} value={p.value}>{p.label}</option>)}
        </select>
        <button onClick={handleRun} disabled={running || loading}
          className="px-5 py-2 bg-white text-bg rounded-lg text-sm font-medium hover:bg-white/90 active:scale-[0.97] transition-colors disabled:opacity-40">
          {running ? "En cours..." : "Lancer"}
        </button>
      </div>

      {metrics && (
        <>
          <div className="grid grid-cols-2 lg:grid-cols-6 gap-3 mb-6">
            <MetricCard label="Stratégie" value={fmtPct(metrics.return_pct)} deltaPositive={metrics.return_pct >= 0} index={0} />
            <MetricCard label="Buy & Hold" value={fmtPct(metrics.benchmark_return_pct)} deltaPositive={metrics.benchmark_return_pct >= 0} index={1} />
            <MetricCard label="Alpha" value={fmtPct((metrics.return_pct ?? 0) - (metrics.benchmark_return_pct ?? 0))} deltaPositive={(metrics.return_pct ?? 0) >= (metrics.benchmark_return_pct ?? 0)} index={2} />
            <MetricCard label="Max Drawdown" value={fmtPct(metrics.max_drawdown_pct)} deltaPositive={false} index={3} />
            <MetricCard label="Sharpe" value={fmt(metrics.sharpe, 2)} index={4} />
            <MetricCard label="Trades / Win" value={`${metrics.n_trades} / ${fmt(metrics.win_rate_pct, 0)}%`} index={5} />
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-5 mb-6">
            <div className="card p-5">
              <h2 className="text-sm font-medium text-primary mb-4">Performance normalisée (base 100)</h2>
              <ResponsiveContainer width="100%" height={240}>
                <LineChart data={chartData} margin={{ bottom: 28, left: 4, right: 8 }}>
                  <XAxis dataKey="date" tick={{ fill: "#85858b", fontSize: 10 }} tickLine={false} axisLine={false} interval="preserveStartEnd" />
                  <YAxis tick={{ fill: "#85858b", fontSize: 10 }} tickLine={false} axisLine={false} domain={["auto", "auto"]} />
                  <Tooltip contentStyle={{ background: "#232325", border: "1px solid rgba(255,255,255,0.08)", borderRadius: 8, color: "#ededed", fontSize: 12 }} />
                  <ReferenceLine y={100} stroke="rgba(255,255,255,0.1)" strokeDasharray="4 4" />
                  <Line isAnimationActive={false} type="monotone" dataKey="strategy" stroke="#4cc38a" strokeWidth={2} dot={false} name="Stratégie" />
                  <Line isAnimationActive={false} type="monotone" dataKey="benchmark" stroke="#85858b" strokeWidth={1.5} dot={false} strokeDasharray="4 4" name="Buy & Hold" />
                </LineChart>
              </ResponsiveContainer>
            </div>

            <div className="card p-5">
              <h2 className="text-sm font-medium text-primary mb-4">Drawdown</h2>
              <ResponsiveContainer width="100%" height={240}>
                <AreaChart data={ddData} margin={{ bottom: 28, left: 4, right: 8 }}>
                  <defs>
                    <linearGradient id="ddGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#e5484d" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="#e5484d" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <XAxis dataKey="date" tick={{ fill: "#85858b", fontSize: 10 }} tickLine={false} axisLine={false} interval="preserveStartEnd" />
                  <YAxis tick={{ fill: "#85858b", fontSize: 10 }} tickLine={false} axisLine={false} tickFormatter={v => `${v.toFixed(0)}%`} domain={["auto", 2]} />
                  <Tooltip contentStyle={{ background: "#232325", border: "1px solid rgba(255,255,255,0.08)", borderRadius: 8, color: "#ededed", fontSize: 12 }} formatter={(v: any) => [`${Number(v).toFixed(2)}%`, "Drawdown"]} />
                  <Area isAnimationActive={false} type="monotone" dataKey="drawdown" stroke="#e5484d" strokeWidth={1.5} fill="url(#ddGrad)" dot={false} />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>
        </>
      )}

      {!result && !running && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {[
            { name: "SMA Crossover", desc: "Croise les moyennes mobiles courte et longue pour détecter les tendances. Achat quand la SMA courte passe au-dessus de la longue.", color: "#4cc38a" },
            { name: "RSI Mean Reversion", desc: "Achète en zone de survente (RSI < 30) et vend en zone de surachat (RSI > 70). Idéal pour les marchés oscillants.", color: "#3b82f6" },
            { name: "MACD Signal", desc: "Suit les croisements entre la ligne MACD et sa ligne de signal pour anticiper les retournements de tendance.", color: "#d9a441" },
          ].map(s => (
            <div key={s.name} className="card p-6">
              <div className="w-2 h-2 rounded-full mb-3" style={{ background: s.color }} />
              <h3 className="text-sm font-medium text-primary mb-2">{s.name}</h3>
              <p className="text-xs text-muted leading-relaxed">{s.desc}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
