import { redirect } from "next/navigation";
import Link from "next/link";
import {
  Users,
  Clock,
  IndianRupee,
  FileCheck2,
  ArrowRight,
  BookOpen,
} from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { FloatingNav } from "@/components/nav/floating-nav";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { NewBatchDialog } from "@/components/tutor/new-batch-dialog";
import { BatchCard } from "@/components/tutor/batch-card";
import { buttonVariants } from "@/components/ui/button";
import { PLATFORM_FEE_PERCENT, isUserAdmin } from "@/lib/config";

export default async function TutorDashboardPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/tutor/login");
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", user.id)
    .single();

  if (!profile || profile.role !== "tutor") {
    redirect("/s");
  }

  // 1. Fetch batches with roster and items
  const { data: batches } = await supabase
    .from("batches")
    .select(`
      id,
      name,
      subject,
      grade,
      description,
      join_code,
      premium_price_inr,
      created_at,
      roster (
        id,
        status
      ),
      items (
        id
      )
    `)
    .eq("tutor_id", user.id)
    .order("created_at", { ascending: false });

  // Compute aggregate stats across batches
  const batchList = batches || [];
  const batchCount = batchList.length;

  let studentsJoinedCount = 0;
  let pendingApprovalsCount = 0;

  batchList.forEach((b) => {
    const roster = b.roster || [];
    roster.forEach((r) => {
      if (r.status === "joined") studentsJoinedCount++;
      if (r.status === "pending") pendingApprovalsCount++;
    });
  });

  // 2. Fetch submissions to grade
  const { count: pendingSubmissionsCount } = await supabase
    .from("submissions")
    .select("id, items!inner(tutor_id)", { count: "exact", head: true })
    .eq("items.tutor_id", user.id)
    .eq("status", "submitted");

  // 3. Fetch paid payments for tutor's batches to calculate net earnings
  const { data: paidPayments } = await supabase
    .from("payments")
    .select(`
      amount_inr,
      commission_inr,
      batches!inner(tutor_id)
    `)
    .eq("status", "paid")
    .eq("batches.tutor_id", user.id);

  const grossEarnings = (paidPayments || []).reduce((acc, p) => acc + (p.amount_inr || 0), 0);
  const platformFee = (paidPayments || []).reduce((acc, p) => {
    return acc + (p.commission_inr || Math.round(((p.amount_inr || 0) * PLATFORM_FEE_PERCENT) / 100));
  }, 0);
  const netEarnings = grossEarnings - platformFee;

  // 4. Check if tutor has an active MCP token
  const { count: activeMcpTokensCount } = await supabase
    .from("mcp_tokens")
    .select("id", { count: "exact", head: true })
    .eq("tutor_id", user.id)
    .is("revoked_at", null);

  const hasMcpToken = (activeMcpTokensCount || 0) > 0;

  return (
    <div className="min-h-screen bg-bg text-ink flex flex-col justify-between selection:bg-primary-soft selection:text-primary">
      <FloatingNav
        role="tutor"
        userName={profile.full_name}
        userEmail={profile.email}
        isAdmin={isUserAdmin(profile.email)}
      />

      <main className="flex-1 w-full max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 pt-8 pb-20">
        {/* Header Greeting & Primary Action */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
          <div>
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-primary-soft text-primary mb-2">
              Educator Portal
            </div>
            <h1 className="font-serif text-3xl sm:text-4xl font-bold tracking-tight text-ink">
              Welcome back, {profile.full_name}
            </h1>
            <p className="text-xs sm:text-sm text-muted mt-1">
              {profile.institute ? `${profile.institute} • ` : ""}Manage your classrooms, coursework, and students.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <NewBatchDialog />
          </div>
        </div>

        {/* Link Assistant Banner */}
        {!hasMcpToken && (
          <section className="mb-8 p-6 sm:p-7 rounded-3xl bg-linear-to-r from-primary via-primary/95 to-ink text-white relative overflow-hidden shadow-sm">
            <div className="relative z-10 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div className="space-y-1.5 max-w-xl">
                <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-bold tracking-wide uppercase bg-white/15 text-white backdrop-blur-md">
                  Assistant Workflows
                </div>
                <h2 className="font-serif text-xl sm:text-2xl font-bold text-white">
                  Connect Claude, ChatGPT, or Gemini
                </h2>
                <p className="text-white/80 text-xs sm:text-sm leading-relaxed">
                  Publish quizzes, revision notes, and assignments directly from your assistant conversation into Classy.
                </p>
              </div>

              <Link
                href="/t/connect"
                className={buttonVariants({
                  className: "rounded-xl bg-white text-ink hover:bg-white/90 text-xs font-bold shrink-0 shadow-sm px-5 py-2.5",
                })}
              >
                Set Up Assistant &rarr;
              </Link>
            </div>
          </section>
        )}

        {/* Stat Cards Grid */}
        <section className="grid grid-cols-2 lg:grid-cols-5 gap-3.5 sm:gap-4 mb-8">
          <Card className="rounded-2xl border-border bg-surface shadow-xs">
            <CardHeader className="p-4 pb-2">
              <CardDescription className="text-xs font-medium flex items-center justify-between">
                <span>Batches</span>
                <BookOpen className="w-3.5 h-3.5 text-primary" />
              </CardDescription>
              <CardTitle className="text-2xl sm:text-3xl font-serif font-bold text-ink">
                {batchCount}
              </CardTitle>
            </CardHeader>
            <CardContent className="p-4 pt-0 text-[11px] text-muted truncate">
              Active classrooms
            </CardContent>
          </Card>

          <Card className="rounded-2xl border-border bg-surface shadow-xs">
            <CardHeader className="p-4 pb-2">
              <CardDescription className="text-xs font-medium flex items-center justify-between">
                <span>Students</span>
                <Users className="w-3.5 h-3.5 text-primary" />
              </CardDescription>
              <CardTitle className="text-2xl sm:text-3xl font-serif font-bold text-ink">
                {studentsJoinedCount}
              </CardTitle>
            </CardHeader>
            <CardContent className="p-4 pt-0 text-[11px] text-muted truncate">
              Joined across batches
            </CardContent>
          </Card>

          <Card className="rounded-2xl border-border bg-surface shadow-xs">
            <CardHeader className="p-4 pb-2">
              <CardDescription className="text-xs font-medium flex items-center justify-between">
                <span>Pending</span>
                <Clock className="w-3.5 h-3.5 text-amber-500" />
              </CardDescription>
              <CardTitle className="text-2xl sm:text-3xl font-serif font-bold text-ink">
                {pendingApprovalsCount}
              </CardTitle>
            </CardHeader>
            <CardContent className="p-4 pt-0 text-[11px] text-muted truncate">
              Awaiting your approval
            </CardContent>
          </Card>

          <Card className="rounded-2xl border-border bg-surface shadow-xs">
            <CardHeader className="p-4 pb-2">
              <CardDescription className="text-xs font-medium flex items-center justify-between">
                <span>To Grade</span>
                <FileCheck2 className="w-3.5 h-3.5 text-indigo-500" />
              </CardDescription>
              <CardTitle className="text-2xl sm:text-3xl font-serif font-bold text-ink">
                {pendingSubmissionsCount ?? 0}
              </CardTitle>
            </CardHeader>
            <CardContent className="p-4 pt-0 text-[11px] text-muted truncate">
              Submissions pending marks
            </CardContent>
          </Card>

          <Card className="col-span-2 sm:col-span-1 rounded-2xl border-border bg-surface shadow-xs">
            <CardHeader className="p-4 pb-1">
              <CardDescription className="text-xs font-medium flex items-center justify-between">
                <span>Net Earnings</span>
                <IndianRupee className="w-3.5 h-3.5 text-accent" />
              </CardDescription>
              <CardTitle className="text-2xl sm:text-3xl font-serif font-bold text-accent">
                ₹{netEarnings.toLocaleString("en-IN")}
              </CardTitle>
            </CardHeader>
            <CardContent className="p-4 pt-1 space-y-0.5 text-[10px] text-muted">
              <div className="flex justify-between">
                <span>Gross:</span>
                <span className="font-medium text-ink">₹{grossEarnings.toLocaleString("en-IN")}</span>
              </div>
              <div className="flex justify-between">
                <span>Fee ({PLATFORM_FEE_PERCENT}%):</span>
                <span className="text-muted">-₹{platformFee.toLocaleString("en-IN")}</span>
              </div>
            </CardContent>
          </Card>
        </section>

        {/* Your Batches Section */}
        <section className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="font-serif text-2xl font-bold tracking-tight text-ink">
                Your Batches
              </h2>
              <p className="text-xs text-muted">
                Quickly access course streams, rosters, quiz analytics, and grading queues.
              </p>
            </div>
            {batchList.length > 0 && (
              <Link
                href="/t/batches"
                className="text-xs font-semibold text-primary hover:underline inline-flex items-center gap-1"
              >
                View all ({batchList.length}) <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            )}
          </div>

          {batchList.length === 0 ? (
            <div className="p-10 rounded-2xl border border-dashed border-border bg-surface/50 text-center space-y-3">
              <div className="w-12 h-12 rounded-2xl bg-primary-soft text-primary mx-auto flex items-center justify-center">
                <Users className="w-6 h-6" />
              </div>
              <h3 className="font-serif text-lg font-bold text-ink">
                No batches created yet
              </h3>
              <p className="text-xs sm:text-sm text-muted max-w-md mx-auto">
                Create your first batch to generate an invite link and 6-character code for your students.
              </p>
              <div className="pt-2">
                <NewBatchDialog />
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              {batchList.slice(0, 6).map((b) => {
                const roster = b.roster || [];
                const joined = roster.filter((r) => r.status === "joined").length;
                const pending = roster.filter((r) => r.status === "pending").length;
                const itemsCount = b.items?.length || 0;

                return (
                  <BatchCard
                    key={b.id}
                    id={b.id}
                    name={b.name}
                    subject={b.subject}
                    grade={b.grade}
                    joinCode={b.join_code}
                    premiumPriceInr={b.premium_price_inr}
                    joinedCount={joined}
                    pendingCount={pending}
                    itemCount={itemsCount}
                  />
                );
              })}
            </div>
          )}
        </section>
      </main>
    </div>
  );
}
