"use client";

import * as React from "react";
import Link from "next/link";
import { Lock, Crown } from "lucide-react";
import { AppShell } from "@/components/layout/app-shell";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { buttonVariants } from "@/components/ui/button";
import { QuizPlayer, type QuizQuestion, type QuizAttemptInfo } from "@/components/student/quiz-player";
import { NotesReader } from "@/components/student/notes-reader";
import { AssignmentViewer, type StudentSubmissionInfo } from "@/components/student/assignment-viewer";
import { AnnouncementViewer } from "@/components/student/announcement-viewer";
import { UnlockPremiumDialog } from "@/components/student/unlock-premium-dialog";
import type { ItemType } from "@/lib/database.types";

export interface StudentItemViewData {
  id: string;
  batch_id: string | null;
  tutor_id: string;
  tutor_name?: string;
  batch_name?: string;
  type: ItemType;
  title: string;
  body: Record<string, unknown> | null;
  access: "free" | "premium";
  visibility: "batch" | "public";
  grade: string | null;
  subject: string | null;
  due_at: string | null;
  max_marks: number | null;
  created_at: string;
  locked?: boolean;
  attempt?: QuizAttemptInfo | null;
  submission?: StudentSubmissionInfo | null;
}

interface ItemViewClientProps {
  item: StudentItemViewData;
  userName: string;
  userEmail: string;
}

export function ItemViewClient({ item, userName, userEmail }: ItemViewClientProps) {
  // If taking quiz, hide floating nav
  const [isQuizActive, setIsQuizActive] = React.useState(false);
  const [showUnlockModal, setShowUnlockModal] = React.useState(false);

  // If item is premium-locked
  if (item.locked) {
    return (
      <AppShell
        role="student"
        userName={userName}
        userEmail={userEmail}
      >
        <div className="max-w-xl mx-auto py-8">
          <Card className="rounded-3xl border-accent/40 bg-surface shadow-xs p-6 sm:p-8 text-center space-y-4">
            <div className="h-14 w-14 rounded-2xl bg-accent/20 text-accent-dark flex items-center justify-center mx-auto shadow-2xs">
              <Lock className="h-7 w-7 text-accent" />
            </div>

            <div className="space-y-1">
              <Badge className="bg-accent/20 text-accent-dark border-transparent text-xs font-semibold gap-1">
                <Crown className="h-3.5 w-3.5 text-accent" /> Premium Material
              </Badge>
              <h1 className="font-serif text-2xl font-bold text-ink">
                {item.title}
              </h1>
              <p className="text-xs text-muted">
                {item.batch_name ? `From batch ${item.batch_name}` : "Premium Content"}
              </p>
            </div>

            <p className="text-sm text-ink/80 max-w-sm mx-auto leading-relaxed">
              This content is reserved for premium members of this batch. Unlock full access to all practice questions, detailed revision notes, and exclusive tests.
            </p>

            <div className="pt-3 flex flex-wrap items-center justify-center gap-3">
              {item.batch_id && (
                <button
                  type="button"
                  onClick={() => setShowUnlockModal(true)}
                  className="rounded-xl text-xs font-semibold bg-accent text-ink hover:bg-accent/90 gap-1.5 px-5 py-2.5 inline-flex items-center shadow-xs cursor-pointer transition-all"
                >
                  <Lock className="h-3.5 w-3.5" />
                  <span>Unlock Premium Access</span>
                </button>
              )}
              <Link
                href={item.batch_id ? `/s/batches/${item.batch_id}` : "/s"}
                className={buttonVariants({
                  variant: "outline",
                  className: "rounded-xl text-xs",
                })}
              >
                Back to Batch
              </Link>
            </div>
          </Card>

          {item.batch_id && (
            <UnlockPremiumDialog
              open={showUnlockModal}
              onOpenChange={setShowUnlockModal}
              batchId={item.batch_id}
              batchName={item.batch_name || "Batch"}
              priceInr={299} // dynamic fallback from batch
              onSuccess={() => {
                window.location.reload();
              }}
            />
          )}
        </div>
      </AppShell>
    );
  }

  return (
    <AppShell
      role="student"
      userName={userName}
      userEmail={userEmail}
      hideNav={isQuizActive}
    >
        {item.type === "quiz" && (
          <QuizPlayer
            itemId={item.id}
            title={item.title}
            batchId={item.batch_id}
            batchName={item.batch_name}
            questions={(item.body?.questions as unknown as QuizQuestion[]) || []}
            maxMarks={item.max_marks}
            existingAttempt={item.attempt || null}
            timeLimitMinutes={(item.body?.time_limit_minutes as number) || null}
            onQuizStateChange={setIsQuizActive}
          />
        )}

        {item.type === "notes" && (
          <NotesReader
            itemId={item.id}
            title={item.title}
            batchId={item.batch_id}
            batchName={item.batch_name}
            tutorName={item.tutor_name}
            content={
              typeof item.body?.content === "string"
                ? item.body.content
                : typeof item.body?.markdown === "string"
                ? item.body.markdown
                : "No notes content provided."
            }
            grade={item.grade}
            subject={item.subject}
            createdAt={item.created_at}
          />
        )}

        {item.type === "assignment" && (
          <AssignmentViewer
            itemId={item.id}
            title={item.title}
            batchId={item.batch_id}
            batchName={item.batch_name}
            tutorName={item.tutor_name}
            instructions={
              typeof item.body?.instructions === "string"
                ? item.body.instructions
                : typeof item.body?.content === "string"
                ? item.body.content
                : ""
            }
            dueAt={item.due_at}
            maxMarks={item.max_marks}
            grade={item.grade}
            subject={item.subject}
            createdAt={item.created_at}
            existingSubmission={item.submission || null}
          />
        )}

        {item.type === "announcement" && (
          <AnnouncementViewer
            title={item.title}
            message={
              typeof item.body?.message === "string"
                ? item.body.message
                : typeof item.body?.content === "string"
                ? item.body.content
                : ""
            }
            batchId={item.batch_id}
            batchName={item.batch_name}
            tutorName={item.tutor_name}
            createdAt={item.created_at}
          />
        )}
    </AppShell>
  );
}
