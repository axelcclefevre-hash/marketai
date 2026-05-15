"use client";
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, ReferenceLine } from "recharts";

function bondPrice(ytm: number, coupon = 30, n = 10, face = 1000) {
  let price = 0;
  for (let t = 1; t <= n; t++) price += coupon / Math.pow(1 + ytm / 100, t);
  price += face / Math.pow(1 + ytm / 100, n);
  return +price.toFixed(0);
}

const data = [];
for (let ytm = 0.5; ytm <= 12; ytm += 0.25) {
  data.push({ ytm: +ytm.toFixed(2), price: bondPrice(ytm) });
}

export default function BondPriceDuration() {
  return (
    <div className="bg-[#1a1a1a] rounded-xl p-5">
      <p className="text-xs font-semibold text-[#6b7280] uppercase tracking-wider mb-1">Prix d'une obligation vs taux (YTM)</p>
      <p className="text-xs text-[#6b7280] mb-4">Coupon 3% · Maturité 10 ans · Valeur nominale 1 000€ · La courbe est convexe</p>
      <ResponsiveContainer width="100%" height={260}>
        <AreaChart data={data} margin={{ top: 10, right: 10, bottom: 20, left: 10 }}>
          <defs>
            <linearGradient id="bondGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#06b6d4" stopOpacity={0.20} />
              <stop offset="95%" stopColor="#06b6d4" stopOpacity={0} />
            </linearGradient>
          </defs>
          <XAxis dataKey="ytm" tick={{ fill: "#6b7280", fontSize: 10 }} tickLine={false} axisLine={false} label={{ value: "Taux YTM (%)", position: "bottom", fill: "#6b7280", fontSize: 11 }} />
          <YAxis domain={[400, 1600]} tick={{ fill: "#6b7280", fontSize: 10 }} tickLine={false} axisLine={false} label={{ value: "Prix (€)", angle: -90, position: "insideLeft", fill: "#6b7280", fontSize: 11 }} />
          <Tooltip contentStyle={{ background: "#1a1a1a", border: "1px solid rgba(255,255,255,0.08)", borderRadius: 8, color: "#f5f5f5", fontSize: 11 }} formatter={(v: any) => [`${v} €`, "Prix"]} />
          <ReferenceLine x={3} stroke="#ffd32a" strokeDasharray="4 4" label={{ value: "Coupon = YTM → Prix = 1000€", fill: "#ffd32a", fontSize: 9, position: "top" }} />
          <Area type="monotone" dataKey="price" stroke="#06b6d4" strokeWidth={2.5} fill="url(#bondGrad)" dot={false} />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}
