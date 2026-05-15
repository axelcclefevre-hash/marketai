"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useSession, signOut } from "next-auth/react";
import {
  Briefcase, ArrowsLeftRight, FileText, ChartBar, House,
  User, Crown, SignOut, ChartLineUp, GraduationCap,
} from "@phosphor-icons/react";

const nav = [
  { href: "/",             label: "Vue d'ensemble", icon: House },
  { href: "/portfolio",    label: "Portefeuille",   icon: Briefcase },
  { href: "/my-portfolio", label: "Mon portefeuille", icon: ChartLineUp, premiumOnly: true },
  { href: "/learn",        label: "Apprendre",        icon: GraduationCap, premiumOnly: true },
  { href: "/correlations", label: "Corrélations",   icon: ArrowsLeftRight },
  { href: "/macro",        label: "Rapport macro",  icon: FileText },
  { href: "/backtest",     label: "Backtesting",    icon: ChartBar },
];

export default function Sidebar() {
  const pathname  = usePathname();
  const { data: session } = useSession();
  const user = session?.user as any;
  const isPremium = user?.subscription === "premium";

  return (
    <aside style={{ width: 260 }} className="fixed left-0 top-0 h-full bg-[#111111] border-r border-white/[0.06] flex flex-col z-40 flex-shrink-0">
      {/* Logo */}
      <div className="px-6 py-6 border-b border-white/[0.06]">
        <div className="text-2xl font-bold text-white tracking-tight leading-none">
          Market<span className="text-[#00d97e]">AI</span>
        </div>
        <div className="flex items-center gap-2 mt-2">
          <span className="w-2 h-2 bg-[#00d97e] rounded-full animate-blink flex-shrink-0" />
          <span className="text-xs text-[#6b7280] tracking-wide">Marchés en direct</span>
        </div>
      </div>

      {/* Nav */}
      <nav className="flex-1 py-4 space-y-0.5 px-3 overflow-y-auto">
        {nav.map(({ href, label, icon: Icon, premiumOnly }) => {
          const active = pathname === href || (href !== "/" && pathname.startsWith(href));
          const locked = premiumOnly && !isPremium;
          return (
            <Link
              key={href}
              href={href}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-150 group ${
                active
                  ? "bg-white/[0.08] text-white"
                  : locked
                  ? "text-[#6b7280]/50 hover:text-[#6b7280]"
                  : "text-[#6b7280] hover:text-white hover:bg-white/[0.04]"
              }`}
            >
              <Icon size={18} weight={active ? "fill" : "regular"} className="flex-shrink-0" />
              <span className="flex-1">{label}</span>
              {premiumOnly && !isPremium && (
                <Crown size={12} className="text-[#ffd32a]/60" />
              )}
              {premiumOnly && isPremium && (
                <span className="text-[9px] font-bold text-[#ffd32a] bg-[#ffd32a]/10 px-1.5 py-0.5 rounded">PRO</span>
              )}
            </Link>
          );
        })}
      </nav>

      {/* Footer — auth */}
      <div className="border-t border-white/[0.06] p-3 space-y-1">
        {session ? (
          <>
            {isPremium && (
              <div className="flex items-center gap-2 px-3 py-2 mb-1">
                <Crown size={14} className="text-[#ffd32a]" />
                <span className="text-xs text-[#ffd32a] font-semibold">Premium actif</span>
              </div>
            )}
            <Link href="/profile" className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm text-[#6b7280] hover:text-white hover:bg-white/[0.04] transition-all">
              <User size={16} />
              <span className="flex-1 truncate text-xs">{user?.email}</span>
            </Link>
            {!isPremium && (
              <Link href="/upgrade" className="flex items-center gap-3 px-3 py-2 rounded-lg text-xs font-semibold text-[#ffd32a] bg-[#ffd32a]/8 hover:bg-[#ffd32a]/12 transition-all">
                <Crown size={14} />
                Passer Premium
              </Link>
            )}
          </>
        ) : (
          <div className="space-y-1.5">
            <Link href="/login" className="flex items-center justify-center gap-2 px-3 py-2.5 rounded-lg text-sm text-white bg-white/[0.06] hover:bg-white/[0.10] transition-all font-medium">
              Se connecter
            </Link>
            <Link href="/register" className="flex items-center justify-center gap-2 px-3 py-2 rounded-lg text-xs text-[#6b7280] hover:text-white transition-all">
              Créer un compte
            </Link>
          </div>
        )}
      </div>
    </aside>
  );
}
