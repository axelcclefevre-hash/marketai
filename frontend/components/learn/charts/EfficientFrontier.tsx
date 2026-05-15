"use client";
import { ScatterChart, Scatter, XAxis, YAxis, Tooltip, ResponsiveContainer, Line, ComposedChart, ReferenceLine } from "recharts";
import { useMemo } from "react";

export default function EfficientFrontier() {
  const portfolios = useMemo(() => {
    const pts = [];
    for (let i = 0; i < 300; i++) {
      const w = Math.random();
      const ret = w * 10 + (1 - w) * 15 + (Math.random() - 0.5) * 3;
      const risk = Math.sqrt(w * w * 400 + (1 - w) * (1 - w) * 900 + 2 * w * (1 - w) * 0.3 * 20 * 30) + (Math.random() - 0.5) * 3;
      if (risk > 0 && ret > 0) pts.push({ risk: +risk.toFixed(1), ret: +ret.toFixed(1) });
    }
    return pts;
  }, []);

  const frontier = useMemo(() => {
    const pts = [];
    for (let w = 0; w <= 1; w += 0.05) {
      const ret = w * 10 + (1 - w) * 15;
      const risk = Math.sqrt(w * w * 400 + (1 - w) * (1 - w) * 900 + 2 * w * (1 - w) * 0.3 * 20 * 30);
      pts.push({ risk: +risk.toFixed(1), ret: +ret.toFixed(1) });
    }
    return pts.sort((a, b) => a.risk - b.risk);
  }, []);

  return (
    <div className="bg-[#1a1a1a] rounded-xl p-5">
      <p className="text-xs font-semibold text-[#6b7280] uppercase tracking-wider mb-1">Frontière efficiente</p>
      <p className="text-xs text-[#6b7280] mb-4">Nuage de portefeuilles possibles · La courbe = frontière optimale</p>
      <ResponsiveContainer width="100%" height={280}>
        <ComposedChart margin={{ top: 10, right: 10, bottom: 20, left: 10 }}>
          <XAxis dataKey="risk" type="number" domain={[5, 35]} name="Risque (σ)" unit="%" tick={{ fill: "#6b7280", fontSize: 10 }} tickLine={false} axisLine={false} label={{ value: "Risque (σ%)", position: "bottom", fill: "#6b7280", fontSize: 11 }} />
          <YAxis dataKey="ret" type="number" domain={[5, 20]} name="Rendement" unit="%" tick={{ fill: "#6b7280", fontSize: 10 }} tickLine={false} axisLine={false} label={{ value: "Rendement (%)", angle: -90, position: "insideLeft", fill: "#6b7280", fontSize: 11 }} />
          <Tooltip cursor={{ strokeDasharray: "3 3", stroke: "#333" }} contentStyle={{ background: "#1a1a1a", border: "1px solid rgba(255,255,255,0.08)", borderRadius: 8, color: "#f5f5f5", fontSize: 11 }} formatter={(v: any, n: string) => [`${v}%`, n === "ret" ? "Rendement" : "Risque"]} />
          <Scatter data={portfolios} fill="rgba(0,217,126,0.25)" shape="circle" />
          <Line data={frontier} type="monotone" dataKey="ret" stroke="#00d97e" strokeWidth={2.5} dot={false} legendType="none" />
        </ComposedChart>
      </ResponsiveContainer>
      <div className="flex gap-4 mt-2 justify-center">
        <div className="flex items-center gap-1.5 text-xs text-[#6b7280]"><span className="w-2 h-2 rounded-full bg-[#00d97e]/40 inline-block" />Portefeuilles possibles</div>
        <div className="flex items-center gap-1.5 text-xs text-[#6b7280]"><span className="w-4 h-0.5 bg-[#00d97e] inline-block" />Frontière efficiente</div>
      </div>
    </div>
  );
}
