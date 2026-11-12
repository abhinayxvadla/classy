"use client";

import { useState } from "react";
import {
  HelpCircle,
  FileText,
  ClipboardList,
  Users,
  CheckCircle2,
  Clock,
  RotateCcw,
  Bot,
  Sparkles,
  Smartphone,
  Zap,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

interface DemoScenario {
  id: string;
  chipLabel: string;
  icon: typeof HelpCircle;
  userPrompt: string;
  aiResponse: string;
  targetBatch: string;
  syncStats: string;
  extractedMeta: { label: string; value: string }[];
  studentView: {
    type: "quiz" | "notes" | "assignment" | "batch";
    title: string;
    badge: string;
    duration?: string;
    question: string;
    options: string[];
    correctIndex: number;
    explanation: string;
  };
}

const DEMO_SCENARIOS: DemoScenario[] = [
  {
    id: "quiz",
    chipLabel: '💬 "Create 15m Chemistry Quiz"',
    icon: HelpCircle,
    userPrompt: "Draft a 4-question timed diagnostic quiz on Chemical Reactions with 15m timer for Grade 10 Batch A.",
    aiResponse: "Generated 4 MCQs with step explanations, set 15m timer, encrypted answer keys, and dispatched to Grade 10 Batch A stream.",
    targetBatch: "Grade 10 Science — Batch A",
    syncStats: "24 Students Notified • 0.3s Sync",
    extractedMeta: [
      { label: "Action", value: "Timed Assessment" },
      { label: "Duration", value: "15 Minutes (Countdown)" },
      { label: "Scoring", value: "Automated on server" },
      { label: "Access", value: "Instant mobile push" },
    ],
    studentView: {
      type: "quiz",
      title: "Chemical Reactions Diagnostic",
      badge: "Timed Quiz",
      duration: "14:48",
      question: "When quicklime (CaO) reacts vigorously with water, what type of reaction takes place?",
      options: [
        "Combination and Exothermic reaction",
        "Decomposition and Endothermic reaction",
        "Displacement and Endothermic reaction",
        "Neutralization without temperature change",
      ],
      correctIndex: 0,
      explanation: "Quicklime reacts vigorously with water to form slaked lime Ca(OH)₂ while releasing substantial heat — making it both combination and exothermic.",
    },
  },
  {
    id: "notes",
    chipLabel: '💬 "Push Periodic Table Notes"',
    icon: FileText,
    userPrompt: "Summarize modern periodic table trends into clean revision bullet points and pin to Batch A notes.",
    aiResponse: "Formatted concise Markdown revision sheet highlighting atomic radii, electronegativity, and exam rules. Pinned to student feeds.",
    targetBatch: "Grade 10 Science — Batch A",
    syncStats: "Revision Feed Updated • Offline Ready",
    extractedMeta: [
      { label: "Action", value: "Study Material Drop" },
      { label: "Format", value: "Structured Markdown" },
      { label: "Read Time", value: "3 Minutes" },
      { label: "Device Sync", value: "Cached for offline study" },
    ],
    studentView: {
      type: "notes",
      title: "Periodic Trends Quick Summary",
      badge: "Study Notes",
      duration: "3 min read",
      question: "Core Exam Rule: What happens to atomic radius across a period?",
      options: [
        "Decreases left-to-right due to higher nuclear charge pulling electrons inward",
        "Increases left-to-right because additional electrons add more electron shells",
        "Remains unchanged across representative periods",
        "Fluctuates unpredictably across transition metals",
      ],
      correctIndex: 0,
      explanation: "Nuclear charge increases across a period without adding shells, pulling outer electrons closer to the nucleus and decreasing atomic radius.",
    },
  },
  {
    id: "assignment",
    chipLabel: '💬 "Assign Trig Homework Due Friday"',
    icon: ClipboardList,
    userPrompt: "Post Trigonometry Identities problem set with Friday 6 PM deadline and 10 max marks for Batch 10-A.",
    aiResponse: "Created assignment entry with submission deadline, attached formula cheat-sheet, and scheduled parent reminder notification.",
    targetBatch: "Class 10 Advanced Math",
    syncStats: "Deadline Set: Fri 6 PM • Submissions Open",
    extractedMeta: [
      { label: "Action", value: "Homework Assignment" },
      { label: "Max Marks", value: "10 Points" },
      { label: "Deadline", value: "Friday 6:00 PM" },
      { label: "Submission", value: "Student upload / text" },
    ],
    studentView: {
      type: "assignment",
      title: "Trigonometry Problem Set 1",
      badge: "Homework Task",
      duration: "Due Friday 6 PM",
      question: "Which of the following is the fundamental Pythagorean identity?",
      options: [
        "sin²θ + cos²θ = 1",
        "1 + cos²θ = sin²θ",
        "tan²θ - sec²θ = 1",
        "sinθ · cosθ = 1",
      ],
      correctIndex: 0,
      explanation: "sin²θ + cos²θ = 1 is the primary Pythagorean trigonometric identity, true for all angle values θ.",
    },
  },
  {
    id: "batch",
    chipLabel: '💬 "Launch Physics Batch & Invite"',
    icon: Users,
    userPrompt: "Launch a new batch named 'Class 10 Physics' and generate a 1-tap WhatsApp invite link.",
    aiResponse: "Batch created successfully. 1-tap WhatsApp invite link generated and ready to share with students.",
    targetBatch: "Class 10 Physics (New)",
    syncStats: "Batch Active • Ready to Invite",
    extractedMeta: [
      { label: "Action", value: "Create Batch" },
      { label: "Enrollment", value: "1-Tap Invite Link" },
      { label: "Approval", value: "Tutor Confirmed" },
      { label: "Pricing", value: "Free Tier Activated" },
    ],
    studentView: {
      type: "batch",
      title: "Welcome to Class 10 Physics",
      badge: "Classroom Enrolled",
      duration: "Active Batch",
      question: "How will you attend and receive your classroom materials?",
      options: [
        "Interactive mobile quizzes with live countdown timers and auto-grades",
        "Distraction-free Markdown study notes and cheat sheets",
        "Weekly homework problem sets with private teacher feedback",
        "All of the above directly in this mobile web app",
      ],
      correctIndex: 3,
      explanation: "Students join your batch with a single tap. All notes, quizzes, and homework appear in their feed with zero clutter.",
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
    <div className="w-full my-6 text-left">
      {/* Interactive Prompt Chip Selector */}
      <div className="flex flex-col items-center mb-6">
        <p className="text-xs text-muted font-medium mb-3">
          Select a sample prompt to watch the conversational hand-off:
        </p>
        <div className="flex flex-wrap items-center justify-center gap-2">
          {DEMO_SCENARIOS.map((s) => {
            const isActive = s.id === selectedId;
            return (
              <button
                key={s.id}
                type="button"
                onClick={() => handleSelectScenario(s.id)}
                className={cn(
                  "px-3.5 py-2 rounded-xl text-xs font-semibold transition-all border cursor-pointer flex items-center gap-1.5",
                  isActive
                    ? "bg-primary text-primary-foreground border-primary shadow-xs ring-2 ring-primary/20"
                    : "bg-surface text-ink hover:text-primary border-border hover:bg-bg"
                )}
              >
                <span>{s.chipLabel}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Main Dual-Pane Canvas (The Split-Brain Classroom) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 rounded-3xl border border-border/80 bg-surface/95 p-5 sm:p-7 shadow-xs relative overflow-hidden">
        {/* Background glow accent */}
        <div className="absolute -top-24 -left-24 w-72 h-72 bg-primary/5 rounded-full blur-3xl pointer-events-none" />

        {/* ------------------------------------------------------------- */}
        {/* LEFT PANE: You Talk to Your AI (5 cols) */}
        {/* ------------------------------------------------------------- */}
        <div className="lg:col-span-5 flex flex-col justify-between space-y-4 border-b lg:border-b-0 lg:border-r border-border/70 pb-6 lg:pb-0 lg:pr-6">
          <div className="space-y-4">
            {/* Header / Sub-badge */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-6 h-6 rounded-lg bg-primary/10 text-primary flex items-center justify-center font-bold">
                  <Bot className="w-3.5 h-3.5" />
                </div>
                <span className="text-[11px] font-semibold text-primary uppercase tracking-wider">
                  You Talk To Your AI
                </span>
              </div>
              <Badge variant="outline" className="text-[10px] font-semibold border-border text-muted bg-bg">
                Claude • ChatGPT • Classy
              </Badge>
            </div>

            {/* Educator's Natural Speech / Prompt Box */}
            <div className="p-4 rounded-2xl bg-bg border border-border/80 space-y-2.5 shadow-2xs">
              <div className="flex items-center justify-between text-[11px] text-muted font-medium">
                <span className="flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                  Educator Voice / Prompt
                </span>
                <span className="font-mono text-[10px] text-muted/80">Batch: {scenario.targetBatch}</span>
              </div>
              <div className="p-3 rounded-xl bg-surface border border-border/60 text-xs text-ink font-medium leading-relaxed">
                <p className="italic text-ink/90">
                  &ldquo;{scenario.userPrompt}&rdquo;
                </p>
              </div>
            </div>

            {/* AI Confirmation / Execution Box */}
            <div className="p-4 rounded-2xl bg-primary-soft/40 border border-primary/20 space-y-2">
              <div className="flex items-center gap-1.5 text-primary text-xs font-semibold">
                <Sparkles className="w-3.5 h-3.5" />
                <span>Classy Protocol Execution</span>
              </div>
              <p className="text-xs text-ink/90 leading-relaxed">
                {scenario.aiResponse}
              </p>
            </div>

            {/* Structured Parameters Hand-Off */}
            <div className="space-y-1.5 pt-1">
              <p className="text-[11px] font-semibold text-muted uppercase tracking-wider">
                Extracted Blueprint
              </p>
              <div className="grid grid-cols-2 gap-2">
                {scenario.extractedMeta.map((meta, idx) => (
                  <div
                    key={idx}
                    className="p-2.5 rounded-xl bg-bg border border-border/60 text-xs flex flex-col justify-between"
                  >
                    <span className="text-[10px] text-muted font-medium">{meta.label}</span>
                    <span className="text-ink font-semibold truncate mt-0.5">{meta.value}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Sync Status Footer */}
          <div className="pt-3 border-t border-border/60 flex items-center justify-between text-xs">
            <span className="text-muted flex items-center gap-1.5">
              <Zap className="w-3.5 h-3.5 text-amber-500" />
              Auto-Dispatched
            </span>
            <span className="font-semibold text-primary text-[11px]">{scenario.syncStats}</span>
          </div>
        </div>

        {/* ------------------------------------------------------------- */}
        {/* RIGHT PANE: Classy Runs The Class on Student Phone (7 cols) */}
        {/* ------------------------------------------------------------- */}
        <div className="lg:col-span-7 flex flex-col justify-between space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 rounded-lg bg-emerald-500/10 text-emerald-600 flex items-center justify-center font-bold">
                <Smartphone className="w-3.5 h-3.5" />
              </div>
              <span className="text-[11px] font-semibold text-emerald-600 dark:text-emerald-400 uppercase tracking-wider">
                Classy Runs The Class
              </span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-[11px] text-muted hidden sm:inline">Student Mobile Live Feed</span>
              {hasSubmitted && (
                <button
                  type="button"
                  onClick={handleReset}
                  className="flex items-center gap-1 text-[11px] text-primary hover:underline cursor-pointer font-medium"
                >
                  <RotateCcw className="w-3 h-3" />
                  <span>Try Again</span>
                </button>
              )}
            </div>
          </div>

          {/* Mobile Screen Shell Simulation */}
          <div className="p-4 sm:p-5 rounded-2xl bg-bg border-2 border-border/80 shadow-inner space-y-4">
            {/* Phone Top Status Bar */}
            <div className="flex items-center justify-between pb-2 border-b border-border/60 text-[10px] text-muted">
              <span className="font-mono font-medium">Classy Student App</span>
              <div className="flex items-center gap-2">
                {scenario.studentView.duration && (
                  <span className="inline-flex items-center gap-1 text-primary font-semibold bg-primary-soft px-2 py-0.5 rounded-full">
                    <Clock className="w-3 h-3" />
                    {scenario.studentView.duration}
                  </span>
                )}
                <span className="w-2 h-2 rounded-full bg-emerald-500" />
              </div>
            </div>

            {/* Assessment / Content Header */}
            <div>
              <div className="flex items-center gap-2 mb-1">
                <Badge
                  variant="outline"
                  className="text-[10px] font-semibold border-primary/20 bg-primary-soft text-primary"
                >
                  {scenario.studentView.badge}
                </Badge>
                <span className="text-[11px] text-muted">Question 1 of 4</span>
              </div>
              <h4 className="font-serif text-base sm:text-lg font-bold text-ink">
                {scenario.studentView.title}
              </h4>
              <p className="text-xs sm:text-sm text-ink/90 font-medium mt-2 leading-relaxed">
                {scenario.studentView.question}
              </p>
            </div>

            {/* Interactive Multiple Choice Options */}
            <div className="space-y-2 pt-1">
              {scenario.studentView.options.map((option, idx) => {
                const isSelected = selectedOption === idx;
                const isCorrectOption = idx === scenario.studentView.correctIndex;

                let optionStyle =
                  "border-border/80 bg-surface text-ink hover:border-primary/40 hover:bg-surface/80";

                if (hasSubmitted) {
                  if (isCorrectOption) {
                    optionStyle =
                      "border-emerald-500 bg-emerald-500/10 text-emerald-900 dark:text-emerald-100 font-semibold";
                  } else if (isSelected && !isCorrectOption) {
                    optionStyle =
                      "border-rose-500 bg-rose-500/10 text-rose-900 dark:text-rose-100";
                  } else {
                    optionStyle = "border-border/40 opacity-50 text-muted";
                  }
                }

                return (
                  <button
                    key={idx}
                    type="button"
                    disabled={hasSubmitted}
                    onClick={() => handleSelectOption(idx)}
                    className={cn(
                      "w-full p-3 rounded-xl border text-left text-xs transition-all flex items-start gap-3 cursor-pointer",
                      optionStyle
                    )}
                  >
                    <span
                      className={cn(
                        "w-5 h-5 rounded-full border flex items-center justify-center shrink-0 text-[11px] font-bold mt-0.5",
                        isSelected
                          ? "bg-primary text-primary-foreground border-primary"
                          : "border-border text-muted bg-bg"
                      )}
                    >
                      {String.fromCharCode(65 + idx)}
                    </span>
                    <span className="leading-relaxed flex-1">{option}</span>
                    {hasSubmitted && isCorrectOption && (
                      <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                    )}
                  </button>
                );
              })}
            </div>

            {/* Feedback & Server Rationale on Submit */}
            {hasSubmitted ? (
              <div
                className={cn(
                  "p-3.5 rounded-xl border text-xs space-y-1.5 transition-all animate-in fade-in-50 duration-200",
                  isCorrect
                    ? "bg-emerald-500/10 border-emerald-500/30 text-emerald-950 dark:text-emerald-100"
                    : "bg-amber-500/10 border-amber-500/30 text-amber-950 dark:text-amber-100"
                )}
              >
                <div className="flex items-center justify-between font-semibold">
                  <span>{isCorrect ? "✓ Correct Answer! +10 Points" : "Explanation & Step Answer"}</span>
                  <span className="text-[10px] opacity-75 font-mono">Server Graded</span>
                </div>
                <p className="text-xs leading-relaxed opacity-90">
                  {scenario.studentView.explanation}
                </p>
              </div>
            ) : (
              <p className="text-[11px] text-muted text-center pt-1 italic">
                👆 Tap any option above to test the student auto-grading experience
              </p>
            )}
          </div>

          {/* Student Capability micro-strip */}
          <div className="pt-2 flex flex-wrap items-center justify-between text-[11px] text-muted gap-2">
            <span>✓ No App Store Download</span>
            <span>✓ Works on any mobile browser</span>
            <span>✓ Auto-scores stored in student profile</span>
          </div>
        </div>
      </div>
    </div>
  );
}
