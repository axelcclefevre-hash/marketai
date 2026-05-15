"use client";

import { useSession, signOut, update } from "next-auth/react";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import Link from "next/link";
import { Crown, SignOut, Envelope, CheckCircle } from "@phosphor-icons/react";

export default function ProfileClient() {
  const { data: session, status, update: updateSession } = useSession();
  const router = useRouter();
  const params = useSearchParams();
  const [confirming, setConfirming] = useState(false);
  const [activated, setActivated] = useState(false);

  useEffect(() => {
    if (status === "unauthenticated") router.push("/login");
  }, [status, router]);

  // Confirmation automatique après paiement Stripe
  useEffect(() => {
    const sessionId = params.get("session_id");
    const success = params.get("success");
    const user = session?.user as any;
    if (sessionId && success && user?.apiToken && user?.subscription !== "premium") {
      setConfirming(true);
      fetch(`/api/stripe/confirm?session_id=${sessionId}`, {
        headers: { Authorization: `Bearer ${user.apiToken}` },
      })
        .then(r => r.json())
        .then(async d => {
          if (d.activated) {
            setActivated(true);
            await updateSession({ subscription: "premium" });
          }
        })
        .finally(() => setConfirming(false));
    }
  }, [params, session]);

  if (status === "loading") return <div className="text-[#6b7280] text-sm animate-pulse">Chargement...</div>;
  if (!session) return null;

  if (confirming) return <div className="text-[#6b7280] text-sm animate-pulse">Vérification du paiement...</div>;

  const user = session.user as any;
  const isPremium = user.subscription === "premium";

  return (
    <div className="max-w-lg">
      <h1 className="text-2xl font-bold text-white mb-6">Mon profil</h1>

      {activated && (
        <div className="flex items-center gap-3 bg-[#00d97e]/10 border border-[#00d97e]/20 rounded-xl p-4 mb-5">
          <CheckCircle size={20} className="text-[#00d97e] flex-shrink-0" />
          <div>
            <p className="text-sm font-semibold text-white">Premium activé !</p>
            <p className="text-xs text-[#6b7280]">Toutes les fonctionnalités sont maintenant disponibles.</p>
          </div>
        </div>
      )}

      <div className="bg-[#111111] border border-white/[0.07] rounded-xl p-6 space-y-5">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-white/[0.08] rounded-full flex items-center justify-center">
            <Envelope size={18} className="text-[#6b7280]" />
          </div>
          <div>
            <p className="text-xs text-[#6b7280] uppercase tracking-wider">Email</p>
            <p className="text-white font-medium text-sm">{user.email}</p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <div className={`w-10 h-10 rounded-full flex items-center justify-center ${isPremium ? "bg-[#ffd32a]/10" : "bg-white/[0.04]"}`}>
            <Crown size={18} className={isPremium ? "text-[#ffd32a]" : "text-[#6b7280]"} />
          </div>
          <div>
            <p className="text-xs text-[#6b7280] uppercase tracking-wider">Abonnement</p>
            <p className={`font-semibold text-sm ${isPremium ? "text-[#ffd32a]" : "text-white"}`}>
              {isPremium ? "Premium" : "Gratuit"}
            </p>
          </div>
          {!isPremium && (
            <Link href="/upgrade" className="ml-auto px-3 py-1.5 bg-[#00d97e] text-[#0a0a0a] rounded-lg text-xs font-semibold hover:bg-[#00d97e]/90 transition-colors">
              Passer Premium
            </Link>
          )}
        </div>
      </div>

      <button
        onClick={() => signOut({ callbackUrl: "/" })}
        className="mt-6 flex items-center gap-2 text-sm text-[#6b7280] hover:text-white transition-colors"
      >
        <SignOut size={16} />
        Se déconnecter
      </button>
    </div>
  );
}
