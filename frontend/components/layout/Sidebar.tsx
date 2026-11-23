"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Briefcase, ArrowsLeftRight, FileText, ChartBar, House,
  ChartLineUp, GraduationCap, IdentificationCard, X,
} from "@phosphor-icons/react";

const nav = [
  { href: "/",             label: "Vue d'ensemble",  icon: House },
  { href: "/portfolio",    label: "Portefeuille",     icon: Briefcase },
  { href: "/my-portfolio", label: "Mon portefeuille", icon: ChartLineUp },
  { href: "/learn",        label: "Apprendre",        icon: GraduationCap },
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
        {nav.map(({ href, label, icon: Icon }) => {
          const active = pathname === href || (href !== "/" && pathname.startsWith(href));
          return (
            <Link
              key={href}
              href={href}
              onClick={onClose}
              className={`flex items-center gap-3 px-3 h-9 rounded-lg text-sm transition-colors duration-150 group ${
                active
                  ? "bg-surface2 text-primary shadow-[inset_0_1px_0_rgba(255,255,255,0.08)]"
                  : "text-muted hover:text-primary hover:bg-white/[0.04]"
              }`}
            >
              <Icon size={18} weight={active ? "fill" : "regular"} className="flex-shrink-0" />
              <span className="flex-1">{label}</span>
            </Link>
          );
        })}
      </nav>
    </aside>
  );
}
