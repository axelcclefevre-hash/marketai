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
  callPayoff:  { color: "#00d97e", label: "Call (achat)" },
  putPayoff:   { color: "#ff4757", label: "Put (achat)" },
  protPut:     { color: "#3b82f6", label: "Protective Put" },
  straddle:    { color: "#ffd32a", label: "Straddle" },
};

export default function OptionPayoff() {
  const [active, setActive] = useState<string>("callPayoff");
  const data = genData();

  return (
    <div className="bg-[#1a1a1a] rounded-xl p-5">
      <p className="text-xs font-semibold text-[#6b7280] uppercase tracking-wider mb-1">Profit/Perte des options à l'expiration</p>
      <p className="text-xs text-[#6b7280] mb-3">Prix d'exercice X = 100€ · Prime = 8€</p>
      <div className="flex gap-2 flex-wrap mb-4">
        {Object.entries(STRATEGIES).map(([k, { color, label }]) => (
          <button
            key={k}
            onClick={() => setActive(k)}
            className={`px-3 py-1 rounded text-xs font-medium transition-all ${active === k ? "text-[#0a0a0a]" : "text-[#6b7280] bg-white/[0.04]"}`}
            style={active === k ? { background: color } : {}}
          >
            {label}
          </button>
        ))}
      </div>
      <ResponsiveContainer width="100%" height={240}>
        <LineChart data={data} margin={{ top: 10, right: 10, bottom: 20, left: 10 }}>
          <XAxis dataKey="S" tick={{ fill: "#6b7280", fontSize: 10 }} tickLine={false} axisLine={false} label={{ value: "Prix du sous-jacent (€)", position: "bottom", fill: "#6b7280", fontSize: 11 }} />
          <YAxis domain={[-20, 60]} tick={{ fill: "#6b7280", fontSize: 10 }} tickLine={false} axisLine={false} label={{ value: "Profit (€)", angle: -90, position: "insideLeft", fill: "#6b7280", fontSize: 11 }} />
          <Tooltip contentStyle={{ background: "#1a1a1a", border: "1px solid rgba(255,255,255,0.08)", borderRadius: 8, color: "#f5f5f5", fontSize: 11 }} formatter={(v: any) => [`${(+v).toFixed(0)} €`, STRATEGIES[active]?.label]} />
          <ReferenceLine y={0} stroke="rgba(255,255,255,0.15)" />
          <ReferenceLine x={X} stroke="rgba(255,255,255,0.15)" strokeDasharray="4 4" label={{ value: "Strike X=100", fill: "#6b7280", fontSize: 9 }} />
          <Line type="monotone" dataKey={active} stroke={STRATEGIES[active]?.color} strokeWidth={2.5} dot={false} />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
