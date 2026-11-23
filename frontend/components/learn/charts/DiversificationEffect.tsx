"use client";
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, ReferenceLine } from "recharts";

const data = [1,2,3,4,5,6,7,8,10,12,15,20,25,30,40,50].map(n => ({
  n,
  risk: +(20 + 25 / Math.sqrt(n) - 5).toFixed(1),
  systematic: 15,
}));

export default function DiversificationEffect() {
  return (
    <div className="bg-surface2 rounded-xl p-5">
      <p className="text-xs font-semibold text-muted uppercase tracking-wider mb-1">Effet de diversification</p>
      <p className="text-xs text-muted mb-4">Risque total diminue avec le nombre d'actifs · Le risque systématique est irréductible</p>
      <ResponsiveContainer width="100%" height={250}>
        <LineChart data={data} margin={{ top: 10, right: 10, bottom: 20, left: 10 }}>
          <XAxis dataKey="n" tick={{ fill: "#85858b", fontSize: 10 }} tickLine={false} axisLine={false} label={{ value: "Nombre d'actifs", position: "bottom", fill: "#85858b", fontSize: 11 }} />
          <YAxis domain={[0, 50]} tick={{ fill: "#85858b", fontSize: 10 }} tickLine={false} axisLine={false} label={{ value: "Risque (σ%)", angle: -90, position: "insideLeft", fill: "#85858b", fontSize: 11 }} />
          <Tooltip contentStyle={{ background: "#232325", border: "1px solid rgba(255,255,255,0.08)", borderRadius: 8, color: "#ededed", fontSize: 11 }} formatter={(v: any) => [`${v}%`]} />
          <ReferenceLine y={15} stroke="#e5484d" strokeDasharray="4 4" label={{ value: "Risque systématique (irréductible)", fill: "#e5484d", fontSize: 10, position: "insideTopRight" }} />
          <Line type="monotone" dataKey="risk" stroke="#4cc38a" strokeWidth={2.5} dot={false} name="Risque total" />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
