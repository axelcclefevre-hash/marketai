"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Eye, EyeSlash } from "@phosphor-icons/react";

export default function RegisterForm() {
  const router = useRouter();
  const [email, setEmail]       = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm]   = useState("");
  const [showPwd, setShowPwd]   = useState(false);
  const [error, setError]       = useState("");
  const [loading, setLoading]   = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    if (password !== confirm) { setError("Les mots de passe ne correspondent pas"); return; }
    if (password.length < 8) { setError("Le mot de passe doit contenir au moins 8 caractères"); return; }
    setLoading(true);

    const res = await fetch("/api-backend/auth/register", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password }),
    });
    if (!res.ok) {
      const d = await res.json();
      setError(d.detail || "Erreur lors de l'inscription");
      setLoading(false);
      return;
    }

    await signIn("credentials", { email, password, redirect: false });
    setLoading(false);
    router.push("/upgrade");
  };

  return (
    <div className="w-full max-w-sm">
      <div className="mb-8">
        <h1 className="text-2xl font-medium text-primary">Market<span className="text-buy">AI</span></h1>
        <p className="text-muted text-sm mt-1">Crée ton compte gratuitement</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="text-xs font-medium text-muted ">Email</label>
          <input
            type="email" value={email} onChange={e => setEmail(e.target.value)} required
            className="mt-1.5 w-full bg-surface border border-white/[0.08] rounded-lg px-4 py-3 text-primary text-sm focus:outline-none focus:border-buy transition-colors"
            placeholder="ton@email.com"
          />
        </div>
        <div>
          <label className="text-xs font-medium text-muted ">Mot de passe</label>
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
          <label className="text-xs font-medium text-muted ">Confirmer le mot de passe</label>
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
          {loading ? "Création..." : "Créer mon compte"}
        </button>
      </form>

      <p className="text-center text-sm text-muted mt-6">
        Déjà un compte ?{" "}
        <Link href="/login" className="text-buy hover:underline">Se connecter</Link>
      </p>
    </div>
  );
}
