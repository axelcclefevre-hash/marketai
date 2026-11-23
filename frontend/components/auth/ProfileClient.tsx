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

  if (status === "loading") return <div className="text-muted text-sm animate-pulse">Chargement...</div>;
  if (!session) return null;

  if (confirming) return <div className="text-muted text-sm animate-pulse">Vérification du paiement...</div>;

  const user = session.user as any;
  const isPremium = user.subscription === "premium";

  return (
    <div className="max-w-lg">
      <h1 className="text-2xl font-medium text-primary mb-6">Mon profil</h1>

      {activated && (
        <div className="flex items-center gap-3 bg-buy/10 border border-buy/20 rounded-xl p-4 mb-5">
          <CheckCircle size={20} className="text-buy flex-shrink-0" />
          <div>
            <p className="text-sm font-medium text-primary">Premium activé !</p>
            <p className="text-xs text-muted">Toutes les fonctionnalités sont maintenant disponibles.</p>
          </div>
        </div>
      )}

      <div className="card p-6 space-y-5">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-white/[0.08] rounded-full flex items-center justify-center">
            <Envelope size={18} className="text-muted" />
          </div>
          <div>
            <p className="text-xs text-muted ">Email</p>
            <p className="text-primary font-medium text-sm">{user.email}</p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <div className={`w-10 h-10 rounded-full flex items-center justify-center ${isPremium ? "bg-hold/10" : "bg-white/[0.04]"}`}>
            <Crown size={18} className={isPremium ? "text-hold" : "text-muted"} />
          </div>
          <div>
            <p className="text-xs text-muted ">Abonnement</p>
            <p className={`font-medium text-sm ${isPremium ? "text-hold" : "text-primary"}`}>
              {isPremium ? "Premium" : "Gratuit"}
            </p>
          </div>
          {!isPremium && (
            <Link href="/upgrade" className="ml-auto px-3 py-1.5 bg-buy text-bg rounded-lg text-xs font-medium hover:bg-buy/90 transition-colors">
              Passer Premium
            </Link>
          )}
        </div>
      </div>

      <button
        onClick={() => signOut({ callbackUrl: "/" })}
        className="mt-6 flex items-center gap-2 text-sm text-muted hover:text-primary transition-colors"
      >
        <SignOut size={16} />
        Se déconnecter
      </button>
    </div>
  );
}
