"use client";

import { useEffect, useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import { ArrowUp, ArrowDown, MagnifyingGlass, FunnelSimple, ArrowsClockwise } from "@phosphor-icons/react";
import MetricCard from "@/components/ui/MetricCard";
import SignalBadge from "@/components/ui/SignalBadge";
import { fetchMarketData, fmt, fmtPct } from "@/lib/api";

type Asset = {
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
  const [lastUpdate, setLastUpdate] = useState("");

  const load = async (force = false) => {
    try {
      if (force) setRefreshing(true);
      const d = await fetchMarketData(force);
      setData(d.assets ?? {});
      setLastUpdate(d.date ?? "");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => { load(); }, []);

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

  const toggleSort = (key: string) => {
    if (sortKey === key) setSortDir(d => d === "asc" ? "desc" : "asc");
    else { setSortKey(key); setSortDir("asc"); }
  };

  const SortIcon = ({ k }: { k: string }) =>
    sortKey === k
      ? sortDir === "asc" ? <ArrowUp size={12} weight="bold" /> : <ArrowDown size={12} weight="bold" />
      : null;

  if (loading) return (
    <div className="flex items-center justify-center h-96">
      <div className="text-[#6b7280] text-sm animate-pulse">Chargement des données...</div>
    </div>
  );

  return (
    <div>
      {/* Header */}
      <div className="flex items-start justify-between mb-8">
        <div>
          <h1 className="font-serif italic text-3xl font-bold text-white tracking-tight leading-none">
            Vue d&apos;ensemble
          </h1>
          <p className="text-[#6b7280] text-sm mt-1.5">
            {Object.keys(data).length} actifs suivis
            {lastUpdate && <span> · {lastUpdate}</span>}
          </p>
        </div>
        <button
          onClick={() => load(true)}
          disabled={refreshing}
          className="flex items-center gap-2 px-3 py-2 bg-white/[0.04] hover:bg-white/[0.08] border border-white/[0.08] rounded-lg text-sm text-[#6b7280] hover:text-white transition-all disabled:opacity-40"
        >
          <ArrowsClockwise size={14} className={refreshing ? "animate-spin" : ""} />
          <span className="hidden sm:block">Actualiser</span>
        </button>
      </div>

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
              index={i}
            />
          ))}
        </div>
      )}

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3 mb-5">
        <div className="relative flex-1 max-w-xs">
          <MagnifyingGlass size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#6b7280]" />
          <input
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Rechercher un actif..."
            className="w-full pl-8 pr-3 py-2 bg-[#111111] border border-white/[0.07] rounded-lg text-sm text-white placeholder-[#6b7280] focus:outline-none focus:border-white/20 transition-colors"
          />
        </div>
        <div className="flex items-center gap-2 overflow-x-auto pb-1">
          <FunnelSimple size={14} className="text-[#6b7280] flex-shrink-0" />
          {CATEGORIES.map(c => (
            <button
              key={c}
              onClick={() => setCategory(c)}
              className={`px-3 py-1.5 rounded-md text-xs font-medium whitespace-nowrap transition-all ${
                category === c
                  ? "bg-white text-[#0a0a0a]"
                  : "bg-white/[0.04] text-[#6b7280] hover:text-white hover:bg-white/[0.08]"
              }`}
            >
              {c}
            </button>
          ))}
        </div>
      </div>

      {/* Table */}
      <div className="bg-[#111111] border border-white/[0.07] rounded-xl overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-white/[0.06]">
              {[
                { key: "name",  label: "Actif" },
                { key: "cat",   label: "Catégorie" },
                { key: "price", label: "Prix" },
                { key: "pct",   label: "Variation" },
                { key: "rsi",   label: "RSI" },
                { key: "vol",   label: "Volatilité" },
                { key: "sig",   label: "Signal" },
              ].map(({ key, label }) => (
                <th
                  key={key}
                  onClick={() => ["name","price","pct","rsi"].includes(key) && toggleSort(key)}
                  className={`px-4 py-3 text-left text-[10px] font-semibold uppercase tracking-widest text-[#6b7280] select-none ${
                    ["name","price","pct","rsi"].includes(key) ? "cursor-pointer hover:text-white" : ""
                  }`}
                >
                  <span className="inline-flex items-center gap-1">
                    {label} <SortIcon k={key} />
                  </span>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            <AnimatePresence>
              {assets.map(([name, a], i) => {
                const pct = a.pct_change ?? 0;
                const signal = a.claude_score?.signal ?? "—";
                return (
                  <motion.tr
                    key={name}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: i * 0.02 }}
                    className="border-b border-white/[0.04] hover:bg-white/[0.02] transition-colors group"
                  >
                    <td className="px-4 py-3">
                      <Link
                        href={`/asset/${encodeURIComponent(name)}`}
                        className="font-medium text-white group-hover:text-[#00d97e] transition-colors"
                      >
                        {name}
                      </Link>
                    </td>
                    <td className="px-4 py-3 text-[#6b7280] text-xs">{a.category}</td>
                    <td className="px-4 py-3 text-white tabular">{fmt(a.current, 4)}</td>
                    <td className={`px-4 py-3 tabular font-medium ${pct >= 0 ? "text-[#00d97e]" : "text-[#ff4757]"}`}>
                      {fmtPct(a.pct_change)}
                    </td>
                    <td className="px-4 py-3 text-white/70 tabular">{fmt(a.indicators?.rsi, 1)}</td>
                    <td className="px-4 py-3 text-white/70 tabular">{fmt(a.indicators?.volatility, 1)}%</td>
                    <td className="px-4 py-3"><SignalBadge signal={signal} /></td>
                  </motion.tr>
                );
              })}
            </AnimatePresence>
          </tbody>
        </table>
        {assets.length === 0 && (
          <div className="py-16 text-center text-[#6b7280] text-sm">Aucun actif correspondant.</div>
        )}
      </div>
    </div>
  );
}
