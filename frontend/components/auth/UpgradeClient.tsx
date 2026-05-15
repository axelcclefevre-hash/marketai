"use client";

import { useSession } from "next-auth/react";
import { useState } from "react";
import Link from "next/link";
import { Check, Crown, ChartLine, FileText, Briefcase } from "@phosphor-icons/react";

const FREE_FEATURES = [
  "Vue d'ensemble des marchés",
  "Rapport macro (1/jour)",
  "Backtesting (3 runs/jour)",
  "Matrice de corrélations",
  "Portefeuille générique",
];

const PREMIUM_FEATURES = [
  "Tout le plan gratuit",
  "Portefeuille personnel sur mesure",
  "Questionnaire de profil de risque",
  "Rapport macro illimité + news",
  "Backtesting illimité",
  "Allocation Claude personnalisée",
];

export default function UpgradeClient() {
  const { data: session } = useSession();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const user = session?.user as any;
  const isPremium = user?.subscription === "premium";

  const handleCheckout = async () => {
    if (!session) { window.location.href = "/register"; return; }
    setLoading(true);
    setError("");
    try {
      const res = await fetch("/api/stripe/create-checkout", {
        method: "POST",
        headers: { Authorization: `Bearer ${user?.apiToken}` },
      });
      const d = await res.json();
      if (res.ok && d.checkout_url) {
        window.location.href = d.checkout_url;
      } else {
        setError(d.detail || "Erreur lors de la création du paiement");
        setLoading(false);
      }
    } catch (e) {
      setError("Impossible de contacter le serveur");
      setLoading(false);
    }
  };

  return (
    <div>
      <div className="mb-10 text-center">
        <Crown size={32} className="text-[#ffd32a] mx-auto mb-3" />
        <h1 className="text-3xl font-bold text-white">Choisissez votre plan</h1>
        <p className="text-[#6b7280] mt-2">Commencez gratuitement, passez Premium quand vous êtes prêt.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-5 max-w-3xl mx-auto">
        {/* Free */}
        <div className="bg-[#111111] border border-white/[0.07] rounded-xl p-6">
          <h2 className="text-lg font-semibold text-white mb-1">Gratuit</h2>
          <p className="text-3xl font-bold text-white mb-1">0 €<span className="text-sm text-[#6b7280] font-normal">/mois</span></p>
          <p className="text-xs text-[#6b7280] mb-6">Pour découvrir MarketAI</p>
          <ul className="space-y-2.5 mb-6">
            {FREE_FEATURES.map(f => (
              <li key={f} className="flex items-center gap-2.5 text-sm text-[#a0a0a0]">
                <Check size={14} className="text-[#00d97e] flex-shrink-0" />{f}
              </li>
            ))}
          </ul>
          <Link href="/" className="block text-center py-2.5 border border-white/[0.08] rounded-lg text-sm text-[#6b7280] hover:text-white transition-colors">
            Continuer gratuitement
          </Link>
        </div>

        {/* Premium */}
        <div className="bg-[#111111] border border-[#ffd32a]/30 rounded-xl p-6 relative">
          <div className="absolute top-4 right-4 px-2 py-0.5 bg-[#ffd32a] text-[#0a0a0a] rounded text-[10px] font-bold uppercase tracking-wider">
            Recommandé
          </div>
          <h2 className="text-lg font-semibold text-white mb-1">Premium</h2>
          <p className="text-3xl font-bold text-white mb-1">9,99 €<span className="text-sm text-[#6b7280] font-normal">/mois</span></p>
          <p className="text-xs text-[#6b7280] mb-6">Accès complet à toutes les fonctionnalités</p>
          <ul className="space-y-2.5 mb-6">
            {PREMIUM_FEATURES.map(f => (
              <li key={f} className="flex items-center gap-2.5 text-sm text-[#a0a0a0]">
                <Check size={14} className="text-[#ffd32a] flex-shrink-0" />{f}
              </li>
            ))}
          </ul>
          {error && <p className="text-[#ff4757] text-xs mb-2">{error}</p>}
          {isPremium ? (
            <div className="text-center py-2.5 bg-[#ffd32a]/10 border border-[#ffd32a]/20 rounded-lg text-sm text-[#ffd32a] font-semibold">
              Déjà Premium
            </div>
          ) : (
            <button
              onClick={handleCheckout} disabled={loading}
              className="w-full py-2.5 bg-[#ffd32a] text-[#0a0a0a] rounded-lg text-sm font-semibold hover:bg-[#ffd32a]/90 active:scale-[0.98] transition-all disabled:opacity-40"
            >
              {loading ? "Redirection..." : session ? "S'abonner maintenant" : "Créer un compte"}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
