"use client";

import React, { useState, useTransition } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import {
  Sparkles,
  ArrowRight,
  Copy,
  Check,
  Clock,
  CheckCircle2,
  AlertCircle,
  GraduationCap,
  BookOpen,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { SegmentedJoinCodeInput } from "@/components/student/segmented-join-code-input";
import { joinBatchByCodeAction, type PublicBatchInfo } from "@/app/actions/student";
import { AuthLogoPill } from "@/components/auth/auth-logo-pill";
import { APP_NAME } from "@/lib/config";

interface JoinPageClientProps {
  code: string;
  batch: PublicBatchInfo | null;
  userRole?: "student" | "tutor" | null;
  currentMembershipStatus?: "joined" | "pending" | "invited" | "rejected" | null;
  appUrl: string;
}

export function JoinPageClient({
  code,
  batch,
  userRole,
  currentMembershipStatus: initialStatus,
  appUrl,
}: JoinPageClientProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [membershipStatus, setMembershipStatus] = useState<
    "joined" | "pending" | "invited" | "rejected" | null
  >(initialStatus ?? null);
  const [copied, setCopied] = useState(false);

  const inviteUrl = `${appUrl}/join/${code.toUpperCase()}`;

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(inviteUrl);
      setCopied(true);
      toast.success("Invite link copied to clipboard!");
      setTimeout(() => setCopied(false), 2500);
    } catch {
      toast.error("Failed to copy link.");
    }
  };

  const handleStudentJoin = () => {
    startTransition(async () => {
      try {
        const res = await joinBatchByCodeAction(code);
        if (res.error) {
          toast.error(res.error);
        } else if (res.batchId) {
          if (res.status === "joined") {
            toast.success("Welcome to the batch! Redirecting...");
            setMembershipStatus("joined");
            router.push(`/s/batches/${res.batchId}`);
            router.refresh();
          } else if (res.status === "pending") {
            toast.info("Request sent! Your tutor will approve you soon.");
            setMembershipStatus("pending");
            router.refresh();
          }
        }
      } catch (err: unknown) {
        toast.error((err as Error)?.message || "Failed to join batch.");
      }
    });
  };

  return (
    <div className="min-h-screen bg-bg text-ink flex flex-col justify-between selection:bg-primary-soft selection:text-primary p-4 sm:p-6 lg:p-8">
      {/* Floating Logo Pill */}
      <AuthLogoPill />

      <main className="flex-1 flex items-center justify-center py-12">
        <div className="w-full max-w-xl mx-auto">
          {/* =================================================================== */}
          {/* INVALID CODE STATE */}
          {/* =================================================================== */}
          {!batch ? (
            <Card className="p-6 sm:p-8 rounded-3xl border-border bg-surface shadow-md text-center space-y-6">
              <div className="h-14 w-14 rounded-2xl bg-danger/10 text-danger flex items-center justify-center mx-auto">
                <AlertCircle className="h-7 w-7" />
              </div>

              <div className="space-y-2">
                <h1 className="font-serif text-2xl sm:text-3xl font-bold text-ink">
                  This invite link isn&apos;t valid
                </h1>
                <p className="text-xs sm:text-sm text-muted max-w-md mx-auto leading-relaxed">
                  The code <code className="font-mono font-bold text-ink bg-bg px-2 py-0.5 rounded border border-border">{code.toUpperCase()}</code> doesn&apos;t match any active batch. Enter another 6-character code below or ask your tutor for a new invite.
                </p>
              </div>

              <div className="pt-2 max-w-md mx-auto">
                <SegmentedJoinCodeInput
                  buttonText="Try Code"
                  onSuccess={(newBatchId, status) => {
                    if (status === "joined") {
                      router.push(`/s/batches/${newBatchId}`);
                    }
                  }}
                />
              </div>

              <div className="pt-4 border-t border-border flex items-center justify-center gap-4 text-xs text-muted">
                <Link href="/s" className="hover:text-ink font-medium">
                  Go to Student Home
                </Link>
                <span>•</span>
                <Link href="/" className="hover:text-ink font-medium">
                  Back to Home
                </Link>
              </div>
            </Card>
          ) : (
            /* =================================================================== */
            /* VALID BATCH PREVIEW CARD */
            /* =================================================================== */
            <Card className="p-6 sm:p-8 rounded-3xl border-border bg-surface shadow-md space-y-6">
              {/* Batch Header */}
              <div className="space-y-3">
                <div className="flex flex-wrap items-center gap-2">
                  <Badge className="bg-primary-soft text-primary font-medium text-xs px-2.5 py-1">
                    <Sparkles className="h-3 w-3 mr-1 text-accent" /> Batch Invite
                  </Badge>
                  {batch.subject && (
                    <Badge variant="outline" className="text-xs border-border text-ink">
                      {batch.subject}
                    </Badge>
                  )}
                  {batch.grade && (
                    <Badge variant="outline" className="text-xs border-border text-muted">
                      {batch.grade}
                    </Badge>
                  )}
                  <Badge className="ml-auto font-mono text-xs bg-bg text-muted border border-border">
                    {code.toUpperCase()}
                  </Badge>
                </div>

                <h1 className="font-serif text-2xl sm:text-3xl font-bold text-ink tracking-tight">
                  {batch.name}
                </h1>

                <div className="flex items-center gap-2 text-xs sm:text-sm text-muted">
                  <div className="h-6 w-6 rounded-full bg-primary/10 text-primary flex items-center justify-center font-bold text-xs">
                    {batch.tutor_name.slice(0, 1)}
                  </div>
                  <span>
                    Taught by <strong className="text-ink font-semibold">{batch.tutor_name}</strong>
                  </span>
                </div>

                {batch.description && (
                  <p className="text-xs sm:text-sm text-muted leading-relaxed pt-1">
                    {batch.description}
                  </p>
                )}
              </div>

              {/* Stats Row */}
              <div className="grid grid-cols-3 gap-3 p-3.5 bg-bg rounded-2xl border border-border text-center">
                <div>
                  <div className="text-lg sm:text-xl font-serif font-bold text-ink">
                    {batch.student_count}
                  </div>
                  <div className="text-[11px] text-muted">Students</div>
                </div>
                <div className="border-x border-border">
                  <div className="text-lg sm:text-xl font-serif font-bold text-ink">
                    {batch.free_item_count}
                  </div>
                  <div className="text-[11px] text-muted">Free items</div>
                </div>
                <div>
                  <div className="text-lg sm:text-xl font-serif font-bold text-ink">
                    {batch.premium_price_inr > 0 ? `₹${batch.premium_price_inr}` : "Free"}
                  </div>
                  <div className="text-[11px] text-muted">
                    {batch.premium_price_inr > 0 ? "/ month" : "Open batch"}
                  </div>
                </div>
              </div>

              {/* Dynamic Action Section based on user role & status */}
              <div className="pt-2 border-t border-border space-y-3">
                {/* 1. TUTOR LOGGED IN */}
                {userRole === "tutor" && (
                  <div className="p-4 rounded-2xl bg-primary-soft/40 border border-primary/20 space-y-3">
                    <div className="flex items-start gap-2.5">
                      <BookOpen className="h-5 w-5 text-primary shrink-0 mt-0.5" />
                      <div>
                        <div className="text-sm font-semibold text-ink">
                          You&apos;re signed in as a tutor
                        </div>
                        <p className="text-xs text-muted mt-0.5">
                          Students join this batch using this link or the join code.
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 pt-1">
                      <Button
                        onClick={handleCopyLink}
                        variant="outline"
                        size="sm"
                        className="text-xs gap-1.5 bg-surface"
                      >
                        {copied ? (
                          <>
                            <Check className="h-3.5 w-3.5 text-success" /> Copied link
                          </>
                        ) : (
                          <>
                            <Copy className="h-3.5 w-3.5" /> Copy invite link
                          </>
                        )}
                      </Button>
                      <Link
                        href="/t"
                        className="text-xs font-semibold text-primary hover:underline ml-auto"
                      >
                        Go to Tutor Dashboard →
                      </Link>
                    </div>
                  </div>
                )}

                {/* 2. STUDENT LOGGED IN */}
                {userRole === "student" && (
                  <>
                    {membershipStatus === "joined" ? (
                      <div className="p-4 rounded-2xl bg-success/10 border border-success/30 space-y-3 text-center">
                        <div className="inline-flex items-center gap-1.5 text-success text-sm font-semibold">
                          <CheckCircle2 className="h-4 w-4" /> You&apos;re a member of this batch
                        </div>
                        <p className="text-xs text-muted">
                          You have full access to study materials, quizzes, and announcements.
                        </p>
                        <Button
                          onClick={() => router.push(`/s/batches/${batch.id}`)}
                          className="w-full bg-success hover:bg-success/90 text-white font-semibold text-xs"
                        >
                          Go to Batch Stream
                        </Button>
                      </div>
                    ) : membershipStatus === "pending" ? (
                      <div className="p-4 rounded-2xl bg-warning/10 border border-warning/30 space-y-3 text-center">
                        <div className="inline-flex items-center gap-1.5 text-warning text-sm font-semibold">
                          <Clock className="h-4 w-4" /> Request sent. Your tutor will approve you soon
                        </div>
                        <p className="text-xs text-muted">
                          Your join request has been sent to {batch.tutor_name}. Once approved, this batch will unlock in your student portal.
                        </p>
                        <Button
                          onClick={() => router.push("/s")}
                          variant="outline"
                          className="w-full text-xs font-semibold"
                        >
                          Return to Student Home
                        </Button>
                      </div>
                    ) : (
                      <Button
                        onClick={handleStudentJoin}
                        disabled={isPending}
                        className="w-full h-12 rounded-xl bg-primary hover:bg-primary/90 text-primary-foreground font-semibold shadow-xs text-sm gap-2"
                      >
                        <span>{isPending ? "Joining batch..." : "Join batch"}</span>
                        <ArrowRight className="h-4 w-4" />
                      </Button>
                    )}
                  </>
                )}

                {/* 3. LOGGED OUT VISITOR */}
                {!userRole && (
                  <div className="space-y-3">
                    <p className="text-xs text-center text-muted">
                      Join to receive quizzes, lecture notes, and submissions for this batch.
                    </p>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <Link
                        href={`/student/register?join=${code.toUpperCase()}`}
                        className="w-full inline-flex items-center justify-center gap-1.5 h-11 px-4 rounded-xl font-semibold bg-primary hover:bg-primary/90 text-primary-foreground text-xs shadow-xs"
                      >
                        <GraduationCap className="h-4 w-4" />
                        Create student account
                      </Link>

                      <Link
                        href={`/student/login?join=${code.toUpperCase()}`}
                        className="w-full inline-flex items-center justify-center gap-1.5 h-11 px-4 rounded-xl font-semibold border border-border bg-surface hover:bg-bg text-ink text-xs shadow-xs"
                      >
                        I already have an account
                      </Link>
                    </div>
                  </div>
                )}
              </div>
            </Card>
          )}
        </div>
      </main>

      {/* Minimal Footer */}
      <footer className="text-center text-xs text-muted py-4">
        {APP_NAME} • Prompt it. Push it. Track it.
      </footer>
    </div>
  );
}
