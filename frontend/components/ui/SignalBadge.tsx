export default function SignalBadge({ signal }: { signal: string }) {
  const map: Record<string, { bg: string; text: string; label: string }> = {
    BUY:  { bg: "bg-[#00d97e]/10 border-[#00d97e]/20", text: "text-[#00d97e]", label: "ACHAT" },
    SELL: { bg: "bg-[#ff4757]/10 border-[#ff4757]/20", text: "text-[#ff4757]", label: "VENTE" },
    HOLD: { bg: "bg-[#ffd32a]/10 border-[#ffd32a]/20", text: "text-[#ffd32a]", label: "CONSERVER" },
  };
  const s = map[signal] ?? { bg: "bg-white/5 border-white/10", text: "text-[#6b7280]", label: signal || "—" };
  return (
    <span className={`inline-flex px-2 py-0.5 rounded text-[10px] font-semibold tracking-widest border tabular ${s.bg} ${s.text}`}>
      {s.label}
    </span>
  );
}
