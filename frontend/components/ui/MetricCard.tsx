interface MetricCardProps {
  label: string;
  value: string;
  delta?: string | null;
  deltaPositive?: boolean;
  caption?: string;
  index?: number;
}

// Une carte-chiffre : un libellé, un grand chiffre, une variation avec sa référence.
export default function MetricCard({ label, value, delta, deltaPositive, caption }: MetricCardProps) {
  return (
    <div className="card p-5 animate-fade-up">
      <p className="text-[13px] text-muted truncate">{label}</p>
      <p className="text-[28px] leading-none font-medium text-primary tabular mt-3">{value}</p>
      {delta != null && (
        <p className="text-[13px] mt-3 tabular">
          <span className={deltaPositive ? "text-buy" : "text-sell"}>{delta}</span>
          {caption && <span className="text-muted font-sans"> {caption}</span>}
        </p>
      )}
    </div>
  );
}
