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
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

interface DemoScenario {
  id: string;
  label: string;
  icon: typeof HelpCircle;
  tutorActionTitle: string;
  tutorActionDescription: string;
  tutorDetails: { label: string; value: string }[];
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
    id: "batch",
    label: "Create Batch & Invite",
    icon: Users,
    tutorActionTitle: "Launch Class & Invite Students",
    tutorActionDescription: "Create a batch in 30 seconds. Generate an instant 6-letter join code and 1-tap WhatsApp invite link.",
    tutorDetails: [
      { label: "Classroom Name", value: "Class 10 Science – Batch A" },
      { label: "Subject & Grade", value: "Chemistry & Biology · Grade 10" },
      { label: "Invite Code", value: "SC10A (WhatsApp Ready)" },
      { label: "Student Roster", value: "Self-enroll via link with tutor approval" },
    ],
    itemType: "Classroom Setup · Instant Invite",
    studentView: {
      title: "Welcome to Class 10 Science – Batch A",
      badge: "Enrolled in Classroom",
      question: "How would you like to receive your classroom materials?",
      options: [
        "Interactive Timed Quizzes on mobile with instant scores",
        "Distraction-free Markdown study notes & formula sheets",
        "Homework assignments with deadlines & private tutor feedback",
        "All of the above in one quiet personal learning hub",
      ],
      correctIndex: 3,
      explanation: "Students join your batch with a single tap. All notes, quizzes, and homework appear in their feed with zero clutter.",
    },
  },
  {
    id: "quiz",
    label: "Timed Practice Quiz",
    icon: HelpCircle,
    tutorActionTitle: "Publish Timed Assessment",
    tutorActionDescription: "Set up multi-choice questions with a countdown timer. Answer keys are encrypted and graded on the server automatically.",
    tutorDetails: [
      { label: "Assessment Title", value: "Chemical Reactions Diagnostic" },
      { label: "Duration", value: "15 Minutes · Countdown Timer" },
      { label: "Grading", value: "Instant auto-scoring with step explanations" },
      { label: "Student Access", value: "Available to all enrolled students" },
    ],
    itemType: "Quiz · 5 Questions · 15 mins",
    studentView: {
      title: "Chemical Reactions Diagnostic",
      badge: "Timed Quiz · 15m",
      question: "When quicklime (CaO) reacts vigorously with water, what type of reaction takes place?",
      options: [
        "Combination and Exothermic reaction",
        "Decomposition and Endothermic reaction",
        "Displacement and Endothermic reaction",
        "Neutralization without heat change",
      ],
      correctIndex: 0,
      explanation: "Quicklime reacts with water to form slaked lime Ca(OH)₂ with vigorous heat release — making it both a combination and an exothermic reaction.",
    },
  },
  {
    id: "notes",
    label: "Study & Revision Notes",
    icon: FileText,
    tutorActionTitle: "Release Revision Notes",
    tutorActionDescription: "Drop clean lecture notes, formula cheat sheets, and summaries formatted in rich Markdown. Students read offline on any phone.",
    tutorDetails: [
      { label: "Document Title", value: "Modern Periodic Table Trends" },
      { label: "Format", value: "Structured Markdown with key takeaways" },
      { label: "Delivery", value: "Pinned to student batch stream" },
      { label: "Device Support", value: "Mobile, iPad, and Laptop responsive" },
    ],
    itemType: "Study Material · 4 min read",
    studentView: {
      title: "Periodic Trends Quick Summary",
      badge: "Revision Notes",
      question: "Key Trend to Remember for Exams:",
      options: [
        "Atomic radius decreases across a period (left to right) due to increasing nuclear pull.",
        "Atomic radius increases across a period due to shielding.",
        "Metallic character increases from left to right across a period.",
        "Electronegativity decreases across a period.",
      ],
      correctIndex: 0,
      explanation: "As nuclear charge increases across a period without adding shells, electrons are pulled closer to the nucleus, decreasing atomic size.",
    },
  },
  {
    id: "assignment",
    label: "Homework & Grading",
    icon: ClipboardList,
    tutorActionTitle: "Assign Problem Set & Grade",
    tutorActionDescription: "Assign homework tasks with clear submission deadlines and maximum marks. Review student answers and share private feedback.",
    tutorDetails: [
      { label: "Assignment", value: "Trigonometry Identities Problem Set" },
      { label: "Deadline", value: "Friday at 6:00 PM" },
      { label: "Max Marks", value: "10 Points" },
      { label: "Submission Mode", value: "Text response or document link" },
    ],
    itemType: "Assignment · Due Friday · Max 10",
    studentView: {
      title: "Trigonometry Problem Set 1",
      badge: "Homework · Due Friday",
      question: "Which of the following represents the fundamental identity?",
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
];

export function InteractiveSimulator() {
  const [selectedId, setSelectedId] = useState("batch");
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
        {/* Left Pane: Tutor Classroom Control (5 cols) */}
        <div className="lg:col-span-5 flex flex-col justify-between space-y-5 border-b lg:border-b-0 lg:border-r border-border/70 pb-6 lg:pb-0 lg:pr-6">
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-semibold text-primary uppercase tracking-wider flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-primary" />
                Tutor Hub View
              </span>
              <Badge variant="outline" className="text-[10px] font-semibold border-border text-muted">
                Educator Control
              </Badge>
            </div>

            <div>
              <h3 className="font-serif text-lg font-bold text-ink">
                {scenario.tutorActionTitle}
              </h3>
              <p className="text-xs text-muted mt-1 leading-relaxed">
                {scenario.tutorActionDescription}
              </p>
            </div>

            {/* Structured Tutor Action Spec */}
            <div className="space-y-2 pt-1">
              {scenario.tutorDetails.map((detail, idx) => (
                <div
                  key={idx}
                  className="p-2.5 rounded-xl bg-bg border border-border/60 flex items-center justify-between text-xs"
                >
                  <span className="text-muted font-medium">{detail.label}</span>
                  <span className="text-ink font-semibold truncate max-w-[180px]">
                    {detail.value}
                  </span>
                </div>
              ))}
            </div>

            <div className="p-3 rounded-2xl bg-primary-soft/60 border border-primary/20 text-xs text-primary leading-relaxed flex items-start gap-2.5">
              <CheckCircle2 className="w-4 h-4 text-primary shrink-0 mt-0.5" />
              <p className="text-xs text-ink leading-relaxed">
                Published to your batch stream. Enrolled students receive instant access.
              </p>
            </div>
          </div>

          <div className="pt-2 border-t border-border/60 text-[11px] text-muted flex items-center justify-between">
            <span>Invite Mode</span>
            <span className="font-semibold text-primary">1-Tap WhatsApp or Code</span>
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

          {/* Interactive Student Card */}
          <div className="p-5 rounded-2xl border border-border/80 bg-bg/50 space-y-4">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-semibold bg-primary-soft text-primary">
                  {scenario.studentView.badge}
                </span>
                <span className="text-[11px] text-muted flex items-center gap-1">
                  <Clock className="w-3 h-3" /> Calm learning mode
                </span>
              </div>
              <h4 className="font-serif text-base font-bold text-ink">
                {scenario.studentView.title}
              </h4>
              <p className="text-xs text-ink/90 font-medium mt-2">
                {scenario.studentView.question}
              </p>
            </div>

            {/* Clickable Multiple-Choice Options */}
            <div className="space-y-2">
              {scenario.studentView.options.map((opt, idx) => {
                const isSelected = selectedOption === idx;
                const isThisOptionCorrect = idx === scenario.studentView.correctIndex;

                let cardStyle = "border-border bg-surface hover:border-primary/50 text-ink";
                if (hasSubmitted) {
                  if (isSelected && isCorrect) {
                    cardStyle = "border-emerald-500 bg-emerald-500/10 text-emerald-800 dark:text-emerald-300 font-semibold";
                  } else if (isSelected && !isCorrect) {
                    cardStyle = "border-rose-500 bg-rose-500/10 text-rose-800 dark:text-rose-300 font-semibold";
                  } else if (isThisOptionCorrect) {
                    cardStyle = "border-emerald-500/60 bg-emerald-500/5 text-emerald-800 dark:text-emerald-300";
                  } else {
                    cardStyle = "opacity-50 border-border bg-surface text-muted";
                  }
                }

                return (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => handleSelectOption(idx)}
                    className={cn(
                      "w-full text-left p-3 rounded-xl border text-xs transition-all flex items-start gap-3 cursor-pointer",
                      cardStyle
                    )}
                  >
                    <span className="w-5 h-5 rounded-md border border-border/80 bg-bg flex items-center justify-center font-mono text-[10px] font-bold shrink-0 mt-0.5">
                      {String.fromCharCode(65 + idx)}
                    </span>
                    <span className="flex-1 leading-relaxed">{opt}</span>
                  </button>
                );
              })}
            </div>

            {/* Explanation card after answering */}
            {hasSubmitted && (
              <div
                className={cn(
                  "p-3.5 rounded-xl border text-xs transition-all animate-in fade-in duration-200",
                  isCorrect
                    ? "bg-emerald-500/10 border-emerald-500/30 text-emerald-900 dark:text-emerald-200"
                    : "bg-rose-500/10 border-rose-500/30 text-rose-900 dark:text-rose-200"
                )}
              >
                <div className="flex items-center gap-1.5 font-bold mb-1">
                  {isCorrect ? (
                    <>
                      <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                      <span>Correct Answer! Instant Score Recorded.</span>
                    </>
                  ) : (
                    <span>Solution &amp; Explanation:</span>
                  )}
                </div>
                <p className="text-[11px] leading-relaxed opacity-90">
                  {scenario.studentView.explanation}
                </p>
              </div>
            )}
          </div>

          <div className="flex items-center justify-between text-[11px] text-muted pt-1">
            <span>Tap an option above to try the live student experience</span>
            <span className="text-primary font-medium">Auto-scored on server</span>
          </div>
        </div>
      </div>
    </div>
  );
}
