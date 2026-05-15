"use client";

import { useEffect, useState } from "react";
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, BarChart, Bar, ReferenceLine } from "recharts";
import MetricCard from "@/components/ui/MetricCard";
import SignalBadge from "@/components/ui/SignalBadge";
import { fetchMarketData, fmt, fmtPct } from "@/lib/api";
import { ArrowLeft } from "@phosphor-icons/react";
import Link from "next/link";

export default function AssetClient({ assetName }: { assetName: string }) {
  const [asset, setAsset]   = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchMarketData().then(d => {
      setAsset(d.assets?.[assetName] ?? null);
    }).finally(() => setLoading(false));
  }, [assetName]);

  if (loading) return <div className="flex items-center justify-center h-96 text-[#6b7280] text-sm animate-pulse">Chargement...</div>;
  if (!asset)  return <div className="text-[#ff4757] text-sm">Actif introuvable : {assetName}</div>;

  const ind    = asset.indicators ?? {};
  const score  = asset.claude_score ?? {};
  const dates  = asset.dates ?? [];
  const prices = asset.prices ?? [];

  const chartData = dates.map((d: string, i: number) => ({
    date:  d,
    price: prices[i],
    sma20: ind.sma20_series?.[i] ?? null,
    sma50: ind.sma50_series?.[i] ?? null,
  }));

  const macdData = dates.map((d: string, i: number) => ({
    date: d,
    macd: ind.macd_series?.[i] ?? null,
    signal: ind.signal_series?.[i] ?? null,
    hist:   ind.hist_series?.[i] ?? null,
  }));

  const rsiData = dates.map((d: string, i: number) => ({
    date: d,
    rsi:  ind.rsi_series?.[i] ?? null,
  }));

  return (
    <div>
      <div className="mb-6">
        <Link href="/" className="inline-flex items-center gap-1.5 text-sm text-[#6b7280] hover:text-white transition-colors mb-4">
          <ArrowLeft size={14} /> Vue d&apos;ensemble
        </Link>
        <div className="flex items-start justify-between">
          <div>
            <h1 className="font-serif italic text-3xl font-bold text-white tracking-tight leading-none">{assetName}</h1>
            <p className="text-[#6b7280] text-sm mt-1">{asset.category} · {asset.currency}</p>
          </div>
          <SignalBadge signal={score.signal ?? "—"} />
        </div>
        {score.rationale && (
          <p className="text-[#6b7280] text-sm mt-3 italic border-l-2 border-white/10 pl-3">{score.rationale}</p>
        )}
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-5 gap-3 mb-6">
        <MetricCard label="Prix" value={fmt(asset.current, 4)} delta={fmtPct(asset.pct_change)} deltaPositive={(asset.pct_change ?? 0) >= 0} index={0} />
        <MetricCard label="RSI (14)" value={fmt(ind.rsi, 1)} index={1} />
        <MetricCard label="Volatilité" value={`${fmt(ind.volatility, 1)}%`} index={2} />
        <MetricCard label="SMA 20" value={fmt(ind.sma20, 4)} index={3} />
        <MetricCard label="SMA 50" value={fmt(ind.sma50, 4)} index={4} />
      </div>

      {/* Price chart */}
      <div className="bg-[#111111] border border-white/[0.07] rounded-xl p-5 mb-5">
        <h2 className="text-sm font-semibold text-white mb-4">Prix & Moyennes mobiles</h2>
        <ResponsiveContainer width="100%" height={260}>
          <LineChart data={chartData}>
            <XAxis dataKey="date" tick={{ fill: "#6b7280", fontSize: 10 }} tickLine={false} axisLine={false} interval="preserveStartEnd" />
            <YAxis tick={{ fill: "#6b7280", fontSize: 10 }} tickLine={false} axisLine={false} domain={["auto","auto"]} />
            <Tooltip contentStyle={{ background: "#1a1a1a", border: "1px solid rgba(255,255,255,0.08)", borderRadius: 8, color: "#f5f5f5", fontSize: 12 }} />
            <Line type="monotone" dataKey="price" stroke="#f5f5f5" strokeWidth={1.5} dot={false} name="Prix" />
            <Line type="monotone" dataKey="sma20"  stroke="#00d97e" strokeWidth={1} dot={false} strokeDasharray="4 2" name="SMA 20" />
            <Line type="monotone" dataKey="sma50"  stroke="#3b82f6" strokeWidth={1} dot={false} strokeDasharray="4 2" name="SMA 50" />
          </LineChart>
        </ResponsiveContainer>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        {/* MACD */}
        <div className="bg-[#111111] border border-white/[0.07] rounded-xl p-5">
          <h2 className="text-sm font-semibold text-white mb-4">MACD</h2>
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={macdData}>
              <XAxis dataKey="date" tick={{ fill: "#6b7280", fontSize: 10 }} tickLine={false} axisLine={false} interval="preserveStartEnd" />
              <YAxis tick={{ fill: "#6b7280", fontSize: 10 }} tickLine={false} axisLine={false} />
              <Tooltip contentStyle={{ background: "#1a1a1a", border: "1px solid rgba(255,255,255,0.08)", borderRadius: 8, color: "#f5f5f5", fontSize: 12 }} />
              <ReferenceLine y={0} stroke="rgba(255,255,255,0.1)" />
              <Bar dataKey="hist" fill="#00d97e" opacity={0.6} name="Histogramme" />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* RSI */}
        <div className="bg-[#111111] border border-white/[0.07] rounded-xl p-5">
          <h2 className="text-sm font-semibold text-white mb-4">RSI (14)</h2>
          <ResponsiveContainer width="100%" height={200}>
            <LineChart data={rsiData}>
              <XAxis dataKey="date" tick={{ fill: "#6b7280", fontSize: 10 }} tickLine={false} axisLine={false} interval="preserveStartEnd" />
              <YAxis domain={[0, 100]} tick={{ fill: "#6b7280", fontSize: 10 }} tickLine={false} axisLine={false} />
              <Tooltip contentStyle={{ background: "#1a1a1a", border: "1px solid rgba(255,255,255,0.08)", borderRadius: 8, color: "#f5f5f5", fontSize: 12 }} />
              <ReferenceLine y={70} stroke="#ff4757" strokeDasharray="4 2" strokeOpacity={0.5} />
              <ReferenceLine y={30} stroke="#00d97e" strokeDasharray="4 2" strokeOpacity={0.5} />
              <Line type="monotone" dataKey="rsi" stroke="#ffd32a" strokeWidth={1.5} dot={false} name="RSI" />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}
