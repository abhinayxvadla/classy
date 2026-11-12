"use client";

import { useState } from "react";
import {
  HelpCircle,
  FileText,
  ClipboardList,
  Megaphone,
  CheckCircle2,
  Clock,
  RotateCcw,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

interface DemoScenario {
  id: string;
  label: string;
  icon: typeof HelpCircle;
  prompt: string;
  assistantReply: string;
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
    icon: HelpCircle,
    prompt: "Create a 5-question timed quiz on Chemical Reactions for Class 10 with answer keys and explanations.",
    assistantReply: "Created and published 'Chemical Reactions Diagnostic' to Class 10 Science. 5 questions configured with 15-minute timer.",
    itemType: "Quiz · 5 Questions · 15 mins",
    studentView: {
      title: "Chemical Reactions Diagnostic",
      badge: "Timed Quiz · 15m",
      question: "When quicklime (CaO) reacts vigorously with water, what type of reaction takes place?",
      options: [
        "Combination and Exothermic",
        "Decomposition and Endothermic",
        "Displacement and Endothermic",
        "Neutralization without heat change",
      ],
      correctIndex: 0,
      explanation: "Quicklime reacts with water to form slaked lime Ca(OH)₂ with significant heat release (combination and exothermic).",
    },
  },
  {
    id: "notes",
    label: "Revision Notes",
    icon: FileText,
    prompt: "Draft concise revision notes on Periodic Trends in Modern Periodic Table for Class 10 Science.",
    assistantReply: "Published revision notes 'Modern Periodic Trends' to Class 10 Science stream. Free for all enrolled students.",
    itemType: "Study Material · 4 min read",
    studentView: {
      title: "Periodic Trends Summary Sheet",
      badge: "Revision Notes",
      question: "Key Trend to Remember:",
      options: [
        "Atomic radius decreases across a period (left to right) due to higher nuclear charge.",
        "Atomic radius increases across a period due to shielding effect.",
        "Metallic character increases from left to right across a period.",
        "Electronegativity decreases across a period.",
      ],
      correctIndex: 0,
      explanation: "As nuclear charge increases across a period without adding shells, electrons are pulled closer, reducing atomic radius.",
    },
  },
  {
    id: "assignment",
    label: "Homework Task",
    icon: ClipboardList,
    prompt: "Post an assignment on Trigonometric Identities for Class 10 due Friday 6 PM with max marks 10.",
    assistantReply: "Published 'Trigonometry Problem Set 1' to Class 10. Due Friday at 6:00 PM. Submission dropzone active.",
    itemType: "Assignment · Due Friday · Max 10 Marks",
    studentView: {
      title: "Trigonometry Problem Set 1",
      badge: "Homework · Due Friday",
      question: "Verify the fundamental identity:",
      options: [
        "sin²θ + cos²θ = 1",
        "1 + cos²θ = sin²θ",
        "tan²θ - sec²θ = 1",
        "sinθ · cosθ = 1",
      ],
      correctIndex: 0,
      explanation: "sin²θ + cos²θ = 1 is the primary Pythagorean trigonometric identity, true for all values of θ.",
    },
  },
  {
    id: "broadcast",
    label: "Class Announcement",
    icon: Megaphone,
    prompt: "Broadcast a message to Class 10 Science: Extra doubt-clearing session this Saturday at 4 PM on Zoom.",
    assistantReply: "Posted announcement to Class 10 Science batch stream. Instant mobile notification sent to all enrolled students.",
    itemType: "Notice · Class 10 Science",
    studentView: {
      title: "Saturday Doubt-Clearing Session",
      badge: "Notice · Batch Stream",
      question: "Scheduled Session Details:",
      options: [
        "Saturday 4:00 PM – 5:30 PM (Zoom Link inside batch stream)",
        "Sunday 10:00 AM – 11:30 AM",
        "Postponed until next week",
        "Offline classroom only",
      ],
      correctIndex: 0,
      explanation: "Tutor has scheduled doubt resolution on Saturday at 4:00 PM for all students preparing for midterm exams.",
    },
  },
];

export function InteractiveSimulator() {
  const [selectedId, setSelectedId] = useState("quiz");
  const [selectedOption, setSelectedOption] = useState<number | null>(null);
  const [hasSubmitted, setHasSubmitted] = useState(false);

  const scenario = DEMO_SCENARIOS.find((s) => s.id === selectedId) || DEMO_SCENARIOS[0];

  const handleSelectScenario = (id: string) => {
    setSelectedId(id);
    setSelectedOption(null);
    setHasSubmitted(false);
  };

  const handleSelectOption = (idx: number) => {
    setSelectedOption(idx);
    setHasSubmitted(true);
  };

  const handleReset = () => {
    setSelectedOption(null);
    setHasSubmitted(false);
  };

  const isCorrect = selectedOption === scenario.studentView.correctIndex;

  return (
    <div className="w-full my-8 text-left">
      {/* Tab Switcher */}
      <div className="flex flex-wrap items-center justify-center gap-2 mb-6">
        {DEMO_SCENARIOS.map((s) => {
          const Icon = s.icon;
          const isActive = s.id === selectedId;
          return (
            <button
              key={s.id}
              onClick={() => handleSelectScenario(s.id)}
              className={cn(
                "flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold transition-all border cursor-pointer",
                isActive
                  ? "bg-primary text-primary-foreground border-primary shadow-xs"
                  : "bg-surface text-muted hover:text-ink border-border hover:bg-bg"
              )}
            >
              <Icon className="w-3.5 h-3.5" />
              <span>{s.label}</span>
            </button>
          );
        })}
      </div>

      {/* Main Dual-Pane Canvas */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 rounded-3xl border border-border/80 bg-surface/95 p-5 sm:p-7 shadow-xs">
        {/* Left Pane: Tutor Command View (5 cols) */}
        <div className="lg:col-span-5 flex flex-col justify-between space-y-5 border-b lg:border-b-0 lg:border-r border-border/70 pb-6 lg:pb-0 lg:pr-6">
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-semibold text-muted uppercase tracking-wider">
                Tutor Workflow
              </span>
              <Badge variant="outline" className="text-[10px] font-mono border-border text-muted">
                Claude · ChatGPT · Web
              </Badge>
            </div>

            {/* Tutor Message Bubble */}
            <div className="space-y-1.5">
              <p className="text-[11px] font-medium text-muted">You instruct:</p>
              <div className="p-3.5 rounded-2xl bg-bg border border-border/80 font-mono text-xs text-ink leading-relaxed">
                &ldquo;{scenario.prompt}&rdquo;
              </div>
            </div>

            {/* Assistant Confirmation Bubble */}
            <div className="space-y-1.5">
              <p className="text-[11px] font-medium text-muted">Classy publishes instantly:</p>
              <div className="p-3.5 rounded-2xl bg-primary-soft/60 border border-primary/20 text-xs text-primary leading-relaxed flex items-start gap-2.5">
                <CheckCircle2 className="w-4 h-4 text-primary shrink-0 mt-0.5" />
                <p className="text-xs text-ink leading-relaxed">
                  {scenario.assistantReply}
                </p>
              </div>
            </div>
          </div>

          <div className="pt-2">
            <div className="p-3 rounded-xl bg-bg border border-border/60 text-[11px] text-muted flex items-center justify-between">
              <span>Delivery Time</span>
              <span className="font-semibold text-ink font-mono">&lt; 150ms</span>
            </div>
          </div>
        </div>

        {/* Right Pane: Live Student Mobile Experience (7 cols) */}
        <div className="lg:col-span-7 flex flex-col justify-between space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              <span className="text-[11px] font-semibold text-muted uppercase tracking-wider">
                Student Live Screen
              </span>
            </div>
            <div className="flex items-center gap-2">
              <Badge className="bg-primary-soft text-primary font-medium text-[10px]">
                {scenario.itemType}
              </Badge>
              {hasSubmitted && (
                <button
                  onClick={handleReset}
                  className="text-xs text-muted hover:text-ink flex items-center gap-1 cursor-pointer"
                  title="Try again"
                >
                  <RotateCcw className="w-3 h-3" />
                  <span className="text-[11px]">Reset</span>
                </button>
              )}
            </div>
          </div>

          {/* Interactive Card */}
          <div className="p-5 rounded-2xl border border-border/80 bg-bg/50 space-y-4">
            <div>
              <div className="flex items-center justify-between mb-1">
                <span className="text-[11px] font-semibold text-primary uppercase tracking-wider">
                  {scenario.studentView.badge}
                </span>
                <span className="text-[11px] text-muted flex items-center gap-1">
                  <Clock className="w-3 h-3" /> Auto-Timed
                </span>
              </div>
              <h4 className="font-serif text-base sm:text-lg font-bold text-ink">
                {scenario.studentView.title}
              </h4>
            </div>

            <p className="text-xs sm:text-sm font-medium text-ink/90 leading-relaxed">
              {scenario.studentView.question}
            </p>

            {/* Multiple Choice Option Buttons */}
            <div className="space-y-2">
              {scenario.studentView.options.map((opt, idx) => {
                const isSelected = selectedOption === idx;
                const isCorrectOption = idx === scenario.studentView.correctIndex;

                let stateStyle = "border-border bg-surface hover:border-primary/50 text-ink";

                if (hasSubmitted) {
                  if (isSelected && isCorrect) {
                    stateStyle = "border-emerald-500 bg-emerald-500/10 text-emerald-800 dark:text-emerald-300 font-semibold";
                  } else if (isSelected && !isCorrect) {
                    stateStyle = "border-rose-500 bg-rose-500/10 text-rose-800 dark:text-rose-300 font-semibold";
                  } else if (isCorrectOption) {
                    stateStyle = "border-emerald-500/50 bg-emerald-500/5 text-emerald-700 dark:text-emerald-400";
                  }
                }

                return (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => handleSelectOption(idx)}
                    className={cn(
                      "w-full text-left p-3 rounded-xl border text-xs leading-relaxed transition-all flex items-center justify-between gap-3 cursor-pointer",
                      stateStyle
                    )}
                  >
                    <span>{opt}</span>
                    <span className="w-5 h-5 rounded-full border border-border/80 flex items-center justify-center text-[10px] shrink-0 font-mono">
                      {String.fromCharCode(65 + idx)}
                    </span>
                  </button>
                );
              })}
            </div>

            {/* Explanation card reveals upon answering */}
            {hasSubmitted && (
              <div
                className={cn(
                  "p-3.5 rounded-xl text-xs leading-relaxed transition-all",
                  isCorrect
                    ? "bg-emerald-500/10 text-emerald-900 dark:text-emerald-200 border border-emerald-500/30"
                    : "bg-rose-500/10 text-rose-900 dark:text-rose-200 border border-rose-500/30"
                )}
              >
                <div className="flex items-center gap-1.5 font-bold mb-1">
                  {isCorrect ? (
                    <>
                      <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                      <span>Correct Answer!</span>
                    </>
                  ) : (
                    <>
                      <span className="text-rose-600 dark:text-rose-400 font-bold">✕ Incorrect</span>
                    </>
                  )}
                </div>
                <p className="text-xs opacity-90">{scenario.studentView.explanation}</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
