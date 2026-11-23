"use client";

import { useSession } from "next-auth/react";
import Link from "next/link";
import { Crown } from "@phosphor-icons/react";

interface Props {
  feature: string;
  children: React.ReactNode;
}

export default function PremiumGate({ feature, children }: Props) {
  const { data: session, status } = useSession();
  const user = session?.user as any;

  const ADMIN_EMAILS = ["axelcc.lefevre@gmail.com"];

  if (status === "loading") return null;
  if (user?.subscription === "premium" || ADMIN_EMAILS.includes(user?.email)) return <>{children}</>;

  return (
    <div className="bg-surface border border-hold/20 rounded-xl p-10 text-center">
      <Crown size={36} className="text-hold mx-auto mb-3" />
      <h3 className="text-lg font-medium text-primary mb-2">{feature}</h3>
      <p className="text-sm text-muted mb-6">
        {session ? "Cette fonctionnalité est réservée aux abonnés Premium." : "Connecte-toi pour accéder à cette fonctionnalité."}
      </p>
      <div className="flex gap-3 justify-center">
        {!session && (
          <Link href="/login" className="px-4 py-2 border border-white/[0.08] rounded-lg text-sm text-muted hover:text-primary transition-colors">
            Se connecter
          </Link>
        )}
        <Link href="/upgrade" className="px-4 py-2 bg-hold text-bg rounded-lg text-sm font-medium hover:bg-hold/90 transition-colors">
          Passer Premium
        </Link>
      </div>
    </div>
  );
}
