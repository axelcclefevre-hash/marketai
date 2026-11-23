"use client";

import { Suspense, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import Link from "next/link";
import { Eye, EyeSlash, CheckCircle } from "@phosphor-icons/react";

function ResetPasswordContent() {
  const params   = useSearchParams();
  const router   = useRouter();
  const token    = params.get("token") ?? "";

  const [password, setPassword] = useState("");
  const [confirm, setConfirm]   = useState("");
  const [showPwd, setShowPwd]   = useState(false);
  const [error, setError]       = useState("");
  const [loading, setLoading]   = useState(false);
  const [done, setDone]         = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    if (password !== confirm) { setError("Les mots de passe ne correspondent pas"); return; }
    if (password.length < 8)  { setError("Minimum 8 caractères"); return; }
    setLoading(true);
    const res = await fetch("/api-backend/auth/reset-password", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ token, new_password: password }),
    });
    setLoading(false);
    if (res.ok) {
      setDone(true);
      setTimeout(() => router.push("/login"), 3000);
    } else {
      const d = await res.json();
      setError(d.detail || "Lien invalide ou expiré");
    }
  };

  if (!token) return (
    <div className="min-h-[calc(100vh-3.5rem)] lg:min-h-screen flex items-center justify-center">
      <div className="text-center">
        <p className="text-sell">Lien invalide.</p>
        <Link href="/forgot-password" className="text-buy text-sm mt-2 inline-block">Demander un nouveau lien</Link>
      </div>
    </div>
  );

  return (
    <div className="min-h-[calc(100vh-3.5rem)] lg:min-h-screen flex items-center justify-center">
      <div className="w-full max-w-sm">
        {done ? (
          <div className="text-center">
            <CheckCircle size={40} className="text-buy mx-auto mb-4" />
            <h2 className="text-xl font-medium text-primary mb-2">Mot de passe mis à jour !</h2>
            <p className="text-muted text-sm">Redirection vers la connexion...</p>
          </div>
        ) : (
          <>
            <div className="mb-8">
              <h1 className="text-2xl font-medium text-primary">Nouveau mot de passe</h1>
              <p className="text-muted text-sm mt-1">Choisis un mot de passe sécurisé d'au moins 8 caractères.</p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="text-xs font-medium text-muted ">Nouveau mot de passe</label>
                <div className="relative mt-1.5">
                  <input
                    type={showPwd ? "text" : "password"}
                    value={password} onChange={e => setPassword(e.target.value)} required
                    className="w-full bg-surface border border-white/[0.08] rounded-lg px-4 py-3 pr-11 text-primary text-sm focus:outline-none focus:border-buy transition-colors"
                    placeholder="Min. 8 caractères"
                  />
                  <button type="button" onClick={() => setShowPwd(v => !v)} tabIndex={-1}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted hover:text-primary transition-colors">
                    {showPwd ? <EyeSlash size={16} /> : <Eye size={16} />}
                  </button>
                </div>
              </div>

              <div>
                <label className="text-xs font-medium text-muted ">Confirmer</label>
                <input
                  type="password" value={confirm} onChange={e => setConfirm(e.target.value)} required
                  className="mt-1.5 w-full bg-surface border border-white/[0.08] rounded-lg px-4 py-3 text-primary text-sm focus:outline-none focus:border-buy transition-colors"
                  placeholder="••••••••"
                />
              </div>

              {error && <p className="text-sell text-sm">{error}</p>}

              <button
                type="submit" disabled={loading}
                className="w-full bg-white text-bg rounded-lg py-3 text-sm font-medium hover:bg-white/90 active:scale-[0.98] transition-colors disabled:opacity-40"
              >
                {loading ? "Mise à jour..." : "Mettre à jour le mot de passe"}
              </button>
            </form>
          </>
        )}
      </div>
    </div>
  );
}

export default function ResetPasswordPage() {
  return <Suspense><ResetPasswordContent /></Suspense>;
}
