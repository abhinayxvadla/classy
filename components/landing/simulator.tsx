"use client";

import { useState } from "react";
import {
  Bot,
  Smartphone,
  Sparkles,
  CheckCircle2,
  ShieldCheck,
  Zap,
  ArrowRight,
  Clock,
  RotateCcw,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

interface DemoScenario {
  id: string;
  label: string;
  prompt: string;
  toolCall: string;
  itemType: string;
  studentView: {
    title: string;
    badge: string;
    question: string;
    options: string[];
    correctIndex: number;
    explanation: string;
  };
}

const DEMO_SCENARIOS: DemoScenario[] = [
  {
    id: "quiz",
    label: "Timed Quiz",
    prompt: "Create a 5-question timed quiz on Chemical Reactions for Class 10 with answer keys and explanations.",
    toolCall: "create_quiz(batch_id: 'SCI10A', max_marks: 10, time_limit: 15)",
    itemType: "Quiz · 5 Questions",
    studentView: {
      title: "Chemical Reactions Diagnostics",
      badge: "Timed Quiz · 15m",
      question: "When quicklime (CaO) reacts vigorously with water, what type of reaction takes place?",
      options: [
        "Combination and Exothermic",
        "Decomposition and Endothermic",
        "Displacement and Endothermic",
        "Neutralization without heat change",
      ],
      correctIndex: 0,
      explanation: "Quicklime reacts with water to form slaked lime with tremendous heat release (combination & exothermic).",
    },
  },
  {
    id: "math",
    label: "Math Practice",
    prompt: "Create a diagnostic quiz on Trigonometric Identities for Class 10 with step-by-step solutions.",
    toolCall: "create_quiz(batch_id: 'MATH10', max_marks: 10, time_limit: 20)",
    itemType: "Quiz · 5 Questions",
    studentView: {
      title: "Class 10 Trigonometry Check",
      badge: "Math · 20m",
      question: "Which of the following is equal to (1 + tan²θ)?",
      options: [
        "cot²θ",
        "sec²θ",
        "cos²θ",
        "cosec²θ",
      ],
      correctIndex: 1,
      explanation: "From fundamental Pythagorean identities, 1 + tan²θ = sec²θ.",
    },
  },
  {
    id: "notes",
    label: "Revision Notes",
    prompt: "Draft concise revision notes on Periodic Trends and post them to Class 10 Science as free study material.",
    toolCall: "create_notes(batch_id: 'SCI10A', is_free: true, is_public: true)",
    itemType: "Notes · 4 min read",
    studentView: {
      title: "Periodic Trends Essentials",
      badge: "Revision Notes · Free",
      question: "Sample Check: What happens to atomic radius down a group?",
      options: [
        "Increases due to added electron shells",
        "Decreases due to nuclear charge",
        "Remains exactly constant",
        "Fluctuates unpredictably",
      ],
      correctIndex: 0,
      explanation: "Down a group, each subsequent element adds an entire electron shell, increasing atomic size.",
    },
  },
];

export function InteractiveSimulator() {
  const [activeScenario, setActiveScenario] = useState<DemoScenario>(DEMO_SCENARIOS[0]);
  const [selectedOption, setSelectedOption] = useState<number | null>(null);
  const [isAnswerSubmitted, setIsAnswerSubmitted] = useState(false);

  const handleSelectScenario = (scenario: DemoScenario) => {
    setActiveScenario(scenario);
    setSelectedOption(null);
    setIsAnswerSubmitted(false);
  };

  const handleOptionClick = (index: number) => {
    if (isAnswerSubmitted) return;
    setSelectedOption(index);
    setIsAnswerSubmitted(true);
  };

  const resetQuiz = () => {
    setSelectedOption(null);
    setIsAnswerSubmitted(false);
  };

  return (
    <div className="w-full my-12 p-5 sm:p-8 rounded-3xl bg-linear-to-b from-surface via-surface/90 to-surface/40 border border-border shadow-md">
      {/* Header */}
      <div className="text-center mb-8">
        <Badge
          variant="outline"
          className="rounded-full border-primary/30 bg-primary-soft text-primary font-semibold text-xs mb-2"
        >
          Interactive Playground
        </Badge>
        <h3 className="font-serif text-2xl sm:text-4xl font-bold text-ink">
          From Prompt to Student in Seconds
        </h3>
        <p className="text-xs sm:text-sm text-muted max-w-xl mx-auto mt-2">
          Click a prompt below to see how Classy turns your AI&apos;s response into an interactive mobile experience for your students.
        </p>

        {/* Preset Prompt Chips */}
        <div className="flex flex-wrap items-center justify-center gap-2 mt-5">
          {DEMO_SCENARIOS.map((scenario) => {
            const isActive = activeScenario.id === scenario.id;
            return (
              <button
                key={scenario.id}
                onClick={() => handleSelectScenario(scenario)}
                className={cn(
                  "px-3.5 py-1.5 rounded-full text-xs font-semibold transition-all cursor-pointer flex items-center gap-1.5",
                  isActive
                    ? "bg-primary text-primary-foreground shadow-xs scale-105"
                    : "bg-surface border border-border text-muted hover:text-ink hover:border-primary/40"
                )}
              >
                <Sparkles className="w-3 h-3" />
                {scenario.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* 3-Column Interactive Pipeline */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-stretch relative">
        {/* Col 1: Tutor AI Prompt (5 cols) */}
        <div className="lg:col-span-4 p-5 rounded-2xl bg-bg border border-border shadow-xs flex flex-col justify-between space-y-4">
          <div className="space-y-3">
            <div className="flex items-center justify-between border-b border-border/60 pb-3">
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-lg bg-primary-soft text-primary flex items-center justify-center">
                  <Bot className="w-4 h-4" />
                </div>
                <div>
                  <p className="text-xs font-bold text-ink">Your AI Assistant</p>
                  <p className="text-[10px] text-muted">Claude · ChatGPT · Gemini</p>
                </div>
              </div>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded-md bg-surface border border-border text-muted">
                Input
              </span>
            </div>

            <div className="p-3.5 rounded-xl bg-surface border border-border/80 text-xs text-ink/90 space-y-2">
              <p className="text-[10px] font-semibold uppercase tracking-wider text-muted">
                You Prompt:
              </p>
              <p className="font-serif italic text-ink text-xs sm:text-sm leading-relaxed">
                &ldquo;{activeScenario.prompt}&rdquo;
              </p>
            </div>
          </div>

          <div className="p-3 rounded-xl bg-primary/5 border border-primary/20 text-[11px] font-mono text-primary flex items-center gap-2">
            <Zap className="w-3.5 h-3.5 animate-pulse shrink-0" />
            <span className="truncate">{activeScenario.toolCall}</span>
          </div>
        </div>

        {/* Col 2: Classy MCP Hub (3 cols) */}
        <div className="lg:col-span-3 p-5 rounded-2xl bg-primary-soft/30 border border-primary/25 shadow-xs flex flex-col justify-between space-y-4">
          <div>
            <div className="flex items-center justify-between border-b border-primary/20 pb-3">
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-lg bg-primary text-primary-foreground flex items-center justify-center font-serif text-xs font-bold shadow-xs">
                  C
                </div>
                <div>
                  <p className="text-xs font-bold text-ink">Classy Engine</p>
                  <p className="text-[10px] text-muted">Streamable MCP</p>
                </div>
              </div>
              <span className="text-[10px] font-semibold text-emerald-600 dark:text-emerald-400">
                12ms
              </span>
            </div>

            <div className="space-y-2.5 mt-4 text-xs">
              <div className="flex items-center gap-2 p-2 rounded-lg bg-surface border border-border/60 text-ink">
                <ShieldCheck className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
                <span className="text-[11px]">Keys encrypted server-side</span>
              </div>
              <div className="flex items-center gap-2 p-2 rounded-lg bg-surface border border-border/60 text-ink">
                <Zap className="w-4 h-4 text-accent shrink-0" />
                <span className="text-[11px]">Published to batch roster</span>
              </div>
              <div className="flex items-center gap-2 p-2 rounded-lg bg-surface border border-border/60 text-ink">
                <CheckCircle2 className="w-4 h-4 text-primary shrink-0" />
                <span className="text-[11px]">Zero AI in-app (100% private)</span>
              </div>
            </div>
          </div>

          <div className="text-[10px] text-center text-muted font-medium pt-2">
            Auto-dispatched with zero copy-pasting
          </div>
        </div>

        {/* Col 3: Live Student Phone (5 cols) */}
        <div className="lg:col-span-5 p-5 rounded-2xl bg-bg border border-border shadow-xs flex flex-col justify-between space-y-3 relative">
          <div>
            {/* Phone Top Header */}
            <div className="flex items-center justify-between border-b border-border/60 pb-3">
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-lg bg-accent/20 text-accent flex items-center justify-center">
                  <Smartphone className="w-4 h-4" />
                </div>
                <div>
                  <p className="text-xs font-bold text-ink">Student Mobile App</p>
                  <p className="text-[10px] text-muted">{activeScenario.itemType}</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Badge variant="outline" className="text-[10px] font-mono border-border">
                  <Clock className="w-2.5 h-2.5 mr-1" /> 14:58
                </Badge>
                {isAnswerSubmitted && (
                  <button
                    onClick={resetQuiz}
                    title="Try again"
                    className="p-1 rounded-md text-muted hover:text-ink hover:bg-surface transition-colors cursor-pointer"
                  >
                    <RotateCcw className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>
            </div>

            {/* Simulated Live Question */}
            <div className="mt-3.5 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-semibold text-primary">Question 1 of 5</span>
                <span className="text-[10px] text-muted">Tap an option to test:</span>
              </div>

              <p className="font-serif text-xs sm:text-sm font-bold text-ink leading-snug">
                {activeScenario.studentView.question}
              </p>

              {/* Tappable Options */}
              <div className="space-y-1.5 pt-1">
                {activeScenario.studentView.options.map((option, idx) => {
                  const isSelected = selectedOption === idx;
                  const isCorrect = idx === activeScenario.studentView.correctIndex;

                  let optionStyle =
                    "bg-surface border-border/80 text-ink hover:border-primary/50 hover:bg-surface/80";

                  if (isAnswerSubmitted) {
                    if (isCorrect) {
                      optionStyle =
                        "bg-emerald-500/10 border-emerald-500/50 text-emerald-700 dark:text-emerald-400 font-semibold";
                    } else if (isSelected && !isCorrect) {
                      optionStyle =
                        "bg-rose-500/10 border-rose-500/50 text-rose-700 dark:text-rose-400";
                    } else {
                      optionStyle = "opacity-40 border-border/40 text-muted";
                    }
                  }

                  return (
                    <button
                      key={idx}
                      onClick={() => handleOptionClick(idx)}
                      disabled={isAnswerSubmitted}
                      className={cn(
                        "w-full p-2.5 rounded-xl border text-left text-xs transition-all flex items-center justify-between cursor-pointer",
                        optionStyle
                      )}
                    >
                      <span className="flex items-center gap-2">
                        <span className="w-4 h-4 rounded-full border border-current flex items-center justify-center text-[10px] font-mono shrink-0">
                          {String.fromCharCode(65 + idx)}
                        </span>
                        <span className="leading-tight">{option}</span>
                      </span>

                      {isAnswerSubmitted && isCorrect && (
                        <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0 ml-2" />
                      )}
                    </button>
                  );
                })}
              </div>

              {/* Feedback Banner upon tap */}
              {isAnswerSubmitted && (
                <div className="p-2.5 rounded-xl bg-surface border border-border/80 text-[11px] leading-relaxed text-muted space-y-1 animate-in fade-in duration-200">
                  <p className="font-bold text-ink flex items-center gap-1.5">
                    {selectedOption === activeScenario.studentView.correctIndex ? (
                      <span className="text-emerald-600 dark:text-emerald-400">
                        🎉 Correct! (+2 Marks)
                      </span>
                    ) : (
                      <span className="text-rose-600 dark:text-rose-400">
                        Incorrect Answer
                      </span>
                    )}
                  </p>
                  <p>{activeScenario.studentView.explanation}</p>
                </div>
              )}
            </div>
          </div>

          <div className="text-[10px] text-muted flex items-center justify-between border-t border-border/60 pt-2 font-medium">
            <span>Instant automatic grading</span>
            <span className="text-primary font-semibold flex items-center gap-1">
              Live in App <ArrowRight className="w-3 h-3" />
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
