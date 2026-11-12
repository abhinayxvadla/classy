"use client";

import React, { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { nanoid } from "nanoid";
import { toast } from "sonner";
import {
  FileText,
  HelpCircle,
  ClipboardList,
  Megaphone,
  ArrowLeft,
  Save,
  Plus,
  Trash2,
  ChevronUp,
  ChevronDown,
  CheckCircle2,
  AlertCircle,
  Eye,
  PenTool,
  Clock,
  Award,
  Globe,
  Lock,
  Sparkles,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { MarkdownContent } from "@/components/ui/markdown-content";
import { saveItemAction, type SaveItemInput } from "@/app/actions/tutor";
import type { ItemType, ItemAccess, ItemVisibility } from "@/lib/database.types";
import { cn } from "@/lib/utils";

export interface BatchOption {
  id: string;
  name: string;
  subject: string | null;
  grade: string | null;
}

export interface QuizQuestionState {
  id: string;
  text: string;
  options: string[];
  correctOptionIndex: number;
  marks: number;
  explanation?: string;
}

export interface ItemEditorProps {
  initialItem?: {
    id?: string;
    batch_id: string | null;
    type: ItemType;
    title: string;
    body: Record<string, unknown>;
    access: ItemAccess;
    visibility: ItemVisibility;
    grade?: string | null;
    subject?: string | null;
    due_at?: string | null;
    max_marks?: number | null;
    published: boolean;
  };
  initialAnswers?: Record<string, number>; // question_id -> correct option index
  batches: BatchOption[];
  defaultBatchId?: string | null;
  defaultType?: ItemType;
}

export function ItemEditor({
  initialItem,
  initialAnswers = {},
  batches,
  defaultBatchId,
  defaultType = "notes",
}: ItemEditorProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  const isEditing = Boolean(initialItem?.id);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);

  // Common metadata state
  const [type, setType] = useState<ItemType>(
    initialItem?.type || defaultType || "notes"
  );
  const [title, setTitle] = useState(initialItem?.title || "");
  const [batchId, setBatchId] = useState<string | null>(
    initialItem?.batch_id ?? defaultBatchId ?? (batches[0]?.id || null)
  );
  const [grade, setGrade] = useState(
    initialItem?.grade || (batches.find((b) => b.id === (initialItem?.batch_id ?? defaultBatchId))?.grade || "")
  );
  const [subject, setSubject] = useState(
    initialItem?.subject || (batches.find((b) => b.id === (initialItem?.batch_id ?? defaultBatchId))?.subject || "")
  );
  const [access, setAccess] = useState<ItemAccess>(initialItem?.access || "free");
  const [visibility, setVisibility] = useState<ItemVisibility>(
    initialItem?.visibility || "batch"
  );
  const [published, setPublished] = useState(initialItem?.published ?? true);

  // Format due_at for datetime-local input
  const formatDatetimeForInput = (iso?: string | null) => {
    if (!iso) return "";
    try {
      const d = new Date(iso);
      const pad = (n: number) => String(n).padStart(2, "0");
      return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
    } catch {
      return "";
    }
  };

  const [dueAt, setDueAt] = useState(formatDatetimeForInput(initialItem?.due_at));

  // --- TYPE 1: NOTES STATE ---
  const [notesContent, setNotesContent] = useState<string>(
    typeof initialItem?.body?.content === "string" ? initialItem.body.content : ""
  );

  // --- TYPE 2: QUIZ STATE ---
  const initialQuizQuestions: QuizQuestionState[] = (() => {
    if (initialItem?.type === "quiz" && Array.isArray(initialItem.body?.questions)) {
      return (initialItem.body.questions as Array<{
        id?: string;
        text?: string;
        options?: string[];
        marks?: number;
        explanation?: string;
      }>).map((q, idx) => {
        const qId = q.id || `q_${idx}_${nanoid(6)}`;
        return {
          id: qId,
          text: q.text || "",
          options: q.options && q.options.length >= 2 ? q.options : ["Option A", "Option B"],
          correctOptionIndex: initialAnswers[qId] ?? 0,
          marks: typeof q.marks === "number" ? q.marks : 1,
          explanation: q.explanation || "",
        };
      });
    }
    // Default 1 question
    return [
      {
        id: nanoid(8),
        text: "",
        options: ["Option A", "Option B", "Option C", "Option D"],
        correctOptionIndex: 0,
        marks: 1,
        explanation: "",
      },
    ];
  })();

  const [quizInstructions, setQuizInstructions] = useState<string>(
    typeof initialItem?.body?.instructions === "string"
      ? initialItem.body.instructions
      : "Select the single best answer for each question."
  );
  const [quizTimeLimit, setQuizTimeLimit] = useState<string>(
    initialItem?.body?.time_limit_minutes != null
      ? String(initialItem.body.time_limit_minutes)
      : ""
  );
  const [quizQuestions, setQuizQuestions] = useState<QuizQuestionState[]>(initialQuizQuestions);

  // --- TYPE 3: ASSIGNMENT STATE ---
  const [assignmentInstructions, setAssignmentInstructions] = useState<string>(
    typeof initialItem?.body?.instructions === "string"
      ? initialItem.body.instructions
      : ""
  );
  const [assignmentSubmissionType, setAssignmentSubmissionType] = useState<"text" | "link" | "both">(
    (initialItem?.body?.submission_type as "text" | "link" | "both") || "both"
  );
  const [assignmentMaxMarks, setAssignmentMaxMarks] = useState<string>(
    initialItem?.max_marks != null ? String(initialItem.max_marks) : "100"
  );
  const [assignmentRubric, setAssignmentRubric] = useState<string>(
    typeof initialItem?.body?.rubric === "string" ? initialItem.body.rubric : ""
  );

  // --- TYPE 4: ANNOUNCEMENT STATE ---
  const [announcementMessage, setAnnouncementMessage] = useState<string>(
    typeof initialItem?.body?.message === "string" ? initialItem.body.message : ""
  );

  // Mark changes dirty
  const markDirty = () => setHasUnsavedChanges(true);

  // When batch changes, optionally update grade and subject if empty
  const handleBatchChange = (newBatchId: string) => {
    markDirty();
    if (newBatchId === "none") {
      setBatchId(null);
    } else {
      setBatchId(newBatchId);
      const sel = batches.find((b) => b.id === newBatchId);
      if (sel) {
        if (!grade && sel.grade) setGrade(sel.grade);
        if (!subject && sel.subject) setSubject(sel.subject);
      }
    }
  };

  // Access changes: rule is if access === premium, visibility MUST be batch
  const handleAccessChange = (newAccess: ItemAccess) => {
    markDirty();
    setAccess(newAccess);
    if (newAccess === "premium") {
      setVisibility("batch");
    }
  };

  // --- QUIZ ACTIONS ---
  const addQuestion = () => {
    markDirty();
    setQuizQuestions((prev) => [
      ...prev,
      {
        id: nanoid(8),
        text: "",
        options: ["Option A", "Option B", "Option C", "Option D"],
        correctOptionIndex: 0,
        marks: 1,
        explanation: "",
      },
    ]);
  };

  const removeQuestion = (index: number) => {
    if (quizQuestions.length <= 1) {
      toast.error("A quiz must have at least one question.");
      return;
    }
    markDirty();
    setQuizQuestions((prev) => prev.filter((_, i) => i !== index));
  };

  const moveQuestion = (index: number, direction: "up" | "down") => {
    if (
      (direction === "up" && index === 0) ||
      (direction === "down" && index === quizQuestions.length - 1)
    ) {
      return;
    }
    markDirty();
    setQuizQuestions((prev) => {
      const next = [...prev];
      const targetIndex = direction === "up" ? index - 1 : index + 1;
      const temp = next[index];
      next[index] = next[targetIndex];
      next[targetIndex] = temp;
      return next;
    });
  };

  const updateQuestion = (
    index: number,
    patch: Partial<QuizQuestionState>
  ) => {
    markDirty();
    setQuizQuestions((prev) =>
      prev.map((q, i) => (i === index ? { ...q, ...patch } : q))
    );
  };

  const addOption = (qIndex: number) => {
    const q = quizQuestions[qIndex];
    if (q.options.length >= 6) {
      toast.error("Maximum 6 options allowed per question.");
      return;
    }
    markDirty();
    updateQuestion(qIndex, {
      options: [...q.options, `Option ${String.fromCharCode(65 + q.options.length)}`],
    });
  };

  const removeOption = (qIndex: number, optIndex: number) => {
    const q = quizQuestions[qIndex];
    if (q.options.length <= 2) {
      toast.error("At least 2 options are required.");
      return;
    }
    markDirty();
    const newOptions = q.options.filter((_, i) => i !== optIndex);
    let newCorrect = q.correctOptionIndex;
    if (optIndex === q.correctOptionIndex) {
      newCorrect = 0;
    } else if (optIndex < q.correctOptionIndex) {
      newCorrect -= 1;
    }
    updateQuestion(qIndex, {
      options: newOptions,
      correctOptionIndex: newCorrect,
    });
  };

  // --- SAVE ACTION ---
  const handleSave = () => {
    if (!title.trim()) {
      toast.error("Please enter a title for this item.");
      return;
    }

    // Build payload according to type
    let bodyPayload: Record<string, unknown> = {};
    let calculatedMaxMarks: number | null = null;
    let quizAnswersPayload: Record<string, number> | undefined = undefined;

    if (type === "notes") {
      if (!notesContent.trim()) {
        toast.error("Please add notes content.");
        return;
      }
      bodyPayload = { content: notesContent.trim() };
    } else if (type === "quiz") {
      // Validate quiz
      if (quizQuestions.length === 0) {
        toast.error("Quiz must have at least one question.");
        return;
      }
      for (let i = 0; i < quizQuestions.length; i++) {
        const q = quizQuestions[i];
        if (!q.text.trim()) {
          toast.error(`Question ${i + 1} prompt cannot be empty.`);
          return;
        }
        for (let j = 0; j < q.options.length; j++) {
          if (!q.options[j].trim()) {
            toast.error(`Question ${i + 1}, Option ${j + 1} cannot be empty.`);
            return;
          }
        }
      }

      // Compute total marks
      const totalMarks = quizQuestions.reduce((sum, q) => sum + (Number(q.marks) || 1), 0);
      calculatedMaxMarks = totalMarks;

      // Extract answers map for quiz_keys
      const answersMap: Record<string, number> = {};
      const cleanQuestions = quizQuestions.map((q) => {
        answersMap[q.id] = q.correctOptionIndex;
        return {
          id: q.id,
          text: q.text.trim(),
          options: q.options.map((opt) => opt.trim()),
          marks: Number(q.marks) || 1,
          explanation: q.explanation?.trim() || "",
        };
      });

      quizAnswersPayload = answersMap;
      bodyPayload = {
        instructions: quizInstructions.trim(),
        time_limit_minutes: quizTimeLimit ? Number(quizTimeLimit) : null,
        questions: cleanQuestions,
      };
    } else if (type === "assignment") {
      if (!assignmentInstructions.trim()) {
        toast.error("Please provide instructions for the assignment.");
        return;
      }
      calculatedMaxMarks = assignmentMaxMarks ? Number(assignmentMaxMarks) : 100;
      bodyPayload = {
        instructions: assignmentInstructions.trim(),
        submission_type: assignmentSubmissionType,
        rubric: assignmentRubric.trim(),
      };
    } else if (type === "announcement") {
      if (!announcementMessage.trim()) {
        toast.error("Please enter your announcement message.");
        return;
      }
      bodyPayload = {
        message: announcementMessage.trim(),
      };
    }

    const payload: SaveItemInput = {
      id: initialItem?.id,
      batch_id: batchId,
      type,
      title: title.trim(),
      body: bodyPayload,
      quiz_answers: quizAnswersPayload,
      access,
      visibility: access === "premium" ? "batch" : visibility,
      grade: grade.trim() || undefined,
      subject: subject.trim() || undefined,
      due_at: dueAt ? new Date(dueAt).toISOString() : null,
      max_marks: calculatedMaxMarks,
      published,
    };

    startTransition(async () => {
      try {
        const res = await saveItemAction(payload);
        if (res.error) {
          toast.error(res.error);
        } else {
          toast.success(isEditing ? "Item updated successfully!" : "Item created successfully!");
          setHasUnsavedChanges(false);
          if (batchId) {
            router.push(`/t/batches/${batchId}`);
          } else {
            router.push("/t");
          }
          router.refresh();
        }
      } catch (err: unknown) {
        toast.error((err as Error)?.message || "Failed to save item.");
      }
    });
  };

  return (
    <div className="min-h-screen bg-bg">
      {/* Top Header / Back Bar */}
      <div className="border-b border-border bg-surface/80 backdrop-blur sticky top-0 z-20">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => {
                if (batchId) router.push(`/t/batches/${batchId}`);
                else router.push("/t");
              }}
              className="text-muted hover:text-ink gap-1.5"
            >
              <ArrowLeft className="h-4 w-4" />
              <span className="hidden sm:inline">Back</span>
            </Button>
            <div className="h-4 w-px bg-border" />
            <div>
              <h1 className="font-serif font-bold text-ink text-base sm:text-lg leading-tight truncate max-w-[200px] sm:max-w-md">
                {isEditing ? `Edit ${title || "Item"}` : "Create New Item"}
              </h1>
              <p className="text-xs text-muted">
                {type.toUpperCase()} • {batchId ? batches.find((b) => b.id === batchId)?.name || "Batch" : "Public/All"}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {hasUnsavedChanges ? (
              <Badge variant="outline" className="border-warning/50 text-warning text-xs gap-1 hidden sm:flex">
                <span className="h-1.5 w-1.5 rounded-full bg-warning animate-pulse" />
                Unsaved changes
              </Badge>
            ) : (
              <Badge variant="outline" className="border-border text-muted text-xs gap-1 hidden sm:flex">
                <CheckCircle2 className="h-3 w-3 text-success" />
                All changes saved
              </Badge>
            )}

            <Button
              onClick={handleSave}
              disabled={isPending}
              className="bg-primary hover:bg-primary/90 text-primary-foreground font-medium gap-2 shadow-sm"
              size="sm"
            >
              <Save className="h-4 w-4" />
              <span>{isPending ? "Saving..." : isEditing ? "Save changes" : "Publish item"}</span>
            </Button>
          </div>
        </div>
      </div>

      {/* Main Body */}
      <div className="max-w-5xl mx-auto px-4 sm:px-6 py-6 pb-28 space-y-6">
        {/* Item Type Switcher (only for new items) */}
        {!isEditing && (
          <Card className="p-2 sm:p-3 bg-surface border-border">
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              <button
                type="button"
                onClick={() => {
                  markDirty();
                  setType("notes");
                }}
                className={cn(
                  "flex items-center gap-2.5 p-3 rounded-xl border text-left transition-all",
                  type === "notes"
                    ? "border-primary bg-primary-soft/40 text-primary font-semibold shadow-xs"
                    : "border-border/60 hover:border-border text-muted hover:text-ink bg-bg/50"
                )}
              >
                <FileText className="h-5 w-5 shrink-0" />
                <div>
                  <div className="text-sm">Notes</div>
                  <div className="text-[11px] font-normal text-muted hidden sm:block">
                    Markdown & LaTeX
                  </div>
                </div>
              </button>

              <button
                type="button"
                onClick={() => {
                  markDirty();
                  setType("quiz");
                }}
                className={cn(
                  "flex items-center gap-2.5 p-3 rounded-xl border text-left transition-all",
                  type === "quiz"
                    ? "border-primary bg-primary-soft/40 text-primary font-semibold shadow-xs"
                    : "border-border/60 hover:border-border text-muted hover:text-ink bg-bg/50"
                )}
              >
                <HelpCircle className="h-5 w-5 shrink-0" />
                <div>
                  <div className="text-sm">Quiz</div>
                  <div className="text-[11px] font-normal text-muted hidden sm:block">
                    Auto-graded MCQs
                  </div>
                </div>
              </button>

              <button
                type="button"
                onClick={() => {
                  markDirty();
                  setType("assignment");
                }}
                className={cn(
                  "flex items-center gap-2.5 p-3 rounded-xl border text-left transition-all",
                  type === "assignment"
                    ? "border-primary bg-primary-soft/40 text-primary font-semibold shadow-xs"
                    : "border-border/60 hover:border-border text-muted hover:text-ink bg-bg/50"
                )}
              >
                <ClipboardList className="h-5 w-5 shrink-0" />
                <div>
                  <div className="text-sm">Assignment</div>
                  <div className="text-[11px] font-normal text-muted hidden sm:block">
                    Student submissions
                  </div>
                </div>
              </button>

              <button
                type="button"
                onClick={() => {
                  markDirty();
                  setType("announcement");
                }}
                className={cn(
                  "flex items-center gap-2.5 p-3 rounded-xl border text-left transition-all",
                  type === "announcement"
                    ? "border-primary bg-primary-soft/40 text-primary font-semibold shadow-xs"
                    : "border-border/60 hover:border-border text-muted hover:text-ink bg-bg/50"
                )}
              >
                <Megaphone className="h-5 w-5 shrink-0" />
                <div>
                  <div className="text-sm">Announcement</div>
                  <div className="text-[11px] font-normal text-muted hidden sm:block">
                    Batch broadcast
                  </div>
                </div>
              </button>
            </div>
          </Card>
        )}

        {/* Common Settings Card */}
        <Card className="p-4 sm:p-6 bg-surface border-border space-y-5">
          <div className="space-y-2">
            <Label htmlFor="item-title" className="text-sm font-semibold text-ink">
              Title <span className="text-danger">*</span>
            </Label>
            <Input
              id="item-title"
              value={title}
              onChange={(e) => {
                markDirty();
                setTitle(e.target.value);
              }}
              placeholder={
                type === "quiz"
                  ? "e.g., Physics Unit 1: Kinematics Quiz"
                  : type === "notes"
                  ? "e.g., Chapter 4: Chemical Bonding Summary Notes"
                  : type === "assignment"
                  ? "e.g., Problem Set 3: Thermodynamics"
                  : "e.g., Extra revision session this Saturday"
              }
              className="text-base font-medium h-11"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {/* Batch Selector */}
            <div className="space-y-1.5">
              <Label className="text-xs font-medium text-muted">Assign to Batch</Label>
              <select
                aria-label="Assign to Batch"
                value={batchId || "none"}
                onChange={(e) => handleBatchChange(e.target.value)}
                className="w-full h-10 px-3 rounded-xl border border-border bg-bg text-ink text-sm focus:outline-hidden focus:ring-2 focus:ring-primary"
              >
                <option value="none">Public / No batch</option>
                {batches.map((b) => (
                  <option key={b.id} value={b.id}>
                    {b.name} {b.grade ? `(${b.grade})` : ""}
                  </option>
                ))}
              </select>
            </div>

            {/* Subject */}
            <div className="space-y-1.5">
              <Label className="text-xs font-medium text-muted">Subject</Label>
              <Input
                value={subject}
                onChange={(e) => {
                  markDirty();
                  setSubject(e.target.value);
                }}
                placeholder="e.g. Mathematics"
                className="h-10 text-sm"
              />
            </div>

            {/* Grade */}
            <div className="space-y-1.5">
              <Label className="text-xs font-medium text-muted">Grade / Class</Label>
              <Input
                value={grade}
                onChange={(e) => {
                  markDirty();
                  setGrade(e.target.value);
                }}
                placeholder="e.g. Class 11"
                className="h-10 text-sm"
              />
            </div>
          </div>

          {/* Access, Visibility, Due Date, Published Row */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 pt-2 border-t border-border/70">
            {/* Access Toggle */}
            <div className="space-y-1.5">
              <Label className="text-xs font-medium text-muted flex items-center gap-1.5">
                {access === "premium" ? <Lock className="h-3.5 w-3.5 text-accent" /> : <Sparkles className="h-3.5 w-3.5 text-primary" />}
                Access Tier
              </Label>
              <div className="grid grid-cols-2 p-1 bg-bg rounded-xl border border-border text-xs font-medium">
                <button
                  type="button"
                  onClick={() => handleAccessChange("free")}
                  className={cn(
                    "py-1.5 rounded-lg transition-all",
                    access === "free" ? "bg-surface text-ink font-semibold shadow-xs" : "text-muted hover:text-ink"
                  )}
                >
                  Free
                </button>
                <button
                  type="button"
                  onClick={() => handleAccessChange("premium")}
                  className={cn(
                    "py-1.5 rounded-lg transition-all",
                    access === "premium" ? "bg-accent text-white font-semibold shadow-xs" : "text-muted hover:text-ink"
                  )}
                >
                  Premium
                </button>
              </div>
            </div>

            {/* Visibility Toggle */}
            <div className="space-y-1.5">
              <Label className="text-xs font-medium text-muted flex items-center justify-between">
                <span className="flex items-center gap-1.5">
                  <Globe className="h-3.5 w-3.5" />
                  Visibility
                </span>
                {access === "premium" && (
                  <span className="text-[10px] text-muted">Locked to batch</span>
                )}
              </Label>
              <div className="grid grid-cols-2 p-1 bg-bg rounded-xl border border-border text-xs font-medium">
                <button
                  type="button"
                  onClick={() => {
                    markDirty();
                    setVisibility("batch");
                  }}
                  className={cn(
                    "py-1.5 rounded-lg transition-all",
                    visibility === "batch" ? "bg-surface text-ink font-semibold shadow-xs" : "text-muted hover:text-ink"
                  )}
                >
                  Batch only
                </button>
                <button
                  type="button"
                  disabled={access === "premium"}
                  onClick={() => {
                    markDirty();
                    setVisibility("public");
                  }}
                  className={cn(
                    "py-1.5 rounded-lg transition-all",
                    visibility === "public" ? "bg-surface text-ink font-semibold shadow-xs" : "text-muted hover:text-ink",
                    access === "premium" && "opacity-40 cursor-not-allowed"
                  )}
                  title={access === "premium" ? "Premium items cannot be public" : "Visible in public library"}
                >
                  Public library
                </button>
              </div>
            </div>

            {/* Due Date (for quiz & assignment) */}
            <div className="space-y-1.5">
              <Label htmlFor="item-due" className="text-xs font-medium text-muted flex items-center gap-1.5">
                <Clock className="h-3.5 w-3.5" />
                Due Date (Optional)
              </Label>
              <Input
                id="item-due"
                type="datetime-local"
                value={dueAt}
                onChange={(e) => {
                  markDirty();
                  setDueAt(e.target.value);
                }}
                className="h-10 text-xs"
              />
            </div>

            {/* Published Switch */}
            <div className="flex items-center justify-between sm:justify-center gap-3 p-2 bg-bg/50 rounded-xl border border-border/60">
              <div className="text-left">
                <Label htmlFor="item-published" className="text-xs font-medium text-ink cursor-pointer">
                  Published
                </Label>
                <p className="text-[11px] text-muted">
                  {published ? "Visible to students" : "Draft (hidden)"}
                </p>
              </div>
              <Switch
                id="item-published"
                checked={published}
                onCheckedChange={(val) => {
                  markDirty();
                  setPublished(val);
                }}
              />
            </div>
          </div>
        </Card>

        {/* =================================================================== */}
        {/* TYPE 1: NOTES EDITOR */}
        {/* =================================================================== */}
        {type === "notes" && (
          <Card className="p-4 sm:p-6 bg-surface border-border space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-serif font-bold text-ink text-base">Notes Content</h3>
                <p className="text-xs text-muted">
                  Write notes using Markdown and LaTeX math formulas (e.g. <code className="text-primary font-mono">$E=mc^2$</code> or <code className="text-primary font-mono">$$\int_0^1 x dx$$</code>).
                </p>
              </div>
            </div>

            <Tabs defaultValue="split" className="w-full">
              <div className="flex items-center justify-between pb-2 border-b border-border">
                <span className="text-xs font-medium text-muted">Editor View</span>
                <TabsList className="bg-bg border border-border">
                  <TabsTrigger value="split" className="text-xs">
                    Side-by-side
                  </TabsTrigger>
                  <TabsTrigger value="write" className="text-xs">
                    <PenTool className="h-3.5 w-3.5 mr-1" /> Write
                  </TabsTrigger>
                  <TabsTrigger value="preview" className="text-xs">
                    <Eye className="h-3.5 w-3.5 mr-1" /> Preview
                  </TabsTrigger>
                </TabsList>
              </div>

              {/* Side-by-side layout (lg screens) */}
              <TabsContent value="split" className="mt-3">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <Label className="text-xs font-medium text-muted">Markdown Editor</Label>
                    <Textarea
                      value={notesContent}
                      onChange={(e) => {
                        markDirty();
                        setNotesContent(e.target.value);
                      }}
                      placeholder="# Lecture Notes: Photosynthesis&#10;&#10;## 1. Light Reactions&#10;Chlorophyll absorbs light energy...&#10;&#10;$$\text{6CO}_2 + \text{6H}_2\text{O} \xrightarrow{\text{light}} \text{C}_6\text{H}_{12}\text{O}_6 + \text{6O}_2$$"
                      className="font-mono text-sm min-h-[420px] leading-relaxed p-4 bg-bg resize-y"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <Label className="text-xs font-medium text-muted">Live Formatted Preview</Label>
                    <div className="p-4 bg-bg rounded-xl border border-border min-h-[420px] max-h-[600px] overflow-y-auto">
                      <MarkdownContent content={notesContent} />
                    </div>
                  </div>
                </div>
              </TabsContent>

              {/* Write only */}
              <TabsContent value="write" className="mt-3">
                <Textarea
                  value={notesContent}
                  onChange={(e) => {
                    markDirty();
                    setNotesContent(e.target.value);
                  }}
                  placeholder="Type notes content here..."
                  className="font-mono text-sm min-h-[420px] leading-relaxed p-4 bg-bg resize-y"
                />
              </TabsContent>

              {/* Preview only */}
              <TabsContent value="preview" className="mt-3">
                <div className="p-4 bg-bg rounded-xl border border-border min-h-[420px] max-h-[600px] overflow-y-auto">
                  <MarkdownContent content={notesContent} />
                </div>
              </TabsContent>
            </Tabs>
          </Card>
        )}

        {/* =================================================================== */}
        {/* TYPE 2: QUIZ EDITOR */}
        {/* =================================================================== */}
        {type === "quiz" && (
          <div className="space-y-5">
            {/* Quiz General Settings */}
            <Card className="p-4 sm:p-6 bg-surface border-border space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="sm:col-span-2 space-y-1.5">
                  <Label className="text-xs font-medium text-muted">Quiz Instructions</Label>
                  <Input
                    value={quizInstructions}
                    onChange={(e) => {
                      markDirty();
                      setQuizInstructions(e.target.value);
                    }}
                    placeholder="Instructions for students (e.g. No calculators allowed)"
                    className="h-10 text-sm"
                  />
                </div>
                <div className="space-y-1.5">
                  <Label className="text-xs font-medium text-muted flex items-center gap-1.5">
                    <Clock className="h-3.5 w-3.5" />
                    Time Limit (Minutes, optional)
                  </Label>
                  <Input
                    type="number"
                    min="1"
                    value={quizTimeLimit}
                    onChange={(e) => {
                      markDirty();
                      setQuizTimeLimit(e.target.value);
                    }}
                    placeholder="e.g. 30 (leave empty if untimed)"
                    className="h-10 text-sm"
                  />
                </div>
              </div>

              <div className="flex items-center justify-between pt-2 border-t border-border/70 text-xs text-muted">
                <div className="flex items-center gap-4">
                  <span>Questions: <strong className="text-ink">{quizQuestions.length}</strong></span>
                  <span>
                    Total Marks:{" "}
                    <strong className="text-ink">
                      {quizQuestions.reduce((acc, q) => acc + (Number(q.marks) || 1), 0)}
                    </strong>
                  </span>
                </div>
                <span className="text-[11px] text-muted hidden sm:inline">
                  Correct answers are stored securely in quiz keys and never leaked to students before submission.
                </span>
              </div>
            </Card>

            {/* Questions List */}
            <div className="space-y-4">
              {quizQuestions.map((q, qIndex) => (
                <Card
                  key={q.id}
                  className="p-4 sm:p-6 bg-surface border-border shadow-xs space-y-4 relative"
                >
                  {/* Question Header & Order Controls */}
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Badge className="bg-primary-soft text-primary font-serif font-bold text-xs px-2.5 py-1">
                        Q{qIndex + 1}
                      </Badge>
                      <span className="text-xs font-medium text-muted">
                        Multiple Choice Question
                      </span>
                    </div>

                    <div className="flex items-center gap-1">
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        disabled={qIndex === 0}
                        onClick={() => moveQuestion(qIndex, "up")}
                        className="h-8 w-8 text-muted hover:text-ink disabled:opacity-30"
                        title="Move Up"
                      >
                        <ChevronUp className="h-4 w-4" />
                      </Button>
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        disabled={qIndex === quizQuestions.length - 1}
                        onClick={() => moveQuestion(qIndex, "down")}
                        className="h-8 w-8 text-muted hover:text-ink disabled:opacity-30"
                        title="Move Down"
                      >
                        <ChevronDown className="h-4 w-4" />
                      </Button>
                      <div className="h-4 w-px bg-border mx-1" />
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        onClick={() => removeQuestion(qIndex)}
                        className="h-8 w-8 text-danger hover:bg-danger/10"
                        title="Delete question"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>

                  {/* Question Text */}
                  <div className="space-y-1.5">
                    <div className="flex items-center justify-between">
                      <Label className="text-xs font-semibold text-ink">
                        Question Prompt <span className="text-danger">*</span>
                      </Label>
                      <span className="text-[11px] text-muted">Supports math: $x^2$</span>
                    </div>
                    <Textarea
                      value={q.text}
                      onChange={(e) => updateQuestion(qIndex, { text: e.target.value })}
                      placeholder="e.g. What is the derivative of f(x) = \sin(x^2) with respect to x?"
                      className="min-h-[70px] text-sm bg-bg resize-y"
                    />
                  </div>

                  {/* Options List */}
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <Label className="text-xs font-semibold text-ink">
                        Answer Options (Select correct answer radio)
                      </Label>
                      <span className="text-[11px] text-muted">2 to 6 options</span>
                    </div>

                    <div className="space-y-2.5">
                      {q.options.map((optionText, optIndex) => {
                        const isCorrect = q.correctOptionIndex === optIndex;
                        const optionLetter = String.fromCharCode(65 + optIndex);

                        return (
                          <div
                            key={optIndex}
                            className={cn(
                              "flex items-center gap-2 p-2 rounded-xl border transition-all",
                              isCorrect
                                ? "border-success/60 bg-success/5"
                                : "border-border bg-bg/50"
                            )}
                          >
                            {/* Correct radio toggle */}
                            <button
                              type="button"
                              onClick={() => {
                                markDirty();
                                updateQuestion(qIndex, { correctOptionIndex: optIndex });
                              }}
                              className={cn(
                                "flex items-center justify-center h-7 w-7 rounded-full font-serif font-bold text-xs shrink-0 transition-all",
                                isCorrect
                                  ? "bg-success text-white shadow-xs"
                                  : "border border-border text-muted hover:border-primary hover:text-primary"
                              )}
                              title={isCorrect ? "Correct answer" : "Mark as correct answer"}
                            >
                              {optionLetter}
                            </button>

                            {/* Option Input */}
                            <Input
                              value={optionText}
                              onChange={(e) => {
                                markDirty();
                                const updatedOpts = [...q.options];
                                updatedOpts[optIndex] = e.target.value;
                                updateQuestion(qIndex, { options: updatedOpts });
                              }}
                              placeholder={`Option ${optionLetter}`}
                              className="h-9 text-sm bg-surface border-transparent focus:border-primary"
                            />

                            {/* Delete Option button */}
                            <Button
                              type="button"
                              variant="ghost"
                              size="icon"
                              disabled={q.options.length <= 2}
                              onClick={() => removeOption(qIndex, optIndex)}
                              className="h-8 w-8 text-muted hover:text-danger disabled:opacity-20 shrink-0"
                            >
                              <Trash2 className="h-3.5 w-3.5" />
                            </Button>
                          </div>
                        );
                      })}
                    </div>

                    {q.options.length < 6 && (
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => addOption(qIndex)}
                        className="text-xs text-muted hover:text-ink gap-1 mt-1 border-dashed"
                      >
                        <Plus className="h-3.5 w-3.5" />
                        Add Option ({String.fromCharCode(65 + q.options.length)})
                      </Button>
                    )}
                  </div>

                  {/* Marks & Explanation Row */}
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-3 border-t border-border/60">
                    <div className="space-y-1.5">
                      <Label className="text-xs font-medium text-muted flex items-center gap-1">
                        <Award className="h-3.5 w-3.5 text-primary" />
                        Marks
                      </Label>
                      <Input
                        type="number"
                        min="1"
                        value={q.marks}
                        onChange={(e) =>
                          updateQuestion(qIndex, { marks: Number(e.target.value) || 1 })
                        }
                        className="h-9 text-xs"
                      />
                    </div>
                    <div className="sm:col-span-2 space-y-1.5">
                      <Label className="text-xs font-medium text-muted">
                        Explanation (Shown to students after submission)
                      </Label>
                      <Input
                        value={q.explanation || ""}
                        onChange={(e) =>
                          updateQuestion(qIndex, { explanation: e.target.value })
                        }
                        placeholder="e.g. By chain rule: d/dx[sin(x^2)] = cos(x^2) * 2x"
                        className="h-9 text-xs"
                      />
                    </div>
                  </div>
                </Card>
              ))}

              {/* Add Question Button */}
              <Button
                type="button"
                onClick={addQuestion}
                variant="outline"
                className="w-full py-6 border-dashed border-2 border-border hover:border-primary/60 hover:bg-primary-soft/10 text-ink font-medium gap-2 rounded-2xl"
              >
                <Plus className="h-4 w-4 text-primary" />
                Add Next Question
              </Button>
            </div>
          </div>
        )}

        {/* =================================================================== */}
        {/* TYPE 3: ASSIGNMENT EDITOR */}
        {/* =================================================================== */}
        {type === "assignment" && (
          <Card className="p-4 sm:p-6 bg-surface border-border space-y-5">
            <div>
              <h3 className="font-serif font-bold text-ink text-base">Assignment Details</h3>
              <p className="text-xs text-muted">
                Describe the task, set the submission requirements, and configure maximum marks.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label className="text-xs font-medium text-muted">Submission Format</Label>
                <select
                  aria-label="Submission Format"
                  value={assignmentSubmissionType}
                  onChange={(e) => {
                    markDirty();
                    setAssignmentSubmissionType(e.target.value as "text" | "link" | "both");
                  }}
                  className="w-full h-10 px-3 rounded-xl border border-border bg-bg text-ink text-sm focus:outline-hidden focus:ring-2 focus:ring-primary"
                >
                  <option value="both">Both (Text answer or URL link)</option>
                  <option value="text">Text only (Written response)</option>
                  <option value="link">Link only (Google Docs, Drive, GitHub, etc.)</option>
                </select>
              </div>

              <div className="space-y-1.5">
                <Label className="text-xs font-medium text-muted flex items-center gap-1.5">
                  <Award className="h-3.5 w-3.5 text-primary" />
                  Maximum Marks
                </Label>
                <Input
                  type="number"
                  min="1"
                  value={assignmentMaxMarks}
                  onChange={(e) => {
                    markDirty();
                    setAssignmentMaxMarks(e.target.value);
                  }}
                  placeholder="e.g. 100"
                  className="h-10 text-sm"
                />
              </div>
            </div>

            <Tabs defaultValue="write" className="w-full pt-2">
              <div className="flex items-center justify-between pb-2 border-b border-border">
                <Label className="text-xs font-semibold text-ink">Assignment Instructions</Label>
                <TabsList className="bg-bg border border-border">
                  <TabsTrigger value="write" className="text-xs">
                    <PenTool className="h-3.5 w-3.5 mr-1" /> Write
                  </TabsTrigger>
                  <TabsTrigger value="preview" className="text-xs">
                    <Eye className="h-3.5 w-3.5 mr-1" /> Preview
                  </TabsTrigger>
                </TabsList>
              </div>

              <TabsContent value="write" className="mt-3">
                <Textarea
                  value={assignmentInstructions}
                  onChange={(e) => {
                    markDirty();
                    setAssignmentInstructions(e.target.value);
                  }}
                  placeholder="## Assignment Prompt&#10;&#10;Complete exercises 1 to 5 from chapter 4. Show your step-by-step working. Include diagrams where relevant."
                  className="font-mono text-sm min-h-[260px] leading-relaxed p-4 bg-bg resize-y"
                />
              </TabsContent>

              <TabsContent value="preview" className="mt-3">
                <div className="p-4 bg-bg rounded-xl border border-border min-h-[260px] overflow-y-auto">
                  <MarkdownContent content={assignmentInstructions} />
                </div>
              </TabsContent>
            </Tabs>

            <div className="space-y-1.5 pt-2 border-t border-border/70">
              <Label className="text-xs font-semibold text-ink">
                Grading Rubric / Criteria (Optional)
              </Label>
              <Textarea
                value={assignmentRubric}
                onChange={(e) => {
                  markDirty();
                  setAssignmentRubric(e.target.value);
                }}
                placeholder="e.g. Method accuracy: 50%, Correct final values: 30%, Clean presentation: 20%"
                className="text-sm min-h-[80px] bg-bg resize-y"
              />
            </div>
          </Card>
        )}

        {/* =================================================================== */}
        {/* TYPE 4: ANNOUNCEMENT EDITOR */}
        {/* =================================================================== */}
        {type === "announcement" && (
          <Card className="p-4 sm:p-6 bg-surface border-border space-y-4">
            <div>
              <h3 className="font-serif font-bold text-ink text-base">Announcement Message</h3>
              <p className="text-xs text-muted">
                Broadcast an important notice or update to students in this batch.
              </p>
            </div>

            <div className="space-y-1.5">
              <Label className="text-xs font-semibold text-ink">
                Message <span className="text-danger">*</span>
              </Label>
              <Textarea
                value={announcementMessage}
                onChange={(e) => {
                  markDirty();
                  setAnnouncementMessage(e.target.value);
                }}
                placeholder="Write your announcement here (e.g. Please note that tomorrow's class is moved to 4 PM IST)..."
                className="text-base min-h-[220px] p-4 bg-bg leading-relaxed resize-y"
              />
            </div>
          </Card>
        )}
      </div>

      {/* Sticky Save Bar on Bottom (Above mobile floating nav) */}
      <div className="fixed bottom-0 md:bottom-3 left-0 right-0 z-30 pointer-events-none">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 pointer-events-auto">
          <div className="bg-surface/95 backdrop-blur-md border border-border/80 shadow-xl rounded-t-2xl md:rounded-2xl p-3 sm:p-4 flex items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              {hasUnsavedChanges ? (
                <div className="flex items-center gap-1.5 text-warning text-xs font-medium">
                  <AlertCircle className="h-4 w-4" />
                  <span>Unsaved changes</span>
                </div>
              ) : (
                <div className="flex items-center gap-1.5 text-muted text-xs">
                  <CheckCircle2 className="h-4 w-4 text-success" />
                  <span>Ready to save</span>
                </div>
              )}
            </div>

            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  if (batchId) router.push(`/t/batches/${batchId}`);
                  else router.push("/t");
                }}
                className="text-xs"
              >
                Discard
              </Button>
              <Button
                onClick={handleSave}
                disabled={isPending}
                size="sm"
                className="bg-primary hover:bg-primary/90 text-primary-foreground font-medium gap-1.5 shadow-sm text-xs"
              >
                <Save className="h-3.5 w-3.5" />
                <span>{isPending ? "Saving..." : isEditing ? "Save changes" : "Publish item"}</span>
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
