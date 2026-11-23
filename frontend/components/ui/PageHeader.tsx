export default function PageHeader({ title, subtitle, action }: { title: string; subtitle?: React.ReactNode; action?: React.ReactNode }) {
  return (
    <div className="flex items-start justify-between gap-4 mb-8">
      <div>
        <h1 className="text-[28px] leading-[1.15] font-medium text-primary">{title}</h1>
        {subtitle && <p className="text-sm text-muted mt-2">{subtitle}</p>}
      </div>
      {action}
    </div>
  );
}
