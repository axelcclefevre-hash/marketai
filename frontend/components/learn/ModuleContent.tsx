"use client";

import { useState } from "react";
import { getModule, MODULES, QuizQuestion } from "@/lib/learn-content";
import PremiumGate from "@/components/ui/PremiumGate";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowLeft, ArrowRight, CheckCircle, Clock, XCircle, Question } from "@phosphor-icons/react";
import dynamic from "next/dynamic";

const CHART_MAP: Record<string, React.ComponentType> = {
  EfficientFrontier:  dynamic(() => import("@/components/learn/charts/EfficientFrontier"),  { ssr: false }),
  DiversificationEffect: dynamic(() => import("@/components/learn/charts/DiversificationEffect"), { ssr: false }),
  CapitalMarketLine:  dynamic(() => import("@/components/learn/charts/CapitalMarketLine"),  { ssr: false }),
  SecurityMarketLine: dynamic(() => import("@/components/learn/charts/SecurityMarketLine"), { ssr: false }),
  OptionPayoff:       dynamic(() => import("@/components/learn/charts/OptionPayoff"),       { ssr: false }),
  BondPriceDuration:  dynamic(() => import("@/components/learn/charts/BondPriceDuration"),  { ssr: false }),
  RiskReturnScatter:  dynamic(() => import("@/components/learn/charts/RiskReturnScatter"),  { ssr: false }),
};

function renderText(text: string) {
  return text.split("\n\n").map((para, i) => {
    const lines = para.split("\n").map((line, j) => {
      const bold = line.replace(/\*\*(.+?)\*\*/g, '<strong class="text-white font-semibold">$1</strong>');
      const em   = bold.replace(/\*(.+?)\*/g, '<em class="italic text-[#d0d0d0]">$1</em>');
      return <span key={j} dangerouslySetInnerHTML={{ __html: em }} className="block" />;
    });
    return <p key={i} className="text-[#b0b0b0] leading-relaxed text-base mb-4">{lines}</p>;
  });
}

function ModuleQuiz({ questions, color }: { questions: QuizQuestion[]; color: string }) {
  const [answers, setAnswers] = useState<(number | null)[]>(Array(questions.length).fill(null));
  const [submitted, setSubmitted] = useState(false);

  const score = answers.filter((a, i) => a === questions[i].correct).length;

  return (
    <div className="mt-12 border border-white/[0.07] rounded-xl overflow-hidden">
      <div className="px-6 py-4 border-b border-white/[0.07] flex items-center gap-2" style={{ background: `${color}10` }}>
        <Question size={18} style={{ color }} />
        <h3 className="font-semibold text-white">Quiz — Testez vos connaissances</h3>
        <span className="ml-auto text-xs text-muted">{questions.length} questions</span>
      </div>

      <div className="divide-y divide-white/[0.05]">
        {questions.map((q, qi) => {
          const chosen = answers[qi];
          const isCorrect = chosen === q.correct;
          return (
            <div key={qi} className="px-6 py-5">
              <p className="text-base font-medium text-white mb-4">
                <span className="text-muted mr-2">{qi + 1}.</span>{q.question}
              </p>
              <div className="space-y-2">
                {q.options.map((opt, oi) => {
                  const isChosen = chosen === oi;
                  const isRight  = oi === q.correct;
                  let cls = "w-full text-left px-4 py-3 rounded-lg border text-sm transition-all ";
                  if (!submitted) {
                    cls += isChosen
                      ? "border-white/30 bg-white/[0.06] text-white"
                      : "border-white/[0.08] bg-white/[0.02] text-[#b0b0b0] hover:border-white/20 hover:text-white";
                  } else {
                    if (isRight)    cls += "border-buy/40 bg-buy/10 text-buy";
                    else if (isChosen) cls += "border-sell/40 bg-sell/10 text-sell";
                    else            cls += "border-white/[0.06] bg-transparent text-muted";
                  }
                  return (
                    <button
                      key={oi}
                      disabled={submitted}
                      onClick={() => {
                        const next = [...answers];
                        next[qi] = oi;
                        setAnswers(next);
                      }}
                      className={cls}
                    >
                      <span className="font-mono text-[10px] mr-2 opacity-60">{String.fromCharCode(65 + oi)}.</span>
                      {opt}
                    </button>
                  );
                })}
              </div>
              {submitted && (
                <div className={`mt-3 flex items-start gap-2 text-sm ${isCorrect ? "text-buy" : "text-sell"}`}>
                  {isCorrect
                    ? <CheckCircle size={15} className="mt-0.5 flex-shrink-0" />
                    : <XCircle    size={15} className="mt-0.5 flex-shrink-0" />}
                  <span className="text-[#b0b0b0]">{q.explanation}</span>
                </div>
              )}
            </div>
          );
        })}
      </div>

      <div className="px-6 py-4 border-t border-white/[0.07] bg-[#0d0d0d] flex items-center justify-between">
        {submitted ? (
          <div className="flex items-center gap-3">
            <span className="text-2xl font-bold text-white">{score}/{questions.length}</span>
            <span className="text-muted text-sm">
              {score === questions.length ? "Parfait !" : score >= questions.length / 2 ? "Bien joué" : "À revoir"}
            </span>
          </div>
        ) : (
          <span className="text-sm text-muted">{answers.filter(a => a !== null).length}/{questions.length} réponses</span>
        )}
        {!submitted && (
          <button
            onClick={() => setSubmitted(true)}
            disabled={answers.some(a => a === null)}
            className="px-4 py-2 rounded-lg text-sm font-semibold transition-all disabled:opacity-30"
            style={{ background: color, color: "#141415" }}
          >
            Valider
          </button>
        )}
        {submitted && (
          <button
            onClick={() => { setAnswers(Array(questions.length).fill(null)); setSubmitted(false); }}
            className="px-4 py-2 rounded-lg text-sm font-medium border border-white/[0.08] text-muted hover:text-white transition-all"
          >
            Recommencer
          </button>
        )}
      </div>
    </div>
  );
}

function ModuleInner({ moduleId }: { moduleId: string }) {
  const mod = getModule(moduleId);
  const router = useRouter();

  if (!mod) return (
    <div className="text-center py-20">
      <p className="text-sell">Module introuvable.</p>
      <Link href="/learn" className="text-buy text-sm mt-2 inline-block">← Retour aux modules</Link>
    </div>
  );

  const idx  = MODULES.findIndex(m => m.id === moduleId);
  const prev = idx > 0 ? MODULES[idx - 1] : null;
  const next = idx < MODULES.length - 1 ? MODULES[idx + 1] : null;

  return (
    <div className="max-w-3xl mx-auto">
      {/* Back */}
      <Link href="/learn" className="inline-flex items-center gap-1.5 text-sm text-muted hover:text-white transition-colors mb-6">
        <ArrowLeft size={14} /> Tous les modules
      </Link>

      {/* Header */}
      <div className="mb-8 pb-6 border-b border-white/[0.07]">
        <div className="flex items-center gap-2 mb-3">
          <span className="text-xs font-semibold text-muted uppercase tracking-wider">Module {mod.number}</span>
          <span className="w-1 h-1 rounded-full bg-muted" />
          <span className="text-xs text-muted flex items-center gap-1"><Clock size={11} /> {mod.duration}</span>
        </div>
        <h1 className="text-3xl font-bold text-white mb-2">{mod.title}</h1>
        <p className="text-muted">{mod.subtitle}</p>
      </div>

      {/* Sections */}
      <div className="space-y-12">
        {mod.sections.map((section, i) => {
          const Chart = section.chart ? CHART_MAP[section.chart] : null;
          return (
            <div key={section.id} id={section.id}>
              <h2 className="text-xl font-semibold text-white mb-4 flex items-center gap-3">
                <span
                  className="w-7 h-7 rounded-lg flex items-center justify-center text-xs font-bold flex-shrink-0"
                  style={{ background: `${mod.color}20`, color: mod.color }}
                >
                  {i + 1}
                </span>
                {section.title}
              </h2>

              <div className="space-y-1 mb-5">{renderText(section.content)}</div>

              {section.formula && (
                <div className="bg-[#0d0d0d] border border-white/[0.07] rounded-xl p-5 mb-5 font-mono text-sm">
                  <p className="text-[10px] text-muted uppercase tracking-wider mb-2">Formule clé</p>
                  {section.formula.split("\n").map((line, i) => (
                    <p key={i} className={`${line.startsWith("Où") || line.startsWith("-") || line.startsWith("Example") ? "text-muted text-xs" : "text-buy"} leading-relaxed`}>
                      {line}
                    </p>
                  ))}
                </div>
              )}

              {Chart && (
                <div className="mb-5">
                  <Chart />
                </div>
              )}

              {section.tip && (
                <div className="border-l-2 border-hold pl-4 py-2 bg-hold/5 rounded-r-lg">
                  <p className="text-xs font-semibold text-hold mb-1">Conseil pratique</p>
                  <p className="text-base text-[#b0b0b0] leading-relaxed">{section.tip}</p>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Key takeaways */}
      <div className="mt-12 bg-surface border border-white/[0.07] rounded-xl p-6">
        <h3 className="text-sm font-semibold text-white uppercase tracking-wider mb-4 flex items-center gap-2">
          <CheckCircle size={16} style={{ color: mod.color }} /> Points clés à retenir
        </h3>
        <ul className="space-y-2.5">
          {mod.keyTakeaways.map((t, i) => (
            <li key={i} className="flex items-start gap-2.5 text-base text-[#b0b0b0]">
              <span className="w-1.5 h-1.5 rounded-full bg-buy flex-shrink-0 mt-1.5" />
              {t}
            </li>
          ))}
        </ul>
      </div>

      {/* Quiz */}
      {mod.quiz && mod.quiz.length > 0 && (
        <ModuleQuiz questions={mod.quiz} color={mod.color} />
      )}

      {/* Navigation prev/next */}
      <div className="flex items-center justify-between mt-8 pt-6 border-t border-white/[0.07]">
        {prev ? (
          <Link href={`/learn/${prev.id}`} className="flex items-center gap-2 text-sm text-muted hover:text-white transition-colors">
            <ArrowLeft size={14} />
            <div>
              <p className="text-[10px] uppercase tracking-wider">Précédent</p>
              <p className="font-medium">{prev.title}</p>
            </div>
          </Link>
        ) : <div />}
        {next ? (
          <Link href={`/learn/${next.id}`} className="flex items-center gap-2 text-sm text-muted hover:text-white transition-colors text-right">
            <div>
              <p className="text-[10px] uppercase tracking-wider">Suivant</p>
              <p className="font-medium">{next.title}</p>
            </div>
            <ArrowRight size={14} />
          </Link>
        ) : <div />}
      </div>
    </div>
  );
}

export default function ModuleContent({ moduleId }: { moduleId: string }) {
  return (
    <PremiumGate feature="Apprendre à investir">
      <ModuleInner moduleId={moduleId} />
    </PremiumGate>
  );
}
