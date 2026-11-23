"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Eye, EyeSlash } from "@phosphor-icons/react";

export default function LoginForm() {
  const router = useRouter();
  const [email, setEmail]       = useState("");
  const [password, setPassword] = useState("");
  const [showPwd, setShowPwd]   = useState(false);
  const [error, setError]       = useState("");
  const [loading, setLoading]   = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    const res = await signIn("credentials", { email, password, redirect: false });
    setLoading(false);
    if (res?.error) setError("Email ou mot de passe incorrect");
    else router.push("/");
  };

  return (
    <div className="w-full max-w-sm">
      <div className="mb-8">
        <h1 className="text-2xl font-medium text-primary">Market<span className="text-buy">AI</span></h1>
        <p className="text-muted text-sm mt-1">Connecte-toi à ton compte</p>
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
          <div className="flex items-center justify-between mb-1.5">
            <label className="text-xs font-medium text-muted ">Mot de passe</label>
            <Link href="/forgot-password" className="text-xs text-muted hover:text-buy transition-colors">
              Mot de passe oublié ?
            </Link>
          </div>
          <div className="relative">
            <input
              type={showPwd ? "text" : "password"}
              value={password} onChange={e => setPassword(e.target.value)} required
              className="w-full bg-surface border border-white/[0.08] rounded-lg px-4 py-3 pr-11 text-primary text-sm focus:outline-none focus:border-buy transition-colors"
              placeholder="••••••••"
            />
            <button
              type="button"
              onClick={() => setShowPwd(v => !v)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-muted hover:text-primary transition-colors"
              tabIndex={-1}
            >
              {showPwd ? <EyeSlash size={16} /> : <Eye size={16} />}
            </button>
          </div>
        </div>

        {error && <p className="text-sell text-sm">{error}</p>}

        <button
          type="submit" disabled={loading}
          className="w-full bg-white text-bg rounded-lg py-3 text-sm font-medium hover:bg-white/90 active:scale-[0.98] transition-colors disabled:opacity-40"
        >
          {loading ? "Connexion..." : "Se connecter"}
        </button>
      </form>

      <p className="text-center text-sm text-muted mt-6">
        Pas encore de compte ?{" "}
        <Link href="/register" className="text-buy hover:underline">Créer un compte</Link>
      </p>
    </div>
  );
}
