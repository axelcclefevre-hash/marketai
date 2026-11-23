"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useSession } from "next-auth/react";
import {
  Briefcase, ArrowsLeftRight, FileText, ChartBar, House,
  User, Crown, ChartLineUp, GraduationCap, IdentificationCard, X,
} from "@phosphor-icons/react";

const nav = [
  { href: "/",             label: "Vue d'ensemble",  icon: House },
  { href: "/portfolio",    label: "Portefeuille",     icon: Briefcase },
  { href: "/my-portfolio", label: "Mon portefeuille", icon: ChartLineUp,       premiumOnly: true },
  { href: "/learn",        label: "Apprendre",        icon: GraduationCap,     premiumOnly: true },
  { href: "/correlations", label: "Corrélations",     icon: ArrowsLeftRight },
  { href: "/macro",        label: "Rapport macro",    icon: FileText },
  { href: "/backtest",     label: "Backtesting",      icon: ChartBar },
  { href: "/about",        label: "À propos",         icon: IdentificationCard },
];

interface Props {
  mobileOpen: boolean;
  onClose: () => void;
}

export default function Sidebar({ mobileOpen, onClose }: Props) {
  const pathname  = usePathname();
  const { data: session } = useSession();
  const user = session?.user as any;
  const isPremium = user?.subscription === "premium";

  return (
    <aside
      className={`
        fixed left-0 top-0 h-full w-[240px] bg-deep border-r border-border
        flex flex-col z-40 flex-shrink-0
        transition-transform duration-200 ease-in-out
        ${mobileOpen ? "translate-x-0" : "-translate-x-full"}
        lg:translate-x-0
      `}
    >
      {/* Logo */}
      <div className="px-5 h-16 border-b border-border flex items-center justify-between">
        <div className="text-lg font-medium tracking-tight text-primary">Market<span className="text-buy">AI</span></div>
        {/* Bouton fermeture — mobile seulement */}
        <button
          onClick={onClose}
          className="lg:hidden w-8 h-8 flex items-center justify-center rounded-lg text-muted hover:text-primary hover:bg-white/[0.06] transition-colors"
          aria-label="Fermer le menu"
        >
          <X size={18} />
        </button>
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
              onClick={onClose}
              className={`flex items-center gap-3 px-3 h-9 rounded-lg text-sm transition-colors duration-150 group ${
                active
                  ? "bg-surface2 text-primary shadow-[inset_0_1px_0_rgba(255,255,255,0.08)]"
                  : locked
                  ? "text-muted hover:text-primary"
                  : "text-muted hover:text-primary hover:bg-white/[0.04]"
              }`}
            >
              <Icon size={18} weight={active ? "fill" : "regular"} className="flex-shrink-0" />
              <span className="flex-1">{label}</span>
              {premiumOnly && !isPremium && (
                <span className="text-xs text-muted">Pro</span>
              )}
              {premiumOnly && isPremium && (
                <span className="text-xs text-buy">Pro</span>
              )}
            </Link>
          );
        })}
      </nav>

      {/* Footer — auth */}
      <div className="border-t border-border p-3 space-y-1">
        {session ? (
          <>
            {isPremium && (
              <div className="flex items-center gap-2 px-3 py-2 mb-1">
                <Crown size={14} className="text-hold" />
                <span className="text-xs text-hold font-medium">Premium actif</span>
              </div>
            )}
            <Link
              href="/profile"
              onClick={onClose}
              className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm text-muted hover:text-primary hover:bg-white/[0.04] transition-colors"
            >
              <User size={16} />
              <span className="flex-1 truncate text-xs">{user?.email}</span>
            </Link>
            {!isPremium && (
              <Link
                href="/upgrade"
                onClick={onClose}
                className="flex items-center gap-3 px-3 py-2 rounded-lg text-xs font-medium text-hold bg-hold/8 hover:bg-hold/12 transition-colors"
              >
                <Crown size={14} />
                Passer Premium
              </Link>
            )}
          </>
        ) : (
          <div className="space-y-1.5">
            <Link
              href="/login"
              onClick={onClose}
              className="flex items-center justify-center gap-2 px-3 py-2.5 rounded-lg text-sm text-primary bg-white/[0.06] hover:bg-white/[0.10] transition-colors font-medium"
            >
              Se connecter
            </Link>
            <Link
              href="/register"
              onClick={onClose}
              className="flex items-center justify-center gap-2 px-3 py-2 rounded-lg text-xs text-muted hover:text-primary transition-colors"
            >
              Créer un compte
            </Link>
          </div>
        )}
      </div>
    </aside>
  );
}
