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

const EDUCATION = [
  {
    period: "Sept. 2025 →",
    place: "HEC Paris",
    desc: "Master in Management, Grande École, classé #2 mondial FT 2024. Cours : Comptabilité, Macro/Microéconomie, Finance, Droit des contrats.",
    highlight: true,
  },
  {
    period: "Janv. – Mai 2026",
    place: "National University of Singapore",
    desc: "Exchange semester à la NUS Business School, #1 Asie. Cours : Investment Analysis & Portfolio Management, Financial Markets, Deep Learning & Gen AI in Business. Le terreau de MarketAI.",
    highlight: true,
  },
];

const EXPERIENCE = [
  {
    period: "Mars 2026 →",
    place: "HEC IA Intelligence",
    role: "AI Consultant, Head of Prospecting",
    desc: "Stratégie IA pour des fonds M&A, PE et VC. Prospection, pipeline deals, conseil sur des cas d'usage concrets en automatisation.",
  },
  {
    period: "Sept. 2025 →",
    place: "PrepAct",
    role: "CEO & Fondateur",
    desc: "Plateforme d'accompagnement pour les préparationnaires ECG. Cours en ligne, mentoring, modules IA intégrés.",
  },
  {
    period: "Juin – Août 2026",
    place: "OCDE, Centre de développement",
    role: "Stagiaire (incoming)",
    desc: "Analyse comparative de politiques de développement africaines, asiatiques et latino-américaines. Préparation d'événements internationaux.",
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
  { label: "Resend", color: "#4cc38a" },
  { label: "Claude Code", color: "#cc785c" },
  { label: "n8n", color: "#f97316" },
];

export default function AboutPage() {
  return (
    <div className="max-w-3xl mx-auto pb-16">

      {/* Hero */}
      <motion.div {...fade(0)} className="flex flex-col sm:flex-row items-start gap-8 mb-14">
        <div className="relative flex-shrink-0">
          <div className="w-32 h-32 rounded-2xl overflow-hidden ring-2 ring-white/[0.08]">
            <Image
              src="/axel.jpg"
              alt="Axel Lefèvre"
              width={128}
              height={128}
              className="object-cover w-full h-full"
              priority
            />
          </div>
          <span className="absolute -bottom-2 -right-2 bg-buy text-bg text-xs font-medium px-2 py-0.5 rounded-full">
            HEC · NUS
          </span>
        </div>

        <div className="flex-1 pt-1">
          <h1 className="text-4xl font-medium text-primary tracking-tight leading-none mb-3">
            Axel Lefèvre
          </h1>
          <p className="text-buy text-base font-medium mb-4">
            Étudiant HEC Paris, Exchange NUS Singapore, Fondateur de MarketAI
          </p>
          <p className="text-[#9ca3af] text-base leading-relaxed">
            20 ans, étudiant en Master of Management à HEC Paris. Je passe mon temps à chercher comment l'IA peut rendre la finance plus accessible, et MarketAI est la réponse la plus concrète que j'aie trouvée pour l'instant.
          </p>
          <a
            href="https://www.linkedin.com/in/axel-lefevre"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 mt-5 text-sm font-medium text-muted hover:text-primary transition-colors group"
          >
            <LinkedinLogo size={18} className="text-[#0a66c2]" />
            linkedin.com/in/axel-lefevre
            <ArrowUpRight size={13} className="opacity-0 group-hover:opacity-100 transition-opacity" />
          </a>
        </div>
      </motion.div>

      {/* Pourquoi MarketAI */}
      <motion.section {...fade(0.08)} className="mb-14">
        <h2 className="text-sm font-medium text-muted mb-5">
          Pourquoi MarketAI ?
        </h2>
        <div className="card p-7 space-y-5">
          <p className="text-base text-[#d1d5db] leading-relaxed">
            En janvier 2026, je m'installe à Singapour pour un semestre d'échange à la{" "}
            <span className="text-primary font-medium">National University of Singapore</span>.
            Au programme : <em>Investment Analysis & Portfolio Management</em>, <em>Financial Markets</em>,
            et <em>Deep Learning & Generative AI in Business</em>. Exactement les deux sujets qui me
            passionnent, mis côte à côte dans le même emploi du temps.
          </p>
          <p className="text-base text-[#d1d5db] leading-relaxed">
            À mi-semestre, la question s'impose : est-ce qu'on peut combiner tout ça en un seul projet ?
            Un dashboard qui récupère des données de marché en temps réel, les analyse avec Claude AI,
            génère des allocations de portefeuille, et propose un cours d'investissement interactif basé
            sur ce qu'on est en train d'apprendre en cours. MarketAI est né de cette idée.
          </p>
          <p className="text-base text-[#d1d5db] leading-relaxed">
            Ce n'est pas un projet de fin d'études avec un jury à convaincre. C'est un outil que j'utilise
            vraiment, construit avec{" "}
            <span className="text-primary font-medium">Claude Code</span> pendant des soirées à Singapour.
            Le "Apprendre à investir" reprend le contenu du cours NUS transformé en modules
            interactifs avec des graphiques. Le portefeuille simulé suit une stratégie basée sur
            des signaux IA qui tournent tous les jours. C'est un peu mon lab perso.
          </p>
          <div className="flex items-start gap-3 bg-buy/5 border border-buy/15 rounded-lg p-5">
            <span className="text-buy text-xl leading-none mt-0.5">↗</span>
            <p className="text-sm text-[#9ca3af] leading-relaxed">
              <span className="text-buy font-medium">L'objectif :</span>{" "}
              rendre l'analyse financière accessible à quelqu'un qui débute, sans sacrifier la rigueur.
              Pas de prédictions magiques, pas de "achetez maintenant", juste des données claires,
              des signaux transparents et des explications honnêtes sur comment ça marche.
            </p>
          </div>
        </div>
      </motion.section>

      {/* Parcours — Formation */}
      <motion.section {...fade(0.14)} className="mb-14">
        <h2 className="text-sm font-medium text-muted mb-5">
          Formation
        </h2>
        <div className="space-y-4">
          {EDUCATION.map((item, i) => (
            <div
              key={i}
              className={`rounded-xl p-6 border ${
                item.highlight
                  ? "bg-buy/5 border-buy/20"
                  : "bg-surface border-white/[0.07]"
              }`}
            >
              <div className="flex items-start justify-between gap-4 flex-wrap mb-2">
                <div className="flex items-center gap-2">
                  <GraduationCap
                    size={18}
                    weight="fill"
                    className={item.highlight ? "text-buy" : "text-muted"}
                  />
                  <span className="text-base font-medium text-primary">{item.place}</span>
                </div>
                <span className="text-sm font-mono text-muted flex-shrink-0">{item.period}</span>
              </div>
              <p className="text-sm text-[#9ca3af] leading-relaxed pl-7">{item.desc}</p>
            </div>
          ))}
        </div>
      </motion.section>

      {/* Parcours — Expériences */}
      <motion.section {...fade(0.2)} className="mb-14">
        <h2 className="text-sm font-medium text-muted mb-5">
          Expériences
        </h2>
        <div className="space-y-0">
          {EXPERIENCE.map((item, i) => (
            <div key={i} className="flex gap-4 pb-7 last:pb-0 relative">
              <div className="flex flex-col items-center flex-shrink-0">
                <div className="w-9 h-9 rounded-lg bg-white/[0.04] flex items-center justify-center flex-shrink-0">
                  <Briefcase size={16} weight="fill" className="text-muted" />
                </div>
                {i < EXPERIENCE.length - 1 && (
                  <div className="w-px flex-1 bg-white/[0.05] mt-2" />
                )}
              </div>
              <div className="flex-1 pt-1">
                <div className="flex items-baseline gap-3 flex-wrap mb-1">
                  <span className="text-base font-medium text-primary">{item.place}</span>
                  <span className="text-sm font-mono text-muted">{item.period}</span>
                </div>
                <p className="text-sm font-medium text-buy mb-2">{item.role}</p>
                <p className="text-sm text-muted leading-relaxed">{item.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </motion.section>

      {/* Stack */}
      <motion.section {...fade(0.26)} className="mb-14">
        <h2 className="text-sm font-medium text-muted mb-5">
          Stack de MarketAI
        </h2>
        <div className="flex flex-wrap gap-2 mb-5">
          {STACK.map((s) => (
            <span
              key={s.label}
              className="text-sm font-medium px-4 py-1.5 rounded-full bg-white/[0.04] border border-white/[0.06] hover:border-white/[0.12] transition-colors"
              style={{ color: s.color }}
            >
              {s.label}
            </span>
          ))}
        </div>
        <p className="text-sm text-muted leading-relaxed">
          Tout le code est écrit avec Claude Code. Le backend tourne sur un VPS Hostinger avec Nginx et systemd,
          le frontend est un Next.js 14 (App Router), et les données de marché sont récupérées via yfinance.
          Pas de magie, juste beaucoup de débogage et quelques nuits tardives à Singapour.
        </p>
      </motion.section>

      {/* En dehors du code */}
      <motion.section {...fade(0.32)} className="mb-14">
        <h2 className="text-sm font-medium text-muted mb-5">
          En dehors du code
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="card p-5">
            <TennisBall size={22} className="text-hold mb-3" />
            <h3 className="text-sm font-medium text-primary mb-2">Sport</h3>
            <p className="text-sm text-muted leading-relaxed">
              Tennis et football en compétition. L'un pour la précision, l'autre pour l'esprit d'équipe.
            </p>
          </div>
          <div className="card p-5">
            <Globe size={22} className="text-[#3b82f6] mb-3" />
            <h3 className="text-sm font-medium text-primary mb-2">Langues</h3>
            <p className="text-sm text-muted leading-relaxed">
              Français (natif), Anglais IELTS 8/9, Espagnol (courant), Farsi (bases), Latin (bases).
            </p>
          </div>
          <div className="card p-5">
            <Code size={22} className="text-buy mb-3" />
            <h3 className="text-sm font-medium text-primary mb-2">Intérêts</h3>
            <p className="text-sm text-muted leading-relaxed">
              Géopolitique, IA, Mathématiques. Et apparemment, construire des dashboards financiers à Singapour.
            </p>
          </div>
        </div>
      </motion.section>

      {/* Contact */}
      <motion.section {...fade(0.38)}>
        <h2 className="text-sm font-medium text-muted mb-5">
          Contact
        </h2>
        <div className="card p-7 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-5">
          <div>
            <p className="text-base text-primary font-medium mb-1">Une question sur MarketAI ? Une idée ?</p>
            <p className="text-sm text-muted">
              N'hésite pas à me contacter via LinkedIn ou par email.
            </p>
          </div>
          <div className="flex gap-3 flex-shrink-0">
            <a
              href="https://www.linkedin.com/in/axel-lefevre"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-5 py-3 rounded-lg text-sm font-medium bg-[#0a66c2] text-primary hover:bg-[#0a66c2]/90 transition-colors"
            >
              <LinkedinLogo size={16} weight="fill" />
              LinkedIn
            </a>
            <a
              href="mailto:axel.lefevre@hec.edu"
              className="inline-flex items-center gap-2 px-5 py-3 rounded-lg text-sm font-medium border border-white/[0.08] text-muted hover:text-primary hover:border-white/[0.15] transition-colors"
            >
              axel.lefevre@hec.edu
            </a>
          </div>
        </div>
      </motion.section>

    </div>
  );
}
