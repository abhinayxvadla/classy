"use client";

import * as React from "react";
import {
  HelpCircle,
  Users,
  Award,
  AlertTriangle,
  BarChart3,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { format } from "date-fns";

export interface QuizResultData {
  item_id: string;
  title: string;
  max_marks: number | null;
  due_at: string | null;
  questions: Array<{
    id: string;
    text: string;
    marks?: number;
  }>;
  quiz_answers?: Record<string, number>; // question_id -> correct_option_index
  attempts: Array<{
    id: string;
    student_id: string;
    student_name: string;
    student_email: string | null;
    score: number | null;
    total: number | null;
    submitted_at: string;
    answers: Record<string, number> | null;
  }>;
}

interface BatchResultsTabProps {
  batchId: string;
  quizzes: QuizResultData[];
  joinedStudents: Array<{
    student_id: string | null;
    full_name: string;
    email: string | null;
  }>;
}

export function BatchResultsTab({
  quizzes,
  joinedStudents,
}: BatchResultsTabProps) {
  const [selectedQuizId, setSelectedQuizId] = React.useState<string>(
    quizzes[0]?.item_id || ""
  );

  const activeQuiz = React.useMemo(() => {
    return quizzes.find((q) => q.item_id === selectedQuizId) || quizzes[0];
  }, [quizzes, selectedQuizId]);

  const attempts = React.useMemo(() => {
    return activeQuiz?.attempts || [];
  }, [activeQuiz]);

  const attemptCount = attempts.length;
  const totalJoined = joinedStudents.length;

  const averageScorePercent = React.useMemo(() => {
    if (attemptCount === 0) return 0;
    const totalPercent = attempts.reduce((acc, a) => {
      const s = Number(a.score) || 0;
      const t = Number(a.total) || 1;
      return acc + (s / t) * 100;
    }, 0);
    return Math.round(totalPercent / attemptCount);
  }, [attempts, attemptCount]);

  // Per-question accuracy calculation
  const questionAccuracies = React.useMemo(() => {
    if (!activeQuiz?.questions || attemptCount === 0) return [];

    const keys = activeQuiz.quiz_answers || {};

    return activeQuiz.questions.map((q, index) => {
      const correctOption = keys[q.id];
      let correctAttempts = 0;

      attempts.forEach((att) => {
        const studentAns = att.answers?.[q.id];
        if (studentAns !== undefined && correctOption !== undefined && studentAns === correctOption) {
          correctAttempts++;
        }
      });

      const accuracy = Math.round((correctAttempts / attemptCount) * 100);
      return {
        qIndex: index + 1,
        id: q.id,
        text: q.text,
        accuracy,
        correctCount: correctAttempts,
        totalAttempts: attemptCount,
        isHard: accuracy < 50,
      };
    });
  }, [activeQuiz, attempts, attemptCount]);

  // Students who haven't attempted
  const attemptedStudentIds = React.useMemo(() => {
    return new Set(attempts.map((a) => a.student_id));
  }, [attempts]);

  const unattemptedStudents = React.useMemo(() => {
    return joinedStudents.filter(
      (s) => s.student_id && !attemptedStudentIds.has(s.student_id)
    );
  }, [joinedStudents, attemptedStudentIds]);

  if (quizzes.length === 0) {
    return (
      <div className="p-12 rounded-2xl border border-dashed border-border bg-surface/50 text-center space-y-3">
        <div className="w-12 h-12 rounded-2xl bg-primary-soft text-primary mx-auto flex items-center justify-center">
          <HelpCircle className="w-6 h-6" />
        </div>
        <h3 className="font-serif text-lg font-bold text-ink">
          No quizzes created yet
        </h3>
        <p className="text-xs text-muted max-w-sm mx-auto">
          Create an interactive quiz in the Content tab to view automated scorecards and question accuracy metrics here.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Quiz Selector Pills */}
      {quizzes.length > 1 && (
        <div className="flex flex-wrap items-center gap-2 pb-2">
          {quizzes.map((q) => (
            <button
              key={q.item_id}
              onClick={() => setSelectedQuizId(q.item_id)}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all cursor-pointer border ${
                activeQuiz.item_id === q.item_id
                  ? "bg-primary text-primary-foreground border-primary shadow-xs"
                  : "bg-surface text-ink border-border hover:bg-black/5 dark:hover:bg-white/5"
              }`}
            >
              {q.title}
            </button>
          ))}
        </div>
      )}

      {/* Overview Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="p-5 rounded-2xl border border-border bg-surface shadow-xs space-y-1">
          <div className="flex items-center justify-between text-xs font-semibold text-muted">
            <span>Average Score</span>
            <Award className="w-4 h-4 text-accent" />
          </div>
          <div className="text-3xl font-serif font-bold text-ink">
            {averageScorePercent}%
          </div>
          <p className="text-[11px] text-muted">
            Across {attemptCount} student submission{attemptCount === 1 ? "" : "s"}
          </p>
        </div>

        <div className="p-5 rounded-2xl border border-border bg-surface shadow-xs space-y-1">
          <div className="flex items-center justify-between text-xs font-semibold text-muted">
            <span>Participation</span>
            <Users className="w-4 h-4 text-primary" />
          </div>
          <div className="text-3xl font-serif font-bold text-ink">
            {attemptCount} / {totalJoined}
          </div>
          <p className="text-[11px] text-muted">
            {totalJoined > 0
              ? `${Math.round((attemptCount / totalJoined) * 100)}% of members attempted`
              : "No joined members yet"}
          </p>
        </div>

        <div className="p-5 rounded-2xl border border-border bg-surface shadow-xs space-y-1">
          <div className="flex items-center justify-between text-xs font-semibold text-muted">
            <span>Hardest Questions</span>
            <AlertTriangle className="w-4 h-4 text-amber-500" />
          </div>
          <div className="text-3xl font-serif font-bold text-ink">
            {questionAccuracies.filter((q) => q.isHard).length}
          </div>
          <p className="text-[11px] text-muted">
            Questions with &lt; 50% accuracy
          </p>
        </div>
      </div>

      {/* Per-Question Accuracy Breakdown */}
      {questionAccuracies.length > 0 && (
        <div className="p-6 rounded-2xl border border-border bg-surface shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-serif text-lg font-bold text-ink">
                Question Accuracy Breakdown
              </h3>
              <p className="text-xs text-muted">
                Highlights which topics or questions students struggled with the most.
              </p>
            </div>
            <BarChart3 className="w-5 h-5 text-primary opacity-80" />
          </div>

          <div className="space-y-3 pt-2">
            {questionAccuracies.map((q) => (
              <div key={q.id} className="space-y-1.5 p-3 rounded-xl border border-border/70 bg-surface/50">
                <div className="flex items-center justify-between gap-2 text-xs">
                  <div className="flex items-center gap-2 truncate">
                    <span className="font-mono font-bold text-primary shrink-0">
                      Q{q.qIndex}.
                    </span>
                    <span className="font-medium text-ink truncate max-w-md">
                      {q.text}
                    </span>
                    {q.isHard && (
                      <Badge variant="outline" className="text-[10px] text-amber-700 dark:text-amber-400 border-amber-500/30 bg-amber-500/10 shrink-0">
                        Hardest
                      </Badge>
                    )}
                  </div>
                  <span className={`font-mono font-bold shrink-0 ${q.isHard ? "text-amber-600 dark:text-amber-400" : "text-emerald-600 dark:text-emerald-400"}`}>
                    {q.accuracy}% ({q.correctCount}/{q.totalAttempts})
                  </span>
                </div>

                <Progress
                  value={q.accuracy}
                  className={`h-2 rounded-full ${q.isHard ? "[&>div]:bg-amber-500" : "[&>div]:bg-emerald-600"}`}
                />
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Student Submissions Table */}
      <div className="space-y-3">
        <h3 className="font-serif text-lg font-bold text-ink">
          Student Scorecards ({attemptCount})
        </h3>

        {attemptCount === 0 ? (
          <div className="p-8 rounded-2xl border border-dashed border-border bg-surface text-center text-xs text-muted">
            No students have submitted this quiz yet.
          </div>
        ) : (
          <div className="rounded-2xl border border-border bg-surface overflow-hidden shadow-xs">
            <Table>
              <TableHeader className="bg-surface/50">
                <TableRow className="border-border">
                  <TableHead className="text-xs font-semibold">Student</TableHead>
                  <TableHead className="text-xs font-semibold">Score</TableHead>
                  <TableHead className="text-xs font-semibold">Percentage</TableHead>
                  <TableHead className="text-xs font-semibold">Submitted At</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {attempts.map((att) => {
                  const s = Number(att.score) || 0;
                  const t = Number(att.total) || 1;
                  const pct = Math.round((s / t) * 100);

                  return (
                    <TableRow key={att.id} className="border-border">
                      <TableCell className="py-3">
                        <div className="font-semibold text-xs sm:text-sm text-ink">
                          {att.student_name}
                        </div>
                        {att.student_email && (
                          <div className="text-[11px] text-muted">{att.student_email}</div>
                        )}
                      </TableCell>

                      <TableCell className="py-3 font-mono font-bold text-xs sm:text-sm text-ink">
                        {att.score} / {att.total}
                      </TableCell>

                      <TableCell className="py-3">
                        <Badge
                          variant="outline"
                          className={`text-xs font-bold rounded-full ${
                            pct >= 75
                              ? "text-emerald-700 dark:text-emerald-400 border-emerald-500/30 bg-emerald-500/10"
                              : pct >= 50
                              ? "text-amber-700 dark:text-amber-400 border-amber-500/30 bg-amber-500/10"
                              : "text-destructive border-destructive/30 bg-destructive/10"
                          }`}
                        >
                          {pct}%
                        </Badge>
                      </TableCell>

                      <TableCell className="py-3 text-xs text-muted">
                        {format(new Date(att.submitted_at), "MMM d, h:mm a")}
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </div>
        )}
      </div>

      {/* Unattempted Members Section */}
      {unattemptedStudents.length > 0 && (
        <div className="p-5 rounded-2xl border border-border bg-surface/60 space-y-2.5">
          <div className="flex items-center justify-between text-xs">
            <span className="font-semibold text-ink">
              Pending Submissions ({unattemptedStudents.length} members haven&apos;t attempted)
            </span>
            <span className="text-muted">Awaiting quiz attempt</span>
          </div>
          <div className="flex flex-wrap gap-1.5">
            {unattemptedStudents.map((s) => (
              <span
                key={s.student_id}
                className="px-2.5 py-1 rounded-full text-xs bg-surface border border-border text-muted"
              >
                {s.full_name}
              </span>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
