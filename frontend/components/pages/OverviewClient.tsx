"use client";

import { useEffect, useState, useMemo } from "react";
import Link from "next/link";
import { ArrowUp, ArrowDown, MagnifyingGlass, ArrowsClockwise } from "@phosphor-icons/react";
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from "recharts";
import MetricCard from "@/components/ui/MetricCard";
import SignalBadge from "@/components/ui/SignalBadge";
import PageHeader from "@/components/ui/PageHeader";
import { Skeleton, ErrorState } from "@/components/ui/States";
import { fetchMarketData, fmt, fmtPct } from "@/lib/api";

type Asset = {
  prices?: number[];
  dates?: string[];
  name?: string;
  category: string;
  current: number | null;
  pct_change: number | null;
  indicators?: { rsi?: number; volatility?: number; sma20?: number };
  claude_score?: { signal: string; confidence: number; rationale: string };
  currency: string;
  error?: string;
};

const CATEGORIES = ["Tous", "Indices", "ETFs", "Actions", "Matières premières", "Forex", "Crypto", "Obligations"];

export default function OverviewClient() {
  const [data, setData]           = useState<Record<string, Asset>>({});
  const [loading, setLoading]     = useState(true);
  const [search, setSearch]       = useState("");
  const [category, setCategory]   = useState("Tous");
  const [sortKey, setSortKey]     = useState("name");
  const [sortDir, setSortDir]     = useState<"asc" | "desc">("asc");
  const [refreshing, setRefreshing] = useState(false);
  const [failed, setFailed]       = useState(false);
  const [lastUpdate, setLastUpdate] = useState("");
  const [ai, setAi]             = useState<{ available: boolean; running: boolean } | null>(null);

  const load = async (force = false) => {
    try {
      if (force) setRefreshing(true);
      setFailed(false);
      const d = await fetchMarketData(force);
      setData(d.assets ?? {});
      setLastUpdate(d.date ?? "");
      setAi(d.ai ?? null);
    } catch {
      setFailed(true);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => { load(); }, []);

  // Pendant que `claude -p` analyse en arrière-plan, on recharge régulièrement
  useEffect(() => {
    if (!ai?.running) return;
    const t = setInterval(() => load(), 10000);
    return () => clearInterval(t);
  }, [ai?.running]);

  const assets = useMemo(() => {
    return Object.entries(data)
      .filter(([name, a]) => {
        const q = search.toLowerCase();
        const matchSearch = !q || name.toLowerCase().includes(q) || a.category.toLowerCase().includes(q);
        const matchCat = category === "Tous" || a.category === category;
        return matchSearch && matchCat && !a.error;
      })
      .sort(([aName, a], [bName, b]) => {
        let av: number | string = 0, bv: number | string = 0;
        if (sortKey === "name")       { av = aName; bv = bName; }
        else if (sortKey === "price") { av = a.current ?? -Infinity; bv = b.current ?? -Infinity; }
        else if (sortKey === "pct")   { av = a.pct_change ?? -Infinity; bv = b.pct_change ?? -Infinity; }
        else if (sortKey === "rsi")   { av = a.indicators?.rsi ?? -Infinity; bv = b.indicators?.rsi ?? -Infinity; }
        if (av < bv) return sortDir === "asc" ? -1 : 1;
        if (av > bv) return sortDir === "asc" ? 1 : -1;
        return 0;
      });
  }, [data, search, category, sortKey, sortDir]);

  const indices = useMemo(() =>
    Object.entries(data).filter(([, a]) => a.category === "Indices" && !a.error).slice(0, 5),
  [data]);


  const pulse = useMemo(() => {
    const all = Object.entries(data).filter(([, a]) => !a.error && a.pct_change != null);
    const sorted = [...all].sort(([, a], [, b]) => (b.pct_change ?? 0) - (a.pct_change ?? 0));
    const movers = [...sorted.slice(0, 4), ...sorted.slice(-4)].filter(([n], i, arr) => arr.findIndex(([m]) => m === n) === i);
    const max = Math.max(...movers.map(([, a]) => Math.abs(a.pct_change ?? 0)), 1);
    return { movers, max };
  }, [data]);

  // Séries rebasées à 100 : S&P 500 en accent, les autres en gris
  const chart = useMemo(() => {
    const picked = indices.filter(([, a]) => a.prices?.length && a.dates?.length).slice(0, 5);
    const byDate = new Map<string, Record<string, number | string>>();
    picked.forEach(([name, a]) => {
      const base = a.prices![0];
      a.dates!.forEach((raw, i) => {
        const d = raw.slice(0, 10);
        const row = byDate.get(d) ?? { date: d };
        row[name] = (a.prices![i] / base) * 100;
        byDate.set(d, row);
      });
    });
    const rows = Array.from(byDate.values()).sort((x, y) => String(x.date).localeCompare(String(y.date)));
    return { rows, names: picked.map(([n]) => n) };
  }, [indices]);

  const toggleSort = (key: string) => {
    if (sortKey === key) setSortDir(d => d === "asc" ? "desc" : "asc");
    else { setSortKey(key); setSortDir("asc"); }
  };

  const SortIcon = ({ k }: { k: string }) =>
    sortKey === k
      ? sortDir === "asc" ? <ArrowUp size={12} weight="bold" /> : <ArrowDown size={12} weight="bold" />
      : null;

  if (loading) return (
    <div>
      <PageHeader title="Vue d'ensemble" />
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 mb-8">
        {Array.from({ length: 5 }).map((_, i) => <Skeleton key={i} className="h-24" />)}
      </div>
      <Skeleton className="h-96" />
    </div>
  );
  if (failed && Object.keys(data).length === 0) return (
    <div>
      <PageHeader title="Vue d'ensemble" />
      <ErrorState onRetry={() => { setLoading(true); load(true); }} />
    </div>
  );

  return (
    <div>
      <PageHeader
        title="Vue d'ensemble"
        subtitle={<>{Object.keys(data).length} actifs suivis{lastUpdate && <> · mis à jour {lastUpdate}</>}
            {ai?.running && <> · analyse IA en cours</>}
            {ai && !ai.available && <> · signaux IA désactivés (Claude Code introuvable)</>}</>}
        action={
          <button
            onClick={() => load(true)}
            disabled={refreshing}
            className="flex items-center gap-2 px-3 py-2 border border-border rounded-md text-sm text-muted hover:text-primary hover:bg-white/[0.04] transition-colors disabled:opacity-40"
          >
            <ArrowsClockwise size={14} className={refreshing ? "animate-spin" : ""} />
            <span className="hidden sm:block">Actualiser</span>
          </button>
        }
      />

      {/* Index cards */}
      {indices.length > 0 && (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 mb-8">
          {indices.map(([name, a], i) => (
            <MetricCard
              key={name}
              label={name}
              value={fmt(a.current)}
              delta={fmtPct(a.pct_change)}
              deltaPositive={(a.pct_change ?? 0) >= 0}
              caption="vs veille"
              index={i}
            />
          ))}
        </div>
      )}

      {/* Moment : indices rebasés à 100 */}
      {chart.rows.length > 0 && (
        <div className="grid lg:grid-cols-3 gap-3 mb-8">
          <div className="card p-5 lg:col-span-2">
            <div className="flex items-baseline justify-between mb-4">
              <h2 className="text-base font-medium">Indices, base 100</h2>
              <p className="text-[13px] text-muted">{chart.rows.length} derniers jours</p>
            </div>
            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={chart.rows} margin={{ top: 4, right: 8, bottom: 0, left: 0 }}>
                  <CartesianGrid stroke="rgb(237 237 237 / 0.06)" vertical={false} />
                  <XAxis dataKey="date" tickFormatter={(d: string) => d.slice(5)} tick={{ fill: "#85858b", fontSize: 12, fontFamily: "var(--font-mono)" }} axisLine={false} tickLine={false} minTickGap={48} />
                  <YAxis domain={["auto", "auto"]} tick={{ fill: "#85858b", fontSize: 12, fontFamily: "var(--font-mono)" }} axisLine={false} tickLine={false} width={40} tickFormatter={(v: number) => v.toFixed(0)} />
                  <Tooltip
                    contentStyle={{ background: "#232325", border: "1px solid rgba(237,237,237,0.08)", borderRadius: 8, fontSize: 12 }}
                    labelStyle={{ color: "#a1a1a6" }}
                    formatter={(v) => Number(v).toFixed(1)}
                  />
                  {chart.names.map((n, i) => (
                    <Line key={n} dataKey={n} dot={false} connectNulls type="monotone"
                      stroke={i === 0 ? "rgb(76 195 138)" : ["#a1a1a6", "#7b7b81", "#5a5a60", "#434348"][i - 1]}
                      strokeWidth={i === 0 ? 2 : 1.25} isAnimationActive={false} />
                  ))}
                </LineChart>
              </ResponsiveContainer>
            </div>
            <div className="flex flex-wrap gap-x-5 gap-y-1 mt-4 text-[13px] text-muted">
              {chart.names.map((n, i) => (
                <span key={n} className="inline-flex items-center gap-2">
                  <span className="w-3 h-0.5 rounded" style={{ background: i === 0 ? "rgb(76 195 138)" : ["#a1a1a6", "#7b7b81", "#5a5a60", "#434348"][i - 1] }} />
                  <span className={i === 0 ? "text-primary" : ""}>{n}</span>
                </span>
              ))}
            </div>
          </div>

          <div className="card p-5">
            <h2 className="text-base font-medium mb-4">Plus fortes variations</h2>
            <ul className="space-y-3">
              {pulse.movers.map(([name, a]) => {
                const v = a.pct_change ?? 0;
                return (
                  <li key={name}>
                    <div className="flex items-center justify-between text-sm">
                      <Link href={`/asset/${encodeURIComponent(name)}`} className="truncate hover:text-buy transition-colors">{name}</Link>
                      <span className={`tabular ${v >= 0 ? "text-buy" : "text-sell"}`}>{fmtPct(v)}</span>
                    </div>
                    <div className="h-0.5 mt-2 rounded bg-white/[0.06]">
                      <div className={`h-full rounded ${v >= 0 ? "bg-buy" : "bg-sell"}`} style={{ width: `${(Math.abs(v) / pulse.max) * 100}%` }} />
                    </div>
                  </li>
                );
              })}
            </ul>
          </div>
        </div>
      )}

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3 mb-5">
        <div className="relative flex-1 max-w-xs">
          <MagnifyingGlass size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted" />
          <input
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Rechercher un actif..."
            className="w-full pl-9 pr-3 py-2 bg-surface border border-border rounded-md text-sm text-primary placeholder-muted focus:border-white/25 transition-colors"
          />
        </div>
        <div className="flex items-center gap-2 overflow-x-auto pb-1">
                    {CATEGORIES.map(c => (
            <button
              key={c}
              onClick={() => setCategory(c)}
              className={`px-3 py-1.5 rounded-md text-[13px] font-medium whitespace-nowrap transition-colors ${
                category === c
                  ? "bg-primary text-bg"
                  : "text-muted hover:text-primary hover:bg-white/[0.05]"
              }`}
            >
              {c}
            </button>
          ))}
        </div>
      </div>

      {/* Table */}
      <div className="card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm min-w-[560px]">
            <thead>
              <tr className="border-b border-border">
                {[
                  { key: "name",  label: "Actif",      hide: false },
                  { key: "cat",   label: "Catégorie",  hide: true  },
                  { key: "price", label: "Prix",        hide: false },
                  { key: "pct",   label: "Variation",   hide: false },
                  { key: "rsi",   label: "RSI",         hide: true  },
                  { key: "vol",   label: "Volatilité",  hide: true  },
                  { key: "sig",   label: "Signal",      hide: false },
                ].map(({ key, label, hide }) => (
                  <th
                    key={key}
                    onClick={() => ["name","price","pct","rsi"].includes(key) && toggleSort(key)}
                    className={`px-4 py-2.5 text-xs font-medium text-muted select-none ${["price","pct","rsi","vol"].includes(key) ? "text-right" : "text-left"} ${
                      ["name","price","pct","rsi"].includes(key) ? "cursor-pointer hover:text-primary" : ""
                    } ${hide ? "hidden sm:table-cell" : ""}`}
                  >
                    <span className="inline-flex items-center gap-1">
                      {label} <SortIcon k={key} />
                    </span>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
                              {assets.map(([name, a]) => {
                  const pct = a.pct_change ?? 0;
                  const signal = a.claude_score?.signal ?? "—";
                  return (
                    <tr key={name} className="border-b border-border last:border-0 hover:bg-white/[0.025] transition-colors group">
                      <td className="px-4 py-2.5">
                        <Link
                          href={`/asset/${encodeURIComponent(name)}`}
                          className="font-medium text-primary group-hover:text-buy transition-colors"
                        >
                          {name}
                        </Link>
                      </td>
                      <td className="px-4 py-2.5 text-muted text-[13px] hidden sm:table-cell">{a.category}</td>
                      <td className="px-4 py-2.5 text-primary tabular text-right">{fmt(a.current, a.category === "Forex" ? 4 : 2)}</td>
                      <td className={`px-4 py-2.5 tabular font-medium text-right ${pct >= 0 ? "text-buy" : "text-sell"}`}>
                        {fmtPct(a.pct_change)}
                      </td>
                      <td className="px-4 py-2.5 text-muted tabular text-right hidden sm:table-cell">{fmt(a.indicators?.rsi, 1)}</td>
                      <td className="px-4 py-2.5 text-muted tabular text-right hidden sm:table-cell">{fmt(a.indicators?.volatility, 1)}%</td>
                      <td className="px-4 py-2.5">
                        <div className="flex items-center gap-2">
                          <SignalBadge signal={signal} />
                          {a.claude_score && <span className="text-xs text-muted tabular">{Math.round(a.claude_score.confidence)} %</span>}
                        </div>
                      </td>
                    </tr>
                  );
                })}
                          </tbody>
          </table>
        </div>
        {assets.length === 0 && (
          <div className="py-16 text-center text-muted text-sm">Aucun actif correspondant.</div>
        )}
      </div>
    </div>
  );
}
