"use client";

import * as React from "react";
import Link from "next/link";
import {
  HelpCircle,
  Clock,
  ArrowLeft,
  ArrowRight,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  RotateCcw,
} from "lucide-react";
import { toast } from "sonner";
import { Button, buttonVariants } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { submitQuizAction, type QuizSubmissionResult } from "@/app/actions/student";

export interface QuizQuestion {
  id: string;
  text: string;
  options: string[];
  marks?: number;
  explanation?: string;
  correct_option_index?: number;
}

export interface QuizAttemptInfo {
  id: string;
  answers: Record<string, number> | null;
  score: number | null;
  total: number | null;
  submitted_at: string;
}

interface QuizPlayerProps {
  itemId: string;
  title: string;
  batchId: string | null;
  batchName?: string;
  questions: QuizQuestion[];
  maxMarks: number | null;
  existingAttempt: QuizAttemptInfo | null;
  timeLimitMinutes?: number | null;
  onQuizStateChange?: (isActive: boolean) => void;
}

export function QuizPlayer({
  itemId,
  title,
  batchId,
  batchName,
  questions,
  maxMarks,
  existingAttempt,
  timeLimitMinutes = null,
  onQuizStateChange,
}: QuizPlayerProps) {
  // Mode: "start" | "active" | "result"
  const [mode, setMode] = React.useState<"start" | "active" | "result">(
    existingAttempt ? "result" : "start"
  );

  // Active quiz state
  const [currentIndex, setCurrentIndex] = React.useState(0);
  const [answers, setAnswers] = React.useState<Record<string, number>>(
    existingAttempt?.answers || {}
  );
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const [showUnansweredConfirm, setShowUnansweredConfirm] = React.useState(false);
  const [showExitConfirm, setShowExitConfirm] = React.useState(false);

  // Submission results
  const [submissionResult, setSubmissionResult] = React.useState<QuizSubmissionResult | null>(null);

  // Optional timer
  const [secondsRemaining, setSecondsRemaining] = React.useState<number | null>(
    timeLimitMinutes ? timeLimitMinutes * 60 : null
  );

  const handleConfirmSubmit = React.useCallback(async () => {
    setShowUnansweredConfirm(false);
    setIsSubmitting(true);

    try {
      const res = await submitQuizAction(itemId, answers);
      if (res.error) {
        toast.error(res.error);
        return;
      }

      if (res.data) {
        setSubmissionResult(res.data);
        setMode("result");
        toast.success("Quiz submitted successfully!");
      }
    } catch {
      toast.error("Failed to submit quiz. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  }, [itemId, answers]);

  // Notify parent component whether quiz is actively being taken (to hide floating nav)
  React.useEffect(() => {
    onQuizStateChange?.(mode === "active");
  }, [mode, onQuizStateChange]);

  // Prevent accidental tab closing / navigation while taking the quiz
  React.useEffect(() => {
    if (mode !== "active") return;

    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      e.preventDefault();
      e.returnValue = "";
    };

    window.addEventListener("beforeunload", handleBeforeUnload);
    return () => window.removeEventListener("beforeunload", handleBeforeUnload);
  }, [mode]);

  // Countdown timer effect
  React.useEffect(() => {
    if (mode !== "active" || secondsRemaining === null) return;

    if (secondsRemaining <= 0) {
      toast.warning("Time's up! Automatically submitting your answers.");
      handleConfirmSubmit();
      return;
    }

    const timer = setInterval(() => {
      setSecondsRemaining((prev) => (prev !== null && prev > 0 ? prev - 1 : 0));
    }, 1000);

    return () => clearInterval(timer);
  }, [mode, secondsRemaining, handleConfirmSubmit]);

  const currentQuestion = questions[currentIndex];
  const totalQuestions = questions.length;
  const answeredCount = Object.keys(answers).length;
  const unansweredCount = totalQuestions - answeredCount;
  const progressPercent = totalQuestions > 0 ? ((currentIndex + 1) / totalQuestions) * 100 : 0;

  const handleSelectOption = (questionId: string, optionIndex: number) => {
    if (mode !== "active") return;
    setAnswers((prev) => ({
      ...prev,
      [questionId]: optionIndex,
    }));
  };

  const handleStartQuiz = () => {
    setMode("active");
    setCurrentIndex(0);
    setAnswers({});
    if (timeLimitMinutes) {
      setSecondsRemaining(timeLimitMinutes * 60);
    }
  };

  const handleSubmitClick = () => {
    if (unansweredCount > 0) {
      setShowUnansweredConfirm(true);
    } else {
      handleConfirmSubmit();
    }
  };

  const formatTimer = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs < 10 ? "0" : ""}${secs}`;
  };

  // =========================================================================
  // 1. START SCREEN
  // =========================================================================
  if (mode === "start") {
    const calculatedTotalMarks =
      maxMarks ?? questions.reduce((acc, q) => acc + (q.marks || 1), 0);

    return (
      <div className="w-full max-w-2xl mx-auto space-y-6">
        <div className="flex items-center gap-2 text-sm text-muted">
          {batchId ? (
            <Link
              href={`/s/batches/${batchId}`}
              className="hover:text-ink transition-colors flex items-center gap-1 font-medium"
            >
              <ArrowLeft className="h-4 w-4" />
              <span>{batchName || "Batch Feed"}</span>
            </Link>
          ) : (
            <Link
              href="/s/library"
              className="hover:text-ink transition-colors flex items-center gap-1 font-medium"
            >
              <ArrowLeft className="h-4 w-4" />
              <span>Public Library</span>
            </Link>
          )}
        </div>

        <Card className="rounded-3xl border-border bg-surface shadow-xs p-6 sm:p-8 space-y-6 text-center">
          <div className="h-14 w-14 rounded-2xl bg-primary-soft text-primary flex items-center justify-center mx-auto shadow-2xs">
            <HelpCircle className="h-7 w-7" />
          </div>

          <div className="space-y-2">
            <Badge className="bg-primary-soft text-primary border-transparent text-xs font-semibold">
              Practice Quiz
            </Badge>
            <h1 className="font-serif text-2xl sm:text-3xl font-bold text-ink">
              {title}
            </h1>
            <p className="text-sm text-muted max-w-md mx-auto">
              Test your understanding with instant automated scoring, answer keys, and explanations.
            </p>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 max-w-lg mx-auto py-3">
            <div className="p-3.5 rounded-2xl bg-bg border border-border">
              <span className="text-xs text-muted block">Questions</span>
              <strong className="text-xl font-serif text-ink">{totalQuestions}</strong>
            </div>
            <div className="p-3.5 rounded-2xl bg-bg border border-border">
              <span className="text-xs text-muted block">Total Marks</span>
              <strong className="text-xl font-serif text-ink">{calculatedTotalMarks}</strong>
            </div>
            <div className="p-3.5 rounded-2xl bg-bg border border-border col-span-2 sm:col-span-1">
              <span className="text-xs text-muted block">Time Limit</span>
              <strong className="text-xl font-serif text-ink">
                {timeLimitMinutes ? `${timeLimitMinutes} min` : "No limit"}
              </strong>
            </div>
          </div>

          <div className="pt-2">
            <Button
              size="lg"
              onClick={handleStartQuiz}
              className="w-full sm:w-auto px-10 h-12 rounded-xl text-sm font-semibold shadow-xs"
            >
              Start Quiz
            </Button>
          </div>
        </Card>
      </div>
    );
  }

  // =========================================================================
  // 2. ACTIVE QUIZ PLAYER (1 Question Per Screen on Mobile)
  // =========================================================================
  if (mode === "active") {
    const selectedOption = answers[currentQuestion.id];
    const letters = ["A", "B", "C", "D", "E", "F"];

    return (
      <div className="w-full max-w-2xl mx-auto space-y-6 pb-20">
        {/* Quiz Top Bar */}
        <div className="flex items-center justify-between gap-4 py-2 border-b border-border">
          <button
            type="button"
            onClick={() => setShowExitConfirm(true)}
            className="text-xs font-medium text-muted hover:text-ink flex items-center gap-1 transition-colors cursor-pointer"
          >
            <ArrowLeft className="h-3.5 w-3.5" />
            <span>Exit Quiz</span>
          </button>

          <span className="text-xs font-serif font-bold text-ink truncate max-w-[200px]">
            {title}
          </span>

          {secondsRemaining !== null ? (
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-mono font-semibold bg-primary-soft text-primary">
              <Clock className="h-3 w-3" />
              <span>{formatTimer(secondsRemaining)}</span>
            </div>
          ) : (
            <span className="text-xs font-medium text-muted">
              {answeredCount}/{totalQuestions} Answered
            </span>
          )}
        </div>

        {/* Progress Bar */}
        <div className="space-y-1.5">
          <div className="flex items-center justify-between text-xs text-muted">
            <span className="font-medium text-ink">
              Question {currentIndex + 1} of {totalQuestions}
            </span>
            <span>{Math.round(progressPercent)}%</span>
          </div>
          <Progress value={progressPercent} className="h-2 rounded-full bg-border" />
        </div>

        {/* Question Card */}
        <Card className="rounded-3xl border-border bg-surface shadow-xs p-6 sm:p-8 space-y-6">
          <div className="space-y-3">
            <div className="flex items-center justify-between gap-2">
              <Badge variant="outline" className="text-xs text-muted border-border font-medium">
                Question {currentIndex + 1}
              </Badge>
              <span className="text-xs font-semibold text-muted">
                {currentQuestion.marks || 1} {currentQuestion.marks === 1 ? "mark" : "marks"}
              </span>
            </div>

            <h2 className="font-serif text-lg sm:text-xl font-bold text-ink leading-snug">
              {currentQuestion.text}
            </h2>
          </div>

          {/* Large Tappable Option Cards */}
          <div className="space-y-3">
            {currentQuestion.options.map((option, idx) => {
              const isSelected = selectedOption === idx;
              const letter = letters[idx] || String(idx + 1);

              return (
                <button
                  key={idx}
                  type="button"
                  onClick={() => handleSelectOption(currentQuestion.id, idx)}
                  className={`w-full p-4 sm:p-5 rounded-2xl text-left transition-all border flex items-center gap-4 cursor-pointer text-sm sm:text-base ${
                    isSelected
                      ? "border-primary bg-primary-soft/50 ring-2 ring-primary/20 shadow-xs"
                      : "border-border bg-bg/60 hover:bg-bg hover:border-primary/40 text-ink"
                  }`}
                >
                  <span
                    className={`h-8 w-8 rounded-xl flex items-center justify-center font-bold text-xs shrink-0 transition-colors ${
                      isSelected
                        ? "bg-primary text-white"
                        : "bg-surface border border-border text-muted"
                    }`}
                  >
                    {letter}
                  </span>
                  <span className="flex-1 font-medium text-ink leading-relaxed">
                    {option}
                  </span>
                </button>
              );
            })}
          </div>

          {/* Navigation Controls */}
          <div className="flex items-center justify-between gap-3 pt-4 border-t border-border">
            <Button
              type="button"
              variant="outline"
              disabled={currentIndex === 0}
              onClick={() => setCurrentIndex((prev) => Math.max(0, prev - 1))}
              className="rounded-xl text-xs font-semibold gap-1.5"
            >
              <ArrowLeft className="h-3.5 w-3.5" />
              <span>Previous</span>
            </Button>

            {currentIndex < totalQuestions - 1 ? (
              <Button
                type="button"
                onClick={() => setCurrentIndex((prev) => Math.min(totalQuestions - 1, prev + 1))}
                className="rounded-xl text-xs font-semibold gap-1.5"
              >
                <span>Next</span>
                <ArrowRight className="h-3.5 w-3.5" />
              </Button>
            ) : (
              <Button
                type="button"
                onClick={handleSubmitClick}
                disabled={isSubmitting}
                className="rounded-xl text-xs font-semibold gap-1.5 bg-primary text-white"
              >
                <span>{isSubmitting ? "Submitting..." : "Submit Quiz"}</span>
                <CheckCircle2 className="h-3.5 w-3.5" />
              </Button>
            )}
          </div>
        </Card>

        {/* Question Navigator Dots */}
        <div className="p-4 rounded-2xl bg-surface border border-border space-y-2">
          <div className="flex items-center justify-between text-xs text-muted">
            <span>Jump to question:</span>
            <span>
              {answeredCount}/{totalQuestions} completed
            </span>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            {questions.map((q, idx) => {
              const isAnswered = answers[q.id] !== undefined;
              const isCurrent = idx === currentIndex;

              return (
                <button
                  key={q.id}
                  type="button"
                  onClick={() => setCurrentIndex(idx)}
                  className={`h-8 w-8 rounded-xl text-xs font-semibold transition-all cursor-pointer flex items-center justify-center ${
                    isCurrent
                      ? "ring-2 ring-primary ring-offset-2 ring-offset-surface bg-ink text-bg"
                      : isAnswered
                      ? "bg-primary text-white"
                      : "bg-bg text-muted border border-border hover:border-ink/40"
                  }`}
                >
                  {idx + 1}
                </button>
              );
            })}
          </div>
        </div>

        {/* Unanswered Confirm Dialog */}
        <Dialog open={showUnansweredConfirm} onOpenChange={setShowUnansweredConfirm}>
          <DialogContent className="rounded-2xl max-w-md bg-surface">
            <DialogHeader>
              <div className="h-10 w-10 rounded-xl bg-warning/15 text-warning flex items-center justify-center mb-2">
                <AlertTriangle className="h-5 w-5" />
              </div>
              <DialogTitle className="font-serif text-lg">
                Unanswered Questions
              </DialogTitle>
              <DialogDescription className="text-xs text-muted">
                You have {unansweredCount} unanswered {unansweredCount === 1 ? "question" : "questions"} left. Are you sure you want to submit your quiz now?
              </DialogDescription>
            </DialogHeader>

            <DialogFooter className="gap-2 sm:gap-0 mt-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => setShowUnansweredConfirm(false)}
                className="rounded-xl text-xs"
              >
                Go Back & Complete
              </Button>
              <Button
                type="button"
                onClick={handleConfirmSubmit}
                disabled={isSubmitting}
                className="rounded-xl text-xs font-semibold"
              >
                {isSubmitting ? "Submitting..." : "Submit Anyway"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Exit Confirm Dialog */}
        <Dialog open={showExitConfirm} onOpenChange={setShowExitConfirm}>
          <DialogContent className="rounded-2xl max-w-md bg-surface">
            <DialogHeader>
              <DialogTitle className="font-serif text-lg">
                Leave Quiz?
              </DialogTitle>
              <DialogDescription className="text-xs text-muted">
                Your answers will not be submitted if you exit now.
              </DialogDescription>
            </DialogHeader>

            <DialogFooter className="gap-2 sm:gap-0 mt-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => setShowExitConfirm(false)}
                className="rounded-xl text-xs"
              >
                Stay
              </Button>
              <Button
                type="button"
                variant="destructive"
                onClick={() => {
                  setShowExitConfirm(false);
                  setMode("start");
                }}
                className="rounded-xl text-xs"
              >
                Exit Quiz
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    );
  }

  // =========================================================================
  // 3. RESULT SCREEN & PER-QUESTION REVIEW
  // =========================================================================
  const finalScore = submissionResult?.score ?? existingAttempt?.score ?? 0;
  const finalTotal = submissionResult?.total ?? existingAttempt?.total ?? 1;
  const percent = Math.round((finalScore / (finalTotal || 1)) * 100);

  // Map results for review
  const letters = ["A", "B", "C", "D", "E", "F"];

  return (
    <div className="w-full max-w-2xl mx-auto space-y-6 pb-16">
      {/* Top Breadcrumb */}
      <div className="flex items-center justify-between text-sm text-muted">
        {batchId ? (
          <Link
            href={`/s/batches/${batchId}`}
            className="hover:text-ink transition-colors flex items-center gap-1 font-medium"
          >
            <ArrowLeft className="h-4 w-4" />
            <span>Back to {batchName || "Batch"}</span>
          </Link>
        ) : (
          <Link
            href="/s/library"
            className="hover:text-ink transition-colors flex items-center gap-1 font-medium"
          >
            <ArrowLeft className="h-4 w-4" />
            <span>Back to Library</span>
          </Link>
        )}

        <Badge className="bg-success/15 text-success border-transparent text-xs font-semibold gap-1">
          <CheckCircle2 className="h-3 w-3" /> Completed
        </Badge>
      </div>

      {/* Score Summary Card */}
      <Card className="rounded-3xl border-border bg-surface shadow-xs p-6 sm:p-8 text-center space-y-5">
        <div className="relative inline-flex items-center justify-center">
          {/* Circular Score Badge / Ring */}
          <div className="h-28 w-28 rounded-full border-4 border-primary/20 bg-primary-soft flex flex-col items-center justify-center shadow-inner">
            <span className="font-serif text-3xl font-bold text-primary">
              {percent}%
            </span>
            <span className="text-[11px] font-semibold text-muted">
              {finalScore}/{finalTotal} marks
            </span>
          </div>
        </div>

        <div className="space-y-1">
          <h1 className="font-serif text-2xl font-bold text-ink">
            {percent >= 80
              ? "Outstanding Work!"
              : percent >= 50
              ? "Good Effort!"
              : "Keep Practicing!"}
          </h1>
          <p className="text-xs text-muted max-w-sm mx-auto">
            You scored {finalScore} out of {finalTotal} points on {title}. Review your answers and explanations below.
          </p>
        </div>

        <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
          {batchId && (
            <Link
              href={`/s/batches/${batchId}`}
              className={buttonVariants({
                size: "sm",
                className: "rounded-xl text-xs font-semibold gap-1.5",
              })}
            >
              <span>Back to Batch Feed</span>
              <ArrowRight className="h-3 w-3" />
            </Link>
          )}

          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={handleStartQuiz}
            className="rounded-xl text-xs font-semibold gap-1.5"
          >
            <RotateCcw className="h-3.5 w-3.5" />
            <span>Retake Quiz</span>
          </Button>
        </div>
      </Card>

      {/* Per-Question Review Section */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="font-serif text-xl font-bold text-ink">
            Review Answers
          </h2>
          <span className="text-xs text-muted">
            {totalQuestions} {totalQuestions === 1 ? "question" : "questions"}
          </span>
        </div>

        <div className="space-y-4">
          {questions.map((q, qIdx) => {
            // Find student's choice
            const studentChoice = answers[q.id] ?? existingAttempt?.answers?.[q.id];

            // In submissionResult or augmented questions
            const resItem = submissionResult?.results?.find((r) => r.id === q.id);
            const correctChoice =
              resItem?.correct_option_index ?? q.correct_option_index;
            const isCorrect =
              resItem?.is_correct ??
              (correctChoice !== undefined && studentChoice === correctChoice);
            const explanation = resItem?.explanation || q.explanation;

            return (
              <Card
                key={q.id}
                className="p-5 sm:p-6 rounded-2xl border-border bg-surface shadow-xs space-y-4"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-semibold text-muted">
                      Q{qIdx + 1}
                    </span>
                    {isCorrect ? (
                      <Badge className="bg-success/15 text-success border-transparent text-[10px] font-semibold gap-1">
                        <CheckCircle2 className="h-3 w-3" /> Correct
                      </Badge>
                    ) : (
                      <Badge className="bg-destructive/15 text-destructive border-transparent text-[10px] font-semibold gap-1">
                        <XCircle className="h-3 w-3" /> Incorrect
                      </Badge>
                    )}
                  </div>

                  <span className="text-xs text-muted font-medium">
                    {q.marks || 1} {q.marks === 1 ? "mark" : "marks"}
                  </span>
                </div>

                <h3 className="font-serif font-bold text-ink text-base leading-snug">
                  {q.text}
                </h3>

                {/* Option cards with green/red indication */}
                <div className="space-y-2">
                  {q.options.map((opt, optIdx) => {
                    const isStudentChoice = studentChoice === optIdx;
                    const isCorrectChoice = correctChoice === optIdx;
                    const letter = letters[optIdx] || String(optIdx + 1);

                    let cardStyle = "border-border bg-bg/40 text-ink";
                    if (isCorrectChoice) {
                      cardStyle = "border-success bg-success/10 text-ink font-semibold";
                    } else if (isStudentChoice && !isCorrect) {
                      cardStyle = "border-destructive bg-destructive/10 text-ink line-through opacity-80";
                    }

                    return (
                      <div
                        key={optIdx}
                        className={`p-3.5 rounded-xl border flex items-center justify-between text-xs sm:text-sm ${cardStyle}`}
                      >
                        <div className="flex items-center gap-3">
                          <span className="font-bold text-muted w-5">
                            {letter}.
                          </span>
                          <span>{opt}</span>
                        </div>

                        {isCorrectChoice && (
                          <Badge className="bg-success text-white border-transparent text-[10px] font-semibold gap-1 shrink-0">
                            <CheckCircle2 className="h-3 w-3" /> Correct Answer
                          </Badge>
                        )}
                        {isStudentChoice && !isCorrectChoice && (
                          <Badge className="bg-destructive text-white border-transparent text-[10px] font-semibold gap-1 shrink-0">
                            <XCircle className="h-3 w-3" /> Your Answer
                          </Badge>
                        )}
                      </div>
                    );
                  })}
                </div>

                {/* Explanation */}
                {explanation && (
                  <div className="p-3.5 rounded-xl bg-bg border border-border text-xs text-ink/80 space-y-1">
                    <span className="font-semibold text-primary block">
                      Explanation:
                    </span>
                    <p className="leading-relaxed whitespace-pre-wrap">
                      {explanation}
                    </p>
                  </div>
                )}
              </Card>
            );
          })}
        </div>
      </div>
    </div>
  );
}
