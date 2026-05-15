"use client";
import { ComposedChart, Line, Scatter, XAxis, YAxis, Tooltip, ResponsiveContainer, ReferenceLine } from "recharts";

const smlData = [0, 0.5, 1, 1.5, 2, 2.5].map(b => ({ beta: b, expected: +(2 + b * 6.5).toFixed(1) }));

const assets = [
  { beta: 0.5, actual: 7.0, name: "Obligation IG" },
  { beta: 1.0, actual: 8.5, name: "Indice marché" },
  { beta: 1.3, actual: 11.5, name: "Apple (sous-évalué ↑)" },
  { beta: 1.8, actual: 10.5, name: "Actif sur-évalué ↓" },
  { beta: 0.3, actual: 4.0, name: "Actif défensif" },
];

export default function SecurityMarketLine() {
  return (
    <div className="bg-[#1a1a1a] rounded-xl p-5">
      <p className="text-xs font-semibold text-[#6b7280] uppercase tracking-wider mb-1">Security Market Line (SML)</p>
      <p className="text-xs text-[#6b7280] mb-4">Au-dessus = sous-évalué (alpha positif) · En-dessous = sur-évalué</p>
      <ResponsiveContainer width="100%" height={260}>
        <ComposedChart margin={{ top: 10, right: 20, bottom: 20, left: 10 }}>
          <XAxis dataKey="beta" type="number" domain={[0, 2.5]} tick={{ fill: "#6b7280", fontSize: 10 }} tickLine={false} axisLine={false} label={{ value: "Bêta (β)", position: "bottom", fill: "#6b7280", fontSize: 11 }} />
          <YAxis type="number" domain={[0, 20]} tick={{ fill: "#6b7280", fontSize: 10 }} tickLine={false} axisLine={false} label={{ value: "Rendement (%)", angle: -90, position: "insideLeft", fill: "#6b7280", fontSize: 11 }} />
          <Tooltip contentStyle={{ background: "#1a1a1a", border: "1px solid rgba(255,255,255,0.08)", borderRadius: 8, color: "#f5f5f5", fontSize: 11 }} />
          <Line data={smlData} type="linear" dataKey="expected" stroke="#3b82f6" strokeWidth={2} dot={false} name="SML" />
          <Scatter data={assets} fill="#ffd32a" shape="circle" name="Actifs" dataKey="actual" />
        </ComposedChart>
      </ResponsiveContainer>
      <div className="flex flex-wrap gap-3 mt-2 justify-center">
        {assets.map(a => (
          <div key={a.name} className="text-[10px] text-[#6b7280] flex items-center gap-1">
            <span className="w-1.5 h-1.5 rounded-full bg-[#ffd32a] inline-block" />{a.name}
          </div>
        ))}
      </div>
    </div>
  );
}
