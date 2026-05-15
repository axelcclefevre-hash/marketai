"use client";

import { useState } from "react";
import Link from "next/link";
import { ArrowLeft, CheckCircle } from "@phosphor-icons/react";

export default function ForgotPasswordPage() {
  const [email, setEmail]   = useState("");
  const [sent, setSent]     = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    await fetch("/api-backend/auth/forgot-password", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email }),
    });
    setLoading(false);
    setSent(true);
  };

  return (
    <div className="min-h-screen flex items-center justify-center" style={{ marginLeft: -260 }}>
      <div className="w-full max-w-sm">
        <Link href="/login" className="inline-flex items-center gap-1.5 text-sm text-[#6b7280] hover:text-white transition-colors mb-8">
          <ArrowLeft size={14} /> Retour à la connexion
        </Link>

        {sent ? (
          <div className="text-center">
            <CheckCircle size={40} className="text-[#00d97e] mx-auto mb-4" />
            <h2 className="text-xl font-bold text-white mb-2">Email envoyé !</h2>
            <p className="text-[#6b7280] text-sm leading-relaxed">
              Si un compte existe avec l'adresse <strong className="text-white">{email}</strong>,
              tu recevras un lien de réinitialisation valable 1 heure.
            </p>
            <p className="text-xs text-[#6b7280] mt-4">Vérifie aussi tes spams.</p>
          </div>
        ) : (
          <>
            <div className="mb-8">
              <h1 className="text-2xl font-bold text-white">Mot de passe oublié</h1>
              <p className="text-[#6b7280] text-sm mt-1">
                Entre ton email pour recevoir un lien de réinitialisation.
              </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="text-xs font-medium text-[#6b7280] uppercase tracking-wider">Email</label>
                <input
                  type="email" value={email} onChange={e => setEmail(e.target.value)} required
                  className="mt-1.5 w-full bg-[#111111] border border-white/[0.08] rounded-lg px-4 py-3 text-white text-sm focus:outline-none focus:border-[#00d97e] transition-colors"
                  placeholder="ton@email.com"
                />
              </div>
              <button
                type="submit" disabled={loading}
                className="w-full bg-white text-[#0a0a0a] rounded-lg py-3 text-sm font-semibold hover:bg-white/90 active:scale-[0.98] transition-all disabled:opacity-40"
              >
                {loading ? "Envoi en cours..." : "Envoyer le lien"}
              </button>
            </form>
          </>
        )}
      </div>
    </div>
  );
}
