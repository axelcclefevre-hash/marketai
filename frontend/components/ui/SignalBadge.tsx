// Signature MarketAI : une pastille de statut + le libellé, jamais une pilule colorée.
const MAP: Record<string, { dot: string; label: string }> = {
  BUY:  { dot: "bg-buy",  label: "Achat" },
  SELL: { dot: "bg-sell", label: "Vente" },
  HOLD: { dot: "bg-hold", label: "Conserver" },
};

export default function SignalBadge({ signal }: { signal: string }) {
  const s = MAP[signal];
  if (!s) return <span className="text-muted">—</span>;
  return (
    <span className="inline-flex items-center gap-2 text-[13px] text-primary">
      <span className={`w-1.5 h-1.5 rounded-full ${s.dot}`} aria-hidden />
      {s.label}
    </span>
  );
}
