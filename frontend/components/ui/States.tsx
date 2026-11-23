import { ArrowsClockwise } from "@phosphor-icons/react";

export function Skeleton({ className = "" }: { className?: string }) {
  return <div className={`animate-pulse rounded-md bg-white/[0.05] ${className}`} />;
}

export function ErrorState({ message = "Impossible de charger les données.", onRetry }: { message?: string; onRetry?: () => void }) {
  return (
    <div className="border border-border rounded-xl bg-surface py-16 px-6 text-center">
      <p className="text-sm text-primary font-medium">{message}</p>
      <p className="text-sm text-muted mt-1">Vérifie ta connexion puis réessaie.</p>
      {onRetry && (
        <button onClick={onRetry} className="mt-5 inline-flex items-center gap-2 px-3.5 py-2 rounded-md border border-border text-sm text-primary hover:bg-white/[0.05] transition-colors">
          <ArrowsClockwise size={14} /> Réessayer
        </button>
      )}
    </div>
  );
}
