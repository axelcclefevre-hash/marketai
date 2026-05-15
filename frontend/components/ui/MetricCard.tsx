"use client";
import { motion } from "framer-motion";

interface MetricCardProps {
  label: string;
  value: string;
  delta?: string | null;
  deltaPositive?: boolean;
  index?: number;
}

export default function MetricCard({ label, value, delta, deltaPositive, index = 0 }: MetricCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: index * 0.06, ease: [0.16, 1, 0.3, 1] }}
      whileHover={{ y: -2, transition: { duration: 0.2 } }}
      className="bg-[#111111] border border-white/[0.07] rounded-xl p-5 cursor-default"
    >
      <p className="text-[11px] font-medium text-[#6b7280] uppercase tracking-widest mb-2">{label}</p>
      <p className="text-2xl font-bold text-white tabular tracking-tight leading-none">{value}</p>
      {delta != null && (
        <p className={`text-xs font-semibold mt-1.5 tabular ${deltaPositive ? "text-[#00d97e]" : "text-[#ff4757]"}`}>
          {delta}
        </p>
      )}
    </motion.div>
  );
}
