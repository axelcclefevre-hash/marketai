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

  if (status === "loading") return null;
  if (user?.subscription === "premium") return <>{children}</>;

  return (
    <div className="bg-[#111111] border border-[#ffd32a]/20 rounded-xl p-10 text-center">
      <Crown size={36} className="text-[#ffd32a] mx-auto mb-3" />
      <h3 className="text-lg font-semibold text-white mb-2">{feature}</h3>
      <p className="text-sm text-[#6b7280] mb-6">
        {session ? "Cette fonctionnalité est réservée aux abonnés Premium." : "Connecte-toi pour accéder à cette fonctionnalité."}
      </p>
      <div className="flex gap-3 justify-center">
        {!session && (
          <Link href="/login" className="px-4 py-2 border border-white/[0.08] rounded-lg text-sm text-[#6b7280] hover:text-white transition-colors">
            Se connecter
          </Link>
        )}
        <Link href="/upgrade" className="px-4 py-2 bg-[#ffd32a] text-[#0a0a0a] rounded-lg text-sm font-semibold hover:bg-[#ffd32a]/90 transition-colors">
          Passer Premium
        </Link>
      </div>
    </div>
  );
}
