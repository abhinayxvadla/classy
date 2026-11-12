"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import {
  ClipboardList,
  CheckCircle2,
  ExternalLink,
  Loader2,
  Send,
  Save,
  Check,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  gradeSubmissionAction,
  releaseAllGradedAction,
} from "@/app/actions/tutor";
import type { SubmissionStatus } from "@/lib/database.types";
import { format } from "date-fns";

export interface AssignmentSubmissionData {
  id: string;
  item_id: string;
  student_id: string;
  student_name: string;
  student_email: string | null;
  text_answer: string | null;
  link_url: string | null;
  status: SubmissionStatus;
  marks: number | null;
  feedback: string | null;
  submitted_at: string;
  graded_at: string | null;
  released_at: string | null;
}

export interface AssignmentItemData {
  item_id: string;
  title: string;
  max_marks: number | null;
  submissions: AssignmentSubmissionData[];
}

interface BatchSubmissionsTabProps {
  batchId: string;
  assignments: AssignmentItemData[];
}

export function BatchSubmissionsTab({
  assignments,
}: BatchSubmissionsTabProps) {
  const router = useRouter();
  const [selectedItemId, setSelectedItemId] = React.useState<string>(
    assignments[0]?.item_id || ""
  );

  const activeAssignment = React.useMemo(() => {
    return (
      assignments.find((a) => a.item_id === selectedItemId) || assignments[0]
    );
  }, [assignments, selectedItemId]);

  const [savingId, setSavingId] = React.useState<string | null>(null);
  const [releasingAll, setReleasingAll] = React.useState(false);

  // Local state for grading inputs
  const [grades, setGrades] = React.useState<
    Record<string, { marks: number | string; feedback: string }>
  >({});

  React.useEffect(() => {
    if (activeAssignment?.submissions) {
      const map: Record<string, { marks: number | string; feedback: string }> = {};
      activeAssignment.submissions.forEach((s) => {
        map[s.id] = {
          marks: s.marks != null ? s.marks : "",
          feedback: s.feedback || "",
        };
      });
      setGrades(map);
    }
  }, [activeAssignment]);

  if (assignments.length === 0) {
    return (
      <div className="p-12 rounded-2xl border border-dashed border-border bg-surface/50 text-center space-y-3">
        <div className="w-12 h-12 rounded-2xl bg-primary-soft text-primary mx-auto flex items-center justify-center">
          <ClipboardList className="w-6 h-6" />
        </div>
        <h3 className="font-serif text-lg font-bold text-ink">
          No assignments in this batch
        </h3>
        <p className="text-xs text-muted max-w-sm mx-auto">
          Create an assignment in the Content tab to collect student submissions, score them, and provide feedback.
        </p>
      </div>
    );
  }

  const submissions = activeAssignment?.submissions || [];
  const gradedCount = submissions.filter((s) => s.status === "graded").length;

  const handleSaveGrade = async (subId: string, releaseNow: boolean = false) => {
    const input = grades[subId];
    if (input?.marks === "" || isNaN(Number(input?.marks))) {
      toast.error("Please enter a valid numeric mark");
      return;
    }

    setSavingId(subId);
    try {
      const res = await gradeSubmissionAction(
        subId,
        Number(input.marks),
        input.feedback || null,
        releaseNow
      );

      if (res.error) toast.error(res.error);
      else {
        toast.success(releaseNow ? "Marks graded & released!" : "Grade saved");
        router.refresh();
      }
    } catch {
      toast.error("Failed to save grade");
    } finally {
      setSavingId(null);
    }
  };

  const handleReleaseAll = async () => {
    if (!activeAssignment) return;
    setReleasingAll(true);
    try {
      const res = await releaseAllGradedAction(activeAssignment.item_id);
      if (res.error) toast.error(res.error);
      else {
        toast.success("All graded submissions have been released to students!");
        router.refresh();
      }
    } catch {
      toast.error("Failed to release submissions");
    } finally {
      setReleasingAll(false);
    }
  };

  const getStatusBadge = (status: SubmissionStatus) => {
    switch (status) {
      case "submitted":
        return (
          <Badge variant="outline" className="text-amber-700 dark:text-amber-400 border-amber-500/30 bg-amber-500/10 text-[10px]">
            Needs Grading
          </Badge>
        );
      case "graded":
        return (
          <Badge variant="outline" className="text-indigo-700 dark:text-indigo-400 border-indigo-500/30 bg-indigo-500/10 text-[10px]">
            Graded (Unreleased)
          </Badge>
        );
      case "released":
        return (
          <Badge variant="outline" className="text-emerald-700 dark:text-emerald-400 border-emerald-500/30 bg-emerald-500/10 text-[10px] gap-1">
            <CheckCircle2 className="w-2.5 h-2.5" /> Released
          </Badge>
        );
    }
  };

  return (
    <div className="space-y-6">
      {/* Assignment Selectors */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 pb-2">
        <div className="flex flex-wrap items-center gap-2">
          {assignments.map((a) => (
            <button
              key={a.item_id}
              onClick={() => setSelectedItemId(a.item_id)}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all cursor-pointer border ${
                activeAssignment.item_id === a.item_id
                  ? "bg-primary text-primary-foreground border-primary shadow-xs"
                  : "bg-surface text-ink border-border hover:bg-black/5 dark:hover:bg-white/5"
              }`}
            >
              {a.title}
              {a.submissions.filter((s) => s.status === "submitted").length > 0 && (
                <span className="ml-1.5 px-1.5 py-0.2 rounded-full text-[10px] bg-accent text-ink font-bold">
                  {a.submissions.filter((s) => s.status === "submitted").length}
                </span>
              )}
            </button>
          ))}
        </div>

        {gradedCount > 0 && (
          <Button
            size="sm"
            onClick={handleReleaseAll}
            disabled={releasingAll}
            className="rounded-xl text-xs font-semibold bg-emerald-600 hover:bg-emerald-700 text-white gap-1.5 shrink-0"
          >
            {releasingAll ? (
              <Loader2 className="w-3.5 h-3.5 animate-spin" />
            ) : (
              <Send className="w-3.5 h-3.5" />
            )}
            Release All Graded ({gradedCount})
          </Button>
        )}
      </div>

      {/* Submissions List */}
      {submissions.length === 0 ? (
        <div className="p-12 rounded-2xl border border-dashed border-border bg-surface text-center space-y-2">
          <p className="font-serif text-lg font-bold text-ink">
            No submissions yet
          </p>
          <p className="text-xs text-muted">
            Students have not submitted answers for this assignment yet.
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {submissions.map((sub) => {
            const isSaving = savingId === sub.id;
            const currentGrade = grades[sub.id] || {
              marks: sub.marks != null ? sub.marks : "",
              feedback: sub.feedback || "",
            };

            return (
              <div
                key={sub.id}
                className="rounded-2xl border border-border bg-surface p-5 shadow-xs space-y-4"
              >
                {/* Header Row */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-border">
                  <div>
                    <h4 className="font-semibold text-sm sm:text-base text-ink">
                      {sub.student_name}
                    </h4>
                    <span className="text-xs text-muted">
                      Submitted on {format(new Date(sub.submitted_at), "MMM d, yyyy • h:mm a")}
                    </span>
                  </div>
                  <div>{getStatusBadge(sub.status)}</div>
                </div>

                {/* Submission Content: Text / Link */}
                <div className="space-y-2">
                  <span className="text-xs font-semibold text-muted uppercase tracking-wider">
                    Student Submission
                  </span>

                  {sub.link_url && (
                    <div className="p-3 rounded-xl bg-surface/60 border border-border flex items-center justify-between text-xs">
                      <span className="text-muted truncate max-w-sm">{sub.link_url}</span>
                      <a
                        href={sub.link_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1 font-semibold text-primary hover:underline ml-2 shrink-0"
                      >
                        Open Link <ExternalLink className="w-3.5 h-3.5" />
                      </a>
                    </div>
                  )}

                  {sub.text_answer ? (
                    <div className="p-3.5 rounded-xl bg-surface/50 border border-border text-xs leading-relaxed text-ink whitespace-pre-wrap">
                      {sub.text_answer}
                    </div>
                  ) : (
                    !sub.link_url && (
                      <p className="text-xs text-muted italic">No text or link attached.</p>
                    )
                  )}
                </div>

                {/* Grading Controls */}
                <div className="pt-2 grid grid-cols-1 sm:grid-cols-12 gap-3 items-end">
                  {/* Marks Input */}
                  <div className="sm:col-span-3 space-y-1">
                    <label className="text-xs font-semibold text-ink">
                      Score {activeAssignment.max_marks != null && `(out of ${activeAssignment.max_marks})`}
                    </label>
                    <Input
                      type="number"
                      min={0}
                      max={activeAssignment.max_marks ?? undefined}
                      placeholder="e.g. 18"
                      value={currentGrade.marks}
                      onChange={(e) =>
                        setGrades((prev) => ({
                          ...prev,
                          [sub.id]: {
                            ...prev[sub.id],
                            marks: e.target.value,
                          },
                        }))
                      }
                      className="rounded-xl text-xs font-mono font-bold"
                    />
                  </div>

                  {/* Feedback Textarea */}
                  <div className="sm:col-span-6 space-y-1">
                    <label className="text-xs font-semibold text-ink">
                      Feedback
                    </label>
                    <Textarea
                      placeholder="Great explanations, review question 3..."
                      value={currentGrade.feedback}
                      onChange={(e) =>
                        setGrades((prev) => ({
                          ...prev,
                          [sub.id]: {
                            ...prev[sub.id],
                            feedback: e.target.value,
                          },
                        }))
                      }
                      className="rounded-xl min-h-[40px] text-xs"
                      rows={1}
                    />
                  </div>

                  {/* Actions */}
                  <div className="sm:col-span-3 flex items-center gap-2">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleSaveGrade(sub.id, false)}
                      disabled={isSaving}
                      className="flex-1 rounded-xl text-xs font-semibold"
                    >
                      {isSaving ? (
                        <Loader2 className="w-3.5 h-3.5 animate-spin" />
                      ) : (
                        <Save className="w-3.5 h-3.5 mr-1" />
                      )}
                      Save
                    </Button>

                    <Button
                      size="sm"
                      onClick={() => handleSaveGrade(sub.id, true)}
                      disabled={isSaving}
                      className="flex-1 rounded-xl text-xs font-semibold bg-emerald-600 hover:bg-emerald-700 text-white"
                    >
                      {isSaving ? (
                        <Loader2 className="w-3.5 h-3.5 animate-spin" />
                      ) : (
                        <Check className="w-3.5 h-3.5 mr-1" />
                      )}
                      Release
                    </Button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
