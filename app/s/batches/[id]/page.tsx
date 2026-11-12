import { notFound, redirect } from "next/navigation";
import Link from "next/link";
import { Clock, AlertCircle } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { FloatingNav } from "@/components/nav/floating-nav";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { buttonVariants } from "@/components/ui/button";
import { BatchFeedClient, type StudentFeedItem } from "@/components/student/batch-feed-client";

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function StudentBatchFeedPage({ params }: PageProps) {
  const { id: batchId } = await params;
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect(`/student/login?next=/s/batches/${batchId}`);
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("role, full_name, email")
    .eq("id", user.id)
    .single();

  if (!profile || profile.role !== "student") {
    redirect("/t");
  }

  // Fetch batch details + roster entry for this student
  const { data: batch } = await supabase
    .from("batches")
    .select(`
      id,
      name,
      subject,
      grade,
      description,
      join_code,
      premium_price_inr,
      profiles:tutor_id (
        full_name
      )
    `)
    .eq("id", batchId)
    .maybeSingle();

  if (!batch) {
    notFound();
  }

  const tutorName =
    (batch.profiles as unknown as { full_name?: string } | null)?.full_name ||
    "Tutor";

  // Check student membership
  const { data: rosterEntry } = await supabase
    .from("roster")
    .select("status, premium_until")
    .eq("batch_id", batchId)
    .eq("student_id", user.id)
    .maybeSingle();

  const isJoined = rosterEntry?.status === "joined";
  const isPending = rosterEntry?.status === "pending";
  const hasPremium = Boolean(
    isJoined &&
      rosterEntry?.premium_until &&
      new Date(rosterEntry.premium_until) > new Date()
  );

  if (isPending) {
    return (
      <div className="min-h-screen bg-bg text-ink flex flex-col justify-between">
        <FloatingNav
          role="student"
          userName={profile.full_name}
          userEmail={profile.email}
        />

        <main className="flex-1 w-full max-w-3xl mx-auto px-4 sm:px-6 pt-24 md:pt-[104px] pb-[calc(96px+env(safe-area-inset-bottom))] space-y-6">
          <Card className="p-8 rounded-3xl border-warning/40 bg-surface shadow-xs space-y-4 text-center">
            <div className="h-12 w-12 rounded-2xl bg-warning/15 text-warning flex items-center justify-center mx-auto">
              <Clock className="h-6 w-6" />
            </div>

            <div className="space-y-1">
              <Badge className="bg-warning/15 text-warning border-transparent text-xs font-semibold py-1">
                Waiting for Tutor Approval
              </Badge>
              <h1 className="font-serif text-2xl font-bold text-ink mt-2">
                {batch.name}
              </h1>
              <p className="text-sm text-muted">
                Taught by {tutorName}
              </p>
            </div>

            <p className="text-sm text-ink/80 max-w-md mx-auto leading-relaxed">
              Your request to join this batch has been sent to {tutorName}. You will receive immediate access to all quizzes, notes, and assignments once your tutor approves you.
            </p>

            <div className="pt-4 flex justify-center gap-3">
              <Link
                href="/s/batches"
                className={buttonVariants({ variant: "outline", className: "rounded-xl text-xs" })}
              >
                Back to Batches
              </Link>
            </div>
          </Card>
        </main>
      </div>
    );
  }

  if (!isJoined) {
    return (
      <div className="min-h-screen bg-bg text-ink flex flex-col justify-between">
        <FloatingNav
          role="student"
          userName={profile.full_name}
          userEmail={profile.email}
        />

        <main className="flex-1 w-full max-w-3xl mx-auto px-4 sm:px-6 pt-24 md:pt-[104px] pb-[calc(96px+env(safe-area-inset-bottom))] space-y-6">
          <Card className="p-8 rounded-3xl border-border bg-surface shadow-xs text-center space-y-4">
            <div className="h-12 w-12 rounded-2xl bg-destructive/15 text-destructive flex items-center justify-center mx-auto">
              <AlertCircle className="h-6 w-6" />
            </div>

            <div className="space-y-1">
              <h1 className="font-serif text-2xl font-bold text-ink">
                Not Enrolled in {batch.name}
              </h1>
              <p className="text-sm text-muted">
                You are not currently a member of this batch.
              </p>
            </div>

            <p className="text-sm text-muted max-w-md mx-auto">
              Please use the 6-character invite code provided by {tutorName} to join this batch.
            </p>

            <div className="pt-2">
              <Link
                href="/s"
                className={buttonVariants({ className: "rounded-xl text-xs" })}
              >
                Go to Home to Enter Code
              </Link>
            </div>
          </Card>
        </main>
      </div>
    );
  }

  // Student is joined: fetch feed items via get_student_feed RPC
  const { data: feedData, error: feedError } = await supabase.rpc(
    "get_student_feed",
    { p_batch_id: batchId }
  );

  if (feedError) {
    throw new Error(feedError.message);
  }

  const items: StudentFeedItem[] = Array.isArray(feedData)
    ? (feedData as unknown as StudentFeedItem[])
    : [];

  return (
    <div className="min-h-screen bg-bg text-ink flex flex-col justify-between">
      <FloatingNav
        role="student"
        userName={profile.full_name}
        userEmail={profile.email}
      />

      <main className="flex-1 w-full max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 pt-24 md:pt-[104px] pb-[calc(96px+env(safe-area-inset-bottom))] space-y-8">
        <BatchFeedClient
          batchId={batchId}
          batchName={batch.name}
          tutorName={tutorName}
          subject={batch.subject}
          grade={batch.grade}
          hasPremium={hasPremium}
          premiumPriceInr={batch.premium_price_inr}
          items={items}
        />
      </main>
    </div>
  );
}
