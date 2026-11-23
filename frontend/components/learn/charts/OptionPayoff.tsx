"use client";
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, ReferenceLine, Legend } from "recharts";
import { useState } from "react";

const X = 100; const premium = 8;

function genData() {
  return Array.from({ length: 41 }, (_, i) => {
    const S = 70 + i * 2;
    const callPayoff = Math.max(S - X, 0) - premium;
    const putPayoff = Math.max(X - S, 0) - premium;
    const protPut = (S + Math.max(X - S, 0) - premium) - 100;
    const straddle = Math.max(S - X, 0) + Math.max(X - S, 0) - 2 * premium;
    return { S, callPayoff, putPayoff, protPut, straddle };
  });
}

const STRATEGIES: Record<string, { color: string; label: string }> = {
  callPayoff:  { color: "#4cc38a", label: "Call (achat)" },
  putPayoff:   { color: "#e5484d", label: "Put (achat)" },
  protPut:     { color: "#3b82f6", label: "Protective Put" },
  straddle:    { color: "#d9a441", label: "Straddle" },
};

export default function OptionPayoff() {
  const [active, setActive] = useState<string>("callPayoff");
  const data = genData();

  return (
    <div className="bg-surface2 rounded-xl p-5">
      <p className="text-xs font-semibold text-muted uppercase tracking-wider mb-1">Profit/Perte des options à l'expiration</p>
      <p className="text-xs text-muted mb-3">Prix d'exercice X = 100€ · Prime = 8€</p>
      <div className="flex gap-2 flex-wrap mb-4">
        {Object.entries(STRATEGIES).map(([k, { color, label }]) => (
          <button
            key={k}
            onClick={() => setActive(k)}
            className={`px-3 py-1 rounded text-xs font-medium transition-all ${active === k ? "text-bg" : "text-muted bg-white/[0.04]"}`}
            style={active === k ? { background: color } : {}}
          >
            {label}
          </button>
        ))}
      </div>
      <ResponsiveContainer width="100%" height={240}>
        <LineChart data={data} margin={{ top: 10, right: 10, bottom: 20, left: 10 }}>
          <XAxis dataKey="S" tick={{ fill: "#85858b", fontSize: 10 }} tickLine={false} axisLine={false} label={{ value: "Prix du sous-jacent (€)", position: "bottom", fill: "#85858b", fontSize: 11 }} />
          <YAxis domain={[-20, 60]} tick={{ fill: "#85858b", fontSize: 10 }} tickLine={false} axisLine={false} label={{ value: "Profit (€)", angle: -90, position: "insideLeft", fill: "#85858b", fontSize: 11 }} />
          <Tooltip contentStyle={{ background: "#232325", border: "1px solid rgba(255,255,255,0.08)", borderRadius: 8, color: "#ededed", fontSize: 11 }} formatter={(v: any) => [`${(+v).toFixed(0)} €`, STRATEGIES[active]?.label]} />
          <ReferenceLine y={0} stroke="rgba(255,255,255,0.15)" />
          <ReferenceLine x={X} stroke="rgba(255,255,255,0.15)" strokeDasharray="4 4" label={{ value: "Strike X=100", fill: "#85858b", fontSize: 9 }} />
          <Line type="monotone" dataKey={active} stroke={STRATEGIES[active]?.color} strokeWidth={2.5} dot={false} />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
