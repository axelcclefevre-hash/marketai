"use client";
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, ReferenceLine } from "recharts";

const data = [1,2,3,4,5,6,7,8,10,12,15,20,25,30,40,50].map(n => ({
  n,
  risk: +(20 + 25 / Math.sqrt(n) - 5).toFixed(1),
  systematic: 15,
}));

export default function DiversificationEffect() {
  return (
    <div className="bg-[#1a1a1a] rounded-xl p-5">
      <p className="text-xs font-semibold text-[#6b7280] uppercase tracking-wider mb-1">Effet de diversification</p>
      <p className="text-xs text-[#6b7280] mb-4">Risque total diminue avec le nombre d'actifs · Le risque systématique est irréductible</p>
      <ResponsiveContainer width="100%" height={250}>
        <LineChart data={data} margin={{ top: 10, right: 10, bottom: 20, left: 10 }}>
          <XAxis dataKey="n" tick={{ fill: "#6b7280", fontSize: 10 }} tickLine={false} axisLine={false} label={{ value: "Nombre d'actifs", position: "bottom", fill: "#6b7280", fontSize: 11 }} />
          <YAxis domain={[0, 50]} tick={{ fill: "#6b7280", fontSize: 10 }} tickLine={false} axisLine={false} label={{ value: "Risque (σ%)", angle: -90, position: "insideLeft", fill: "#6b7280", fontSize: 11 }} />
          <Tooltip contentStyle={{ background: "#1a1a1a", border: "1px solid rgba(255,255,255,0.08)", borderRadius: 8, color: "#f5f5f5", fontSize: 11 }} formatter={(v: any) => [`${v}%`]} />
          <ReferenceLine y={15} stroke="#ff4757" strokeDasharray="4 4" label={{ value: "Risque systématique (irréductible)", fill: "#ff4757", fontSize: 10, position: "insideTopRight" }} />
          <Line type="monotone" dataKey="risk" stroke="#00d97e" strokeWidth={2.5} dot={false} name="Risque total" />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
