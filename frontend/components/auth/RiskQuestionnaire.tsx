"use client";

import { useState } from "react";

const QUESTIONS = [
  {
    text: "Quel est ton horizon d'investissement ?",
    options: ["Moins de 1 an", "1 à 3 ans", "3 à 10 ans", "Plus de 10 ans"],
  },
  {
    text: "Si ton portefeuille perdait 30% en un mois, tu ferais quoi ?",
    options: ["Je vends tout immédiatement", "J'attends que ça remonte", "Je continue à investir", "J'achète davantage"],
  },
  {
    text: "Quel est ton objectif principal ?",
    options: ["Préserver mon capital", "Revenus réguliers", "Croissance à long terme", "Gains rapides"],
  },
  {
    text: "Quelle est ton expérience en investissement ?",
    options: ["Débutant total", "Quelques ETFs", "Actions régulièrement", "Crypto et produits dérivés"],
  },
  {
    text: "Quel % de ton épargne comptes-tu investir ?",
    options: ["Moins de 10%", "10 à 25%", "25 à 50%", "Plus de 50%"],
  },
];

const PROFILES: Record<string, { label: string; color: string; desc: string }> = {
  conservateur: { label: "Conservateur", color: "#3b82f6", desc: "Stabilité avant tout. Capital protégé avec des rendements modérés." },
  equilibre:    { label: "Équilibré",    color: "#00d97e", desc: "Le meilleur des deux mondes : croissance et protection." },
  croissance:   { label: "Croissance",   color: "#ffd32a", desc: "Rendements élevés avec une volatilité acceptée." },
  agressif:     { label: "Agressif",     color: "#ff4757", desc: "Maximisation des gains, risque élevé assumé." },
};

interface Props {
  onComplete: (profile: string) => void;
}

export default function RiskQuestionnaire({ onComplete }: Props) {
  const [answers, setAnswers] = useState<number[]>([]);
  const [current, setCurrent] = useState(0);
  const [result, setResult] = useState<string | null>(null);

  const computeProfile = (ans: number[]): string => {
    const total = ans.reduce((a, b) => a + b, 0);
    const pct = total / (ans.length * 3);
    if (pct < 0.30) return "conservateur";
    if (pct < 0.55) return "equilibre";
    if (pct < 0.75) return "croissance";
    return "agressif";
  };

  const handleAnswer = (score: number) => {
    const newAnswers = [...answers, score];
    setAnswers(newAnswers);

    if (current < QUESTIONS.length - 1) {
      setCurrent(current + 1);
    } else {
      setResult(computeProfile(newAnswers));
    }
  };

  if (result) {
    const p = PROFILES[result];
    return (
      <div className="text-center max-w-sm mx-auto">
        <div className="w-16 h-16 rounded-full mx-auto mb-4 flex items-center justify-center" style={{ background: `${p.color}20`, border: `2px solid ${p.color}40` }}>
          <span className="text-2xl font-bold" style={{ color: p.color }}>{p.label[0]}</span>
        </div>
        <h3 className="text-xl font-bold text-white mb-2">Profil : {p.label}</h3>
        <p className="text-sm text-[#6b7280] mb-6">{p.desc}</p>
        <button
          onClick={() => onComplete(result)}
          className="w-full py-3 bg-white text-[#0a0a0a] rounded-lg text-sm font-semibold hover:bg-white/90 transition-colors"
        >
          Générer mon portefeuille
        </button>
      </div>
    );
  }

  const q = QUESTIONS[current];
  return (
    <div className="max-w-md">
      <div className="flex gap-1 mb-6">
        {QUESTIONS.map((_, i) => (
          <div key={i} className={`h-1 flex-1 rounded-full ${i <= current ? "bg-[#00d97e]" : "bg-white/[0.08]"}`} />
        ))}
      </div>
      <p className="text-xs text-[#6b7280] uppercase tracking-wider mb-2">Question {current + 1}/{QUESTIONS.length}</p>
      <h3 className="text-lg font-semibold text-white mb-5">{q.text}</h3>
      <div className="space-y-2.5">
        {q.options.map((opt, i) => (
          <button
            key={i}
            onClick={() => handleAnswer(i)}
            className="w-full text-left px-4 py-3 bg-[#111111] border border-white/[0.07] hover:border-[#00d97e]/40 hover:bg-[#00d97e]/5 rounded-lg text-sm text-[#a0a0a0] hover:text-white transition-all"
          >
            {opt}
          </button>
        ))}
      </div>
    </div>
  );
}
