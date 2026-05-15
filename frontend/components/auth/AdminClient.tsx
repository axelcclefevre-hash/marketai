"use client";

import { useSession } from "next-auth/react";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Users, Crown, CurrencyEur, ArrowsClockwise } from "@phosphor-icons/react";

type UserRow = {
  id: number;
  email: string;
  subscription_status: string;
  created_at: string | null;
  stripe_customer_id: string | null;
};

type Stats = {
  total_users: number;
  premium_users: number;
  free_users: number;
  mrr_eur: number;
};

export default function AdminClient() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const user = session?.user as any;

  const [users, setUsers]     = useState<UserRow[]>([]);
  const [stats, setStats]     = useState<Stats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError]     = useState("");
  const [updating, setUpdating] = useState<number | null>(null);

  const token = user?.apiToken;

  const load = async () => {
    setLoading(true);
    const [usersRes, statsRes] = await Promise.all([
      fetch("/api/admin/users",  { headers: { Authorization: `Bearer ${token}` } }),
      fetch("/api/admin/stats",  { headers: { Authorization: `Bearer ${token}` } }),
    ]);
    if (usersRes.status === 403) { setError("Accès refusé — email admin non reconnu"); setLoading(false); return; }
    if (usersRes.status === 401) { router.push("/login"); return; }
    if (usersRes.ok) setUsers(await usersRes.json());
    if (statsRes.ok) setStats(await statsRes.json());
    setLoading(false);
  };

  useEffect(() => {
    if (status === "unauthenticated") { router.push("/login"); return; }
    if (token) load();
  }, [status, token]);

  const updateSubscription = async (userId: number, newStatus: string) => {
    setUpdating(userId);
    await fetch(`/api/admin/users/${userId}/subscription?status=${newStatus}`, {
      method: "PATCH",
      headers: { Authorization: `Bearer ${token}` },
    });
    await load();
    setUpdating(null);
  };

  const fmtDate = (iso: string | null) =>
    iso ? new Date(iso).toLocaleDateString("fr-FR") : "—";

  const statusBadge = (s: string) => {
    const map: Record<string, string> = {
      premium:   "text-[#ffd32a] bg-[#ffd32a]/10 border-[#ffd32a]/20",
      free:      "text-[#6b7280] bg-white/[0.04] border-white/[0.08]",
      cancelled: "text-[#ff4757] bg-[#ff4757]/10 border-[#ff4757]/20",
    };
    return map[s] ?? map.free;
  };

  if (loading) return (
    <div className="flex items-center justify-center h-64 text-[#6b7280] text-sm animate-pulse">
      Chargement...
    </div>
  );

  if (error) return (
    <div className="flex items-center justify-center h-64">
      <div className="text-center">
        <p className="text-[#ff4757] font-semibold">{error}</p>
        <p className="text-[#6b7280] text-sm mt-1">Connecté en tant que : {user?.email}</p>
      </div>
    </div>
  );

  return (
    <div>
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-white">Administration</h1>
          <p className="text-[#6b7280] text-sm mt-1">Gestion des utilisateurs MarketAI</p>
        </div>
        <button onClick={load} className="flex items-center gap-2 px-3 py-2 bg-white/[0.04] hover:bg-white/[0.08] border border-white/[0.08] rounded-lg text-sm text-[#6b7280] hover:text-white transition-all">
          <ArrowsClockwise size={14} /> Actualiser
        </button>
      </div>

      {/* Stats */}
      {stats && (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-8">
          {[
            { label: "Utilisateurs total", value: stats.total_users, icon: Users, color: "text-white" },
            { label: "Abonnés Premium", value: stats.premium_users, icon: Crown, color: "text-[#ffd32a]" },
            { label: "Utilisateurs gratuits", value: stats.free_users, icon: Users, color: "text-[#6b7280]" },
            { label: "MRR estimé", value: `${stats.mrr_eur.toFixed(2)} €`, icon: CurrencyEur, color: "text-[#00d97e]" },
          ].map(({ label, value, icon: Icon, color }) => (
            <div key={label} className="bg-[#111111] border border-white/[0.07] rounded-xl p-5">
              <Icon size={18} className={`${color} mb-3`} />
              <p className="text-xs text-[#6b7280] uppercase tracking-wider mb-1">{label}</p>
              <p className={`text-2xl font-bold tabular ${color}`}>{value}</p>
            </div>
          ))}
        </div>
      )}

      {/* Users table */}
      <div className="bg-[#111111] border border-white/[0.07] rounded-xl overflow-hidden">
        <div className="px-5 py-4 border-b border-white/[0.06] flex items-center justify-between">
          <h2 className="text-sm font-semibold text-white">Utilisateurs ({users.length})</h2>
        </div>
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-white/[0.04]">
              {["ID", "Email", "Statut", "Inscrit le", "Actions"].map(h => (
                <th key={h} className="px-4 py-3 text-left text-[10px] font-semibold uppercase tracking-widest text-[#6b7280]">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {users.length === 0 && (
              <tr>
                <td colSpan={5} className="px-4 py-10 text-center text-[#6b7280] text-sm">
                  Aucun utilisateur pour l'instant.
                </td>
              </tr>
            )}
            {users.map(u => (
              <tr key={u.id} className="border-b border-white/[0.03] hover:bg-white/[0.01]">
                <td className="px-4 py-3 text-[#6b7280] tabular text-xs">{u.id}</td>
                <td className="px-4 py-3 text-white font-medium">{u.email}</td>
                <td className="px-4 py-3">
                  <span className={`inline-flex px-2 py-0.5 rounded text-[10px] font-semibold tracking-wider border uppercase ${statusBadge(u.subscription_status)}`}>
                    {u.subscription_status}
                  </span>
                </td>
                <td className="px-4 py-3 text-[#6b7280] text-xs">{fmtDate(u.created_at)}</td>
                <td className="px-4 py-3">
                  <div className="flex gap-2">
                    {u.subscription_status !== "premium" && (
                      <button
                        onClick={() => updateSubscription(u.id, "premium")}
                        disabled={updating === u.id}
                        className="px-2 py-1 text-[10px] font-semibold bg-[#ffd32a]/10 text-[#ffd32a] border border-[#ffd32a]/20 rounded hover:bg-[#ffd32a]/20 transition-colors disabled:opacity-40"
                      >
                        {updating === u.id ? "..." : "→ Premium"}
                      </button>
                    )}
                    {u.subscription_status === "premium" && (
                      <button
                        onClick={() => updateSubscription(u.id, "free")}
                        disabled={updating === u.id}
                        className="px-2 py-1 text-[10px] font-semibold bg-white/[0.04] text-[#6b7280] border border-white/[0.08] rounded hover:text-white transition-colors disabled:opacity-40"
                      >
                        {updating === u.id ? "..." : "→ Gratuit"}
                      </button>
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <p className="mt-4 text-xs text-[#6b7280]">
        Accès réservé à {user?.email}. Ne pas partager cette URL.
      </p>
    </div>
  );
}
