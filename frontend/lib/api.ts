const BASE = typeof window === "undefined"
  ? (process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000")
  : "";

export async function fetchMarketData(force = false) {
  const res = await fetch(`${BASE}/api/market-data${force ? "?force=true" : ""}`, { cache: "no-store" });
  if (!res.ok) throw new Error("Failed to fetch market data");
  return res.json();
}

export async function fetchPortfolio() {
  const res = await fetch(`${BASE}/api/portfolio`, { cache: "no-store" });
  if (!res.ok) throw new Error("Failed to fetch portfolio");
  return res.json();
}

export async function fetchMacroReport() {
  const res = await fetch(`${BASE}/api/macro-report`, { cache: "no-store" });
  if (!res.ok) throw new Error("Failed to fetch macro report");
  return res.json();
}

export async function fetchCorrelationMatrix() {
  const res = await fetch(`${BASE}/api/correlation-matrix`, { cache: "no-store" });
  if (!res.ok) throw new Error("Failed to fetch correlation matrix");
  return res.json();
}

export async function runBacktest(asset_name: string, strategy: string, lookback_days: number) {
  const res = await fetch(`${BASE}/api/backtest`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ asset_name, strategy, lookback_days }),
  });
  if (!res.ok) throw new Error("Backtest failed");
  return res.json();
}

export async function fetchAlerts() {
  const res = await fetch(`${BASE}/api/alerts`, { cache: "no-store" });
  if (!res.ok) throw new Error("Failed to fetch alerts");
  return res.json();
}

// Helpers
export function fmt(val: number | null | undefined, decimals = 2): string {
  if (val == null) return "—";
  return val.toLocaleString("fr-FR", { minimumFractionDigits: decimals, maximumFractionDigits: decimals });
}

export function fmtPct(val: number | null | undefined): string {
  if (val == null) return "—";
  return `${val >= 0 ? "+" : ""}${val.toFixed(2)}%`;
}
