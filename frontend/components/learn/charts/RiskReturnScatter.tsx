"use client";
import { ScatterChart, Scatter, XAxis, YAxis, Tooltip, ResponsiveContainer, Line, ComposedChart } from "recharts";

const assets = [
  { name: "Bons du Trésor", risk: 1, ret: 2 },
  { name: "Obligations IG", risk: 5, ret: 4 },
  { name: "REIT", risk: 14, ret: 9 },
  { name: "ETF S&P 500", risk: 15, ret: 10 },
  { name: "Grandes caps US", risk: 18, ret: 11 },
  { name: "ETF Émergents", risk: 22, ret: 12 },
  { name: "Small Caps", risk: 25, ret: 13 },
  { name: "Bitcoin", risk: 75, ret: 30 },
  { name: "Or", risk: 16, ret: 6 },
  { name: "Ethereum", risk: 90, ret: 25 },
];

const CustomDot = (props: any) => {
  const { cx, cy, payload } = props;
  return (
    <g>
      <circle cx={cx} cy={cy} r={5} fill="#00d97e" opacity={0.8} />
      <text x={cx + 7} y={cy + 4} fontSize={9} fill="#6b7280">{payload.name}</text>
    </g>
  );
};

export default function RiskReturnScatter() {
  return (
    <div className="bg-[#1a1a1a] rounded-xl p-5">
      <p className="text-xs font-semibold text-[#6b7280] uppercase tracking-wider mb-1">Risque vs Rendement par classe d'actifs</p>
      <p className="text-xs text-[#6b7280] mb-4">Plus on prend de risque, plus le rendement attendu est élevé</p>
      <ResponsiveContainer width="100%" height={280}>
        <ScatterChart margin={{ top: 10, right: 60, bottom: 20, left: 10 }}>
          <XAxis dataKey="risk" type="number" domain={[0, 100]} name="Risque" unit="%" tick={{ fill: "#6b7280", fontSize: 10 }} tickLine={false} axisLine={false} label={{ value: "Risque (σ annuel %)", position: "bottom", fill: "#6b7280", fontSize: 11 }} />
          <YAxis dataKey="ret" type="number" domain={[0, 35]} name="Rendement" unit="%" tick={{ fill: "#6b7280", fontSize: 10 }} tickLine={false} axisLine={false} label={{ value: "Rendement attendu (%)", angle: -90, position: "insideLeft", fill: "#6b7280", fontSize: 11 }} />
          <Tooltip contentStyle={{ background: "#1a1a1a", border: "1px solid rgba(255,255,255,0.08)", borderRadius: 8, color: "#f5f5f5", fontSize: 11 }} formatter={(v: any, n: string) => [`${v}%`, n === "ret" ? "Rendement" : "Risque"]} cursor={{ strokeDasharray: "3 3" }} />
          <Scatter data={assets} fill="#00d97e" shape={<CustomDot />} />
        </ScatterChart>
      </ResponsiveContainer>
    </div>
  );
}
