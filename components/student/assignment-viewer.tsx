"use client";

import * as React from "react";
import Link from "next/link";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import remarkMath from "remark-math";
import rehypeKatex from "rehype-katex";
import {
  ArrowLeft,
  Calendar,
  Clock,
  CheckCircle2,
  ExternalLink,
  Send,
  Edit3,
  Award,
} from "lucide-react";
import { isPast } from "date-fns";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { submitAssignmentAction } from "@/app/actions/student";

export interface StudentSubmissionInfo {
  id: string;
  text_answer: string | null;
  link_url: string | null;
  status: "submitted" | "graded" | "released";
  marks: number | null;
  feedback: string | null;
  submitted_at: string;
  released_at?: string | null;
}

interface AssignmentViewerProps {
  itemId: string;
  title: string;
  batchId: string | null;
  batchName?: string;
  tutorName?: string;
  instructions: string;
  dueAt: string | null;
  maxMarks: number | null;
  grade?: string | null;
  subject?: string | null;
  createdAt: string;
  existingSubmission: StudentSubmissionInfo | null;
}

export function AssignmentViewer({
  itemId,
  title,
  batchId,
  batchName,
  tutorName,
  instructions,
  dueAt,
  maxMarks,
  grade,
  subject,
  createdAt,
  existingSubmission,
}: AssignmentViewerProps) {
  const [submission, setSubmission] = React.useState<StudentSubmissionInfo | null>(
    existingSubmission
  );
  const [textAnswer, setTextAnswer] = React.useState(existingSubmission?.text_answer || "");
  const [linkUrl, setLinkUrl] = React.useState(existingSubmission?.link_url || "");
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const [isEditing, setIsEditing] = React.useState(!existingSubmission);

  const dueDate = dueAt ? new Date(dueAt) : null;
  const isOverdue = dueDate ? isPast(dueDate) : false;
  const isGradedOrReleased =
    submission?.status === "graded" || submission?.status === "released";

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!textAnswer.trim() && !linkUrl.trim()) {
      toast.error("Please provide either a text answer or a link URL.");
      return;
    }

    setIsSubmitting(true);
    try {
      const res = await submitAssignmentAction(itemId, textAnswer, linkUrl);
      if (res.error) {
        toast.error(res.error);
        return;
      }

      toast.success("Assignment submitted successfully!");
      setSubmission({
        id: res.submissionId || "sub_new",
        text_answer: textAnswer.trim() || null,
        link_url: linkUrl.trim() || null,
        status: "submitted",
        marks: null,
        feedback: null,
        submitted_at: new Date().toISOString(),
      });
      setIsEditing(false);
    } catch {
      toast.error("Failed to submit assignment. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="w-full max-w-3xl mx-auto space-y-8 pb-20">
      {/* Top Header / Breadcrumb */}
      <div className="flex items-center justify-between text-sm text-muted">
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

        {submission ? (
          submission.status === "released" ? (
            <Badge className="bg-success/15 text-success border-transparent text-xs font-semibold gap-1">
              <CheckCircle2 className="h-3 w-3" /> Graded & Released
            </Badge>
          ) : submission.status === "graded" ? (
            <Badge className="bg-primary-soft text-primary border-transparent text-xs font-semibold">
              Graded (Pending Release)
            </Badge>
          ) : (
            <Badge className="bg-primary-soft text-primary border-transparent text-xs font-medium gap-1">
              <Clock className="h-3 w-3" /> Submitted
            </Badge>
          )
        ) : (
          <Badge variant="outline" className="text-xs text-muted border-border">
            Not Submitted
          </Badge>
        )}
      </div>

      {/* Assignment Header Card */}
      <div className="space-y-4 pb-6 border-b border-border">
        <div className="flex flex-wrap items-center gap-2">
          <Badge className="bg-primary-soft text-primary border-transparent text-xs font-semibold">
            Assignment
          </Badge>
          {subject && (
            <Badge variant="outline" className="text-xs text-ink border-border">
              {subject}
            </Badge>
          )}
          {grade && (
            <Badge variant="outline" className="text-xs text-muted border-border">
              {grade}
            </Badge>
          )}
          {dueDate && (
            <Badge
              className={`text-xs font-medium gap-1 ${
                isOverdue
                  ? "bg-destructive/15 text-destructive border-transparent"
                  : "bg-accent/15 text-ink border-transparent"
              }`}
            >
              <Calendar className="h-3 w-3" />
              {isOverdue ? "Overdue: " : "Due: "}
              {dueDate.toLocaleDateString(undefined, {
                month: "short",
                day: "numeric",
                year: "numeric",
                hour: "numeric",
                minute: "2-digit",
              })}
            </Badge>
          )}
        </div>

        <h1 className="font-serif text-3xl sm:text-4xl font-bold tracking-tight text-ink">
          {title}
        </h1>

        <div className="flex flex-wrap items-center gap-4 text-xs text-muted">
          {tutorName && (
            <span>
              Taught by <strong className="text-ink font-medium">{tutorName}</strong>
            </span>
          )}
          <span>•</span>
          <span>
            Posted on{" "}
            {new Date(createdAt).toLocaleDateString(undefined, {
              month: "short",
              day: "numeric",
              year: "numeric",
            })}
          </span>
          {maxMarks != null && (
            <span>
              Maximum Marks: <strong className="text-ink font-medium">{maxMarks}</strong>
            </span>
          )}
        </div>
      </div>

      {/* RELEASED RESULTS CARD (If tutor graded and released) */}
      {submission?.status === "released" && (
        <Card className="rounded-3xl border-success/40 bg-success/5 shadow-xs p-6 space-y-4">
          <div className="flex items-start justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="h-12 w-12 rounded-2xl bg-success/15 text-success flex items-center justify-center shrink-0">
                <Award className="h-6 w-6" />
              </div>
              <div>
                <h3 className="font-serif font-bold text-ink text-xl">
                  Grade: {submission.marks ?? "?"} / {maxMarks ?? "?"} Marks
                </h3>
                <p className="text-xs text-muted mt-0.5">
                  Graded and released by your tutor
                </p>
              </div>
            </div>

            <Badge className="bg-success text-white border-transparent text-xs font-semibold">
              Released
            </Badge>
          </div>

          {submission.feedback && (
            <div className="p-4 rounded-2xl bg-surface border border-success/20 space-y-1">
              <span className="text-xs font-semibold text-primary block">
                Tutor Feedback:
              </span>
              <p className="text-sm text-ink/90 leading-relaxed whitespace-pre-wrap">
                {submission.feedback}
              </p>
            </div>
          )}
        </Card>
      )}

      {/* Instructions Section */}
      <Card className="p-6 sm:p-8 rounded-3xl border-border bg-surface shadow-xs space-y-4">
        <h2 className="font-serif text-lg font-bold text-ink">
          Instructions
        </h2>

        <div className="prose prose-neutral dark:prose-invert max-w-none text-ink/90 leading-relaxed text-sm sm:text-base font-sans">
          <ReactMarkdown
            remarkPlugins={[remarkGfm, remarkMath]}
            rehypePlugins={[rehypeKatex]}
          >
            {instructions || "No specific instructions provided."}
          </ReactMarkdown>
        </div>
      </Card>

      {/* Submission Form / Status */}
      <Card className="p-6 sm:p-8 rounded-3xl border-border bg-surface shadow-xs space-y-6">
        <div className="flex items-center justify-between gap-4">
          <div>
            <h2 className="font-serif text-lg font-bold text-ink">
              Your Submission
            </h2>
            <p className="text-xs text-muted mt-0.5">
              {submission
                ? isGradedOrReleased
                  ? "This assignment has been graded and is locked."
                  : "You can revise and update your work until your tutor grades it."
                : "Submit written text or a link to your work."}
            </p>
          </div>

          {submission && !isGradedOrReleased && !isEditing && (
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => setIsEditing(true)}
              className="rounded-xl text-xs font-semibold gap-1.5"
            >
              <Edit3 className="h-3.5 w-3.5" />
              <span>Edit Submission</span>
            </Button>
          )}
        </div>

        {/* Form view or Read-only submitted view */}
        {isEditing && !isGradedOrReleased ? (
          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="space-y-2">
              <Label htmlFor="text_answer" className="text-xs font-semibold text-ink">
                Text Response / Answer Notes
              </Label>
              <Textarea
                id="text_answer"
                rows={6}
                value={textAnswer}
                onChange={(e) => setTextAnswer(e.target.value)}
                placeholder="Write your answer, essay, explanation, or working steps here..."
                className="bg-bg border-border rounded-xl text-sm leading-relaxed"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="link_url" className="text-xs font-semibold text-ink">
                Link to Submission (Optional)
              </Label>
              <Input
                id="link_url"
                type="url"
                value={linkUrl}
                onChange={(e) => setLinkUrl(e.target.value)}
                placeholder="https://drive.google.com/... or https://github.com/..."
                className="bg-bg border-border rounded-xl text-sm h-11"
              />
              <span className="text-[11px] text-muted block">
                Share a link to your Google Drive document, PDF, or code repository.
              </span>
            </div>

            <div className="flex items-center justify-end gap-3 pt-2">
              {submission && (
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => {
                    setTextAnswer(submission.text_answer || "");
                    setLinkUrl(submission.link_url || "");
                    setIsEditing(false);
                  }}
                  className="rounded-xl text-xs"
                >
                  Cancel
                </Button>
              )}

              <Button
                type="submit"
                disabled={isSubmitting}
                className="rounded-xl text-xs font-semibold px-6 gap-1.5 bg-primary text-white"
              >
                <Send className="h-3.5 w-3.5" />
                <span>{isSubmitting ? "Submitting..." : submission ? "Update Submission" : "Submit Assignment"}</span>
              </Button>
            </div>
          </form>
        ) : submission ? (
          <div className="space-y-4">
            {submission.text_answer && (
              <div className="p-4 rounded-2xl bg-bg border border-border space-y-1.5">
                <span className="text-xs font-semibold text-muted block">
                  Your Written Answer:
                </span>
                <p className="text-sm text-ink whitespace-pre-wrap leading-relaxed">
                  {submission.text_answer}
                </p>
              </div>
            )}

            {submission.link_url && (
              <div className="p-4 rounded-2xl bg-bg border border-border flex items-center justify-between gap-4">
                <div className="space-y-0.5 min-w-0">
                  <span className="text-xs font-semibold text-muted block">
                    Submission Link:
                  </span>
                  <p className="text-sm font-medium text-ink truncate">
                    {submission.link_url}
                  </p>
                </div>

                <a
                  href={submission.link_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="p-2 rounded-xl bg-surface border border-border text-primary hover:text-primary-dark transition-colors shrink-0"
                >
                  <ExternalLink className="h-4 w-4" />
                </a>
              </div>
            )}

            <div className="flex items-center justify-between text-xs text-muted pt-2 border-t border-border/60">
              <span>
                Submitted on:{" "}
                {new Date(submission.submitted_at).toLocaleDateString(undefined, {
                  month: "short",
                  day: "numeric",
                  year: "numeric",
                  hour: "numeric",
                  minute: "2-digit",
                })}
              </span>

              {isGradedOrReleased ? (
                <span className="text-primary font-medium">Graded by tutor</span>
              ) : (
                <span className="text-muted">Awaiting tutor review</span>
              )}
            </div>
          </div>
        ) : (
          <div className="p-6 rounded-2xl bg-bg border border-dashed border-border text-center space-y-3">
            <p className="text-sm text-muted">
              You haven&apos;t submitted this assignment yet.
            </p>
            <Button
              type="button"
              onClick={() => setIsEditing(true)}
              className="rounded-xl text-xs font-semibold"
            >
              Start Submission
            </Button>
          </div>
        )}
      </Card>
    </div>
  );
}
