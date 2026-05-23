"use client";

import Image from "next/image";
import { motion } from "framer-motion";
import {
  GraduationCap, Briefcase, Code, TennisBall, Globe,
  LinkedinLogo, ArrowUpRight,
} from "@phosphor-icons/react";

const fade = (delay = 0) => ({
  initial: { opacity: 0, y: 16 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.45, delay, ease: [0.25, 0.46, 0.45, 0.94] },
});

const TIMELINE = [
  {
    period: "2020 – 2023",
    place: "Lycée Saint-Jean de Passy",
    desc: "Bac mention Très Bien (17,18/20) · spé Maths & SES · 12 ans de cours d'anglais à l'American School of Paris",
    icon: GraduationCap,
  },
  {
    period: "2023 – 2025",
    place: "Lycée Louis-le-Grand — CPGE ECG",
    desc: "Classe prépa Maths-Géo en prévision des concours grandes écoles · Admis HEC rang 36, ESSEC rang 30, ESCP rang 17",
    icon: GraduationCap,
  },
  {
    period: "Sept. 2025 →",
    place: "HEC Paris",
    desc: "Master in Management, Grande École — classé #2 mondial FT 2024 · Cours : Comptabilité, Macro/Microéconomie, Finance",
    icon: GraduationCap,
    highlight: true,
  },
  {
    period: "Janv. – Mai 2026",
    place: "National University of Singapore",
    desc: "Exchange semester à la NUS Business School (#1 Asie) · Cours : Investment Analysis & Portfolio Management, Financial Markets, Deep Learning & Gen AI in Business — le terreau de MarketAI.",
    icon: Globe,
    highlight: true,
  },
  {
    period: "Sept. 2025 →",
    place: "PrepAct — CEO & Fondateur",
    desc: "Plateforme d'accompagnement pour les préparationnaires ECG. Cours, mentoring, modules IA.",
    icon: Briefcase,
  },
  {
    period: "Mars 2026 →",
    place: "HEC IA Intelligence — AI Consultant",
    desc: "Stratégie IA pour des fonds M&A, PE et VC. Prospection, pipeline deals, conseil sur des cas d'usage concrets.",
    icon: Briefcase,
  },
  {
    period: "Juin – Août 2026",
    place: "OCDE — Stagiaire (incoming)",
    desc: "Centre de développement · Analyse comparative de politiques de développement · Préparation d'événements internationaux",
    icon: Briefcase,
  },
];

const STACK = [
  { label: "Claude AI", color: "#cc785c" },
  { label: "Next.js 14", color: "#ffffff" },
  { label: "FastAPI", color: "#009688" },
  { label: "Python", color: "#3b82f6" },
  { label: "TypeScript", color: "#60a5fa" },
  { label: "Recharts", color: "#a78bfa" },
  { label: "Stripe", color: "#635bff" },
  { label: "Resend", color: "#00d97e" },
  { label: "Claude Code", color: "#cc785c" },
  { label: "n8n", color: "#f97316" },
];

export default function AboutPage() {
  return (
    <div className="max-w-3xl mx-auto pb-16">
      {/* Hero */}
      <motion.div {...fade(0)} className="flex flex-col sm:flex-row items-start gap-8 mb-14">
        <div className="relative flex-shrink-0">
          <div className="w-28 h-28 rounded-2xl overflow-hidden ring-2 ring-white/[0.08]">
            <Image
              src="/axel.jpg"
              alt="Axel Lefèvre"
              width={112}
              height={112}
              className="object-cover w-full h-full"
              priority
            />
          </div>
          <span className="absolute -bottom-2 -right-2 bg-[#00d97e] text-[#0a0a0a] text-[10px] font-bold px-2 py-0.5 rounded-full">
            HEC · NUS
          </span>
        </div>

        <div className="flex-1 pt-1">
          <h1 className="text-3xl font-bold text-white tracking-tight leading-none mb-2">
            Axel Lefèvre
          </h1>
          <p className="text-[#00d97e] text-sm font-medium mb-3">
            Étudiant HEC Paris · Exchange NUS Singapore · Fondateur de MarketAI
          </p>
          <p className="text-[#9ca3af] text-sm leading-relaxed">
            22 ans, étudiant en Master of Management à HEC Paris. Je passe mon temps à chercher comment l'IA peut rendre la finance plus accessible — MarketAI est la réponse la plus concrète que j'aie trouvée pour l'instant.
          </p>
          <a
            href="https://www.linkedin.com/in/axel-lefevre"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 mt-4 text-xs font-medium text-[#6b7280] hover:text-white transition-colors group"
          >
            <LinkedinLogo size={16} className="text-[#0a66c2]" />
            linkedin.com/in/axel-lefevre
            <ArrowUpRight size={12} className="opacity-0 group-hover:opacity-100 transition-opacity" />
          </a>
        </div>
      </motion.div>

      {/* L'histoire de MarketAI */}
      <motion.section {...fade(0.08)} className="mb-12">
        <h2 className="text-xs font-semibold uppercase tracking-widest text-[#6b7280] mb-5">
          Pourquoi MarketAI ?
        </h2>
        <div className="bg-[#111111] border border-white/[0.07] rounded-xl p-6 space-y-4">
          <p className="text-sm text-[#d1d5db] leading-relaxed">
            En janvier 2026, je m'installe à Singapour pour un semestre d'échange à la{" "}
            <span className="text-white font-medium">National University of Singapore</span>.
            Au programme : <em>Investment Analysis & Portfolio Management</em>, <em>Financial Markets</em>,
            et <em>Deep Learning & Generative AI in Business</em>. Autrement dit, exactement les deux
            sujets qui me passionnent mis côte à côte dans le même emploi du temps.
          </p>
          <p className="text-sm text-[#d1d5db] leading-relaxed">
            À mi-semestre, la question s'impose : est-ce qu'on peut combiner tout ça en un seul projet ?
            Un dashboard qui récupère des données de marché en temps réel, les analyse avec Claude AI,
            génère des allocations de portefeuille, et propose un cours d'investissement interactif basé
            sur ce qu'on est en train d'apprendre en cours. MarketAI est né de cette idée.
          </p>
          <p className="text-sm text-[#d1d5db] leading-relaxed">
            Ce n'est pas un projet de fin d'études avec un jury à convaincre — c'est un outil que j'utilise
            vraiment, construit avec{" "}
            <span className="text-white font-medium">Claude Code</span> pendant des soirées à Singapour.
            Le "Apprendre à investir" reprend littéralement le contenu du cours NUS, transformé en modules
            interactifs avec des graphiques Recharts. Le portefeuille simulé suit une stratégie basée sur
            des signaux IA que je fais tourner tous les jours. C'est un peu mon lab perso.
          </p>
          <div className="flex items-start gap-3 bg-[#00d97e]/5 border border-[#00d97e]/15 rounded-lg p-4 mt-2">
            <span className="text-[#00d97e] text-lg leading-none mt-0.5">↗</span>
            <p className="text-xs text-[#9ca3af] leading-relaxed">
              <span className="text-[#00d97e] font-semibold">Le vrai objectif :</span>{" "}
              rendre l'analyse financière accessible à quelqu'un qui débute, sans sacrifier la rigueur.
              Pas de prédictions magiques, pas de "achetez maintenant" — juste des données claires,
              des signaux transparents et des explications honnêtes sur comment ça marche.
            </p>
          </div>
        </div>
      </motion.section>

      {/* Parcours */}
      <motion.section {...fade(0.14)} className="mb-12">
        <h2 className="text-xs font-semibold uppercase tracking-widest text-[#6b7280] mb-5">
          Parcours
        </h2>
        <div className="space-y-0">
          {TIMELINE.map((item, i) => {
            const Icon = item.icon;
            return (
              <div key={i} className="flex gap-4 pb-6 last:pb-0 relative">
                <div className="flex flex-col items-center flex-shrink-0">
                  <div
                    className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 ${
                      item.highlight
                        ? "bg-[#00d97e]/15 text-[#00d97e]"
                        : "bg-white/[0.04] text-[#6b7280]"
                    }`}
                  >
                    <Icon size={15} weight="fill" />
                  </div>
                  {i < TIMELINE.length - 1 && (
                    <div className="w-px flex-1 bg-white/[0.05] mt-2" />
                  )}
                </div>
                <div className="flex-1 pt-1 pb-2">
                  <div className="flex items-baseline gap-3 flex-wrap mb-1">
                    <span className={`text-sm font-semibold ${item.highlight ? "text-white" : "text-white/80"}`}>
                      {item.place}
                    </span>
                    <span className="text-[10px] font-mono text-[#6b7280]">{item.period}</span>
                  </div>
                  <p className="text-xs text-[#6b7280] leading-relaxed">{item.desc}</p>
                </div>
              </div>
            );
          })}
        </div>
      </motion.section>

      {/* Stack */}
      <motion.section {...fade(0.2)} className="mb-12">
        <h2 className="text-xs font-semibold uppercase tracking-widest text-[#6b7280] mb-5">
          Stack de MarketAI
        </h2>
        <div className="flex flex-wrap gap-2">
          {STACK.map((s) => (
            <span
              key={s.label}
              className="text-xs font-medium px-3 py-1.5 rounded-full bg-white/[0.04] border border-white/[0.06] transition-colors hover:border-white/[0.12]"
              style={{ color: s.color }}
            >
              {s.label}
            </span>
          ))}
        </div>
        <p className="text-xs text-[#6b7280] mt-4 leading-relaxed">
          Tout le code est écrit avec Claude Code. Le backend tourne sur un VPS Hostinger avec Nginx + systemd,
          le frontend est un Next.js 14 (App Router), et les données de marché sont récupérées via yfinance.
          Aucune magie — juste beaucoup de débogage et quelques nuits tardives à Singapour.
        </p>
      </motion.section>

      {/* Langues & intérêts */}
      <motion.section {...fade(0.26)} className="mb-12">
        <h2 className="text-xs font-semibold uppercase tracking-widest text-[#6b7280] mb-5">
          En dehors du code
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div className="bg-[#111111] border border-white/[0.07] rounded-xl p-4">
            <TennisBall size={20} className="text-[#ffd32a] mb-3" />
            <h3 className="text-xs font-semibold text-white mb-1">Sport</h3>
            <p className="text-xs text-[#6b7280] leading-relaxed">
              Tennis et football en compétition. L'un pour la précision, l'autre pour l'esprit d'équipe.
            </p>
          </div>
          <div className="bg-[#111111] border border-white/[0.07] rounded-xl p-4">
            <Globe size={20} className="text-[#3b82f6] mb-3" />
            <h3 className="text-xs font-semibold text-white mb-1">Langues</h3>
            <p className="text-xs text-[#6b7280] leading-relaxed">
              Français (natif) · Anglais (IELTS 8/9) · Espagnol (courant) · Farsi (bases) · Latin (bases)
            </p>
          </div>
          <div className="bg-[#111111] border border-white/[0.07] rounded-xl p-4">
            <Code size={20} className="text-[#00d97e] mb-3" />
            <h3 className="text-xs font-semibold text-white mb-1">Intérêts</h3>
            <p className="text-xs text-[#6b7280] leading-relaxed">
              Géopolitique, IA, Mathématiques. Et apparemment, construire des dashboards financiers à Singapour.
            </p>
          </div>
        </div>
      </motion.section>

      {/* Contact */}
      <motion.section {...fade(0.32)}>
        <h2 className="text-xs font-semibold uppercase tracking-widest text-[#6b7280] mb-5">
          Contact
        </h2>
        <div className="bg-[#111111] border border-white/[0.07] rounded-xl p-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <p className="text-sm text-white font-medium mb-1">Une question sur MarketAI ? Une idée ?</p>
            <p className="text-xs text-[#6b7280]">
              N'hésite pas à me contacter via LinkedIn ou par email.
            </p>
          </div>
          <div className="flex gap-2 flex-shrink-0">
            <a
              href="https://www.linkedin.com/in/axel-lefevre"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-lg text-xs font-semibold bg-[#0a66c2] text-white hover:bg-[#0a66c2]/90 transition-colors"
            >
              <LinkedinLogo size={14} weight="fill" />
              LinkedIn
            </a>
            <a
              href="mailto:axel.lefevre@hec.edu"
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-lg text-xs font-semibold border border-white/[0.08] text-[#6b7280] hover:text-white hover:border-white/[0.15] transition-colors"
            >
              axel.lefevre@hec.edu
            </a>
          </div>
        </div>
      </motion.section>
    </div>
  );
}
