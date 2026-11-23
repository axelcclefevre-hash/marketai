"use client";
import { ComposedChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, ReferenceLine, Scatter } from "recharts";

const cmlData = [0, 5, 10, 15, 20, 25, 30].map(s => ({ sigma: s, ret: +(2 + (s / 15) * 7).toFixed(1) }));
const frontier = [10, 12, 15, 17, 20, 22, 25].map(s => ({ sigma: s, frontRet: +(5 + Math.sqrt((s - 10) * 5)).toFixed(1) }));
const tangent = [{ sigma: 15, ret: 9.0, label: "Portefeuille tangent (optimal)" }];

export default function CapitalMarketLine() {
  return (
    <div className="bg-surface2 rounded-xl p-5">
      <p className="text-xs font-semibold text-muted uppercase tracking-wider mb-1">Capital Market Line (CML)</p>
      <p className="text-xs text-muted mb-4">La CML relie l'actif sans risque au portefeuille optimal · Pente = Ratio de Sharpe</p>
      <ResponsiveContainer width="100%" height={260}>
        <ComposedChart margin={{ top: 10, right: 20, bottom: 20, left: 10 }}>
          <XAxis dataKey="sigma" type="number" domain={[0, 30]} tick={{ fill: "#85858b", fontSize: 10 }} tickLine={false} axisLine={false} label={{ value: "Risque (σ%)", position: "bottom", fill: "#85858b", fontSize: 11 }} />
          <YAxis type="number" domain={[0, 16]} tick={{ fill: "#85858b", fontSize: 10 }} tickLine={false} axisLine={false} label={{ value: "Rendement (%)", angle: -90, position: "insideLeft", fill: "#85858b", fontSize: 11 }} />
          <Tooltip contentStyle={{ background: "#232325", border: "1px solid rgba(255,255,255,0.08)", borderRadius: 8, color: "#ededed", fontSize: 11 }} />
          <Line data={cmlData} type="linear" dataKey="ret" stroke="#4cc38a" strokeWidth={2} dot={false} name="CML" />
          <Line data={frontier} type="monotone" dataKey="frontRet" stroke="#3b82f6" strokeWidth={1.5} dot={false} strokeDasharray="4 3" name="Frontière efficiente" />
          <Scatter data={tangent} fill="#d9a441" shape="circle" dataKey="ret" name="Portefeuille tangent" />
          <ReferenceLine x={0} y={2} stroke="white" strokeOpacity={0.3} label={{ value: "Rf=2%", fill: "#85858b", fontSize: 10, position: "right" }} />
        </ComposedChart>
      </ResponsiveContainer>
    </div>
  );
}
