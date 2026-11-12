import { notFound, redirect } from "next/navigation";
import Link from "next/link";
import {
  FileText,
  Users,
  Award,
  ClipboardList,
  Settings,
  ChevronLeft,
  MessageCircle,
} from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { AppShell } from "@/components/layout/app-shell";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { BatchShareDialog } from "@/components/tutor/batch-share-dialog";
import { BatchContentTab } from "@/components/tutor/batch-content-tab";
import { BatchStudentsTab } from "@/components/tutor/batch-students-tab";
import { BatchResultsTab, type QuizResultData } from "@/components/tutor/batch-results-tab";
import { BatchSubmissionsTab, type AssignmentItemData } from "@/components/tutor/batch-submissions-tab";
import { BatchSettingsTab } from "@/components/tutor/batch-settings-tab";
import { APP_NAME } from "@/lib/config";

interface BatchPageProps {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ tab?: string }>;
}

export default async function TutorBatchDetailPage({
  params,
  searchParams,
}: BatchPageProps) {
  const { id: batchId } = await params;
  const { tab: activeTab = "content" } = await searchParams;

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/tutor/login");
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("full_name, email, role")
    .eq("id", user.id)
    .single();

  if (!profile || profile.role !== "tutor") {
    redirect("/s");
  }

  // 1. Fetch batch, items, roster, payments in parallel for instant loading
  const [batchRes, itemsRes, rosterRes, paymentsRes] = await Promise.all([
    supabase
      .from("batches")
      .select("*")
      .eq("id", batchId)
      .eq("tutor_id", user.id)
      .single(),
    supabase
      .from("items")
      .select("*")
      .eq("batch_id", batchId)
      .order("created_at", { ascending: false }),
    supabase
      .from("roster")
      .select("*")
      .eq("batch_id", batchId)
      .order("created_at", { ascending: false }),
    supabase
      .from("payments")
      .select(`
        id,
        amount_inr,
        commission_inr,
        status,
        created_at,
        razorpay_payment_id,
        profiles:student_id (
          full_name,
          email
        )
      `)
      .eq("batch_id", batchId)
      .order("created_at", { ascending: false }),
  ]);

  const batch = batchRes.data;
  if (!batch) {
    notFound();
  }

  const itemList = itemsRes.data || [];
  const rosterList = rosterRes.data || [];
  const joinedMembers = rosterList.filter((r) => r.status === "joined");

  const quizItems = itemList.filter((i) => i.type === "quiz");
  const assignmentItems = itemList.filter((i) => i.type === "assignment");
  const quizIds = quizItems.map((q) => q.id);
  const assignmentIds = assignmentItems.map((a) => a.id);

  // 2. Fetch all quiz keys, attempts, and submissions in parallel
  const admin = createAdminClient();
  const [quizKeysRes, attemptsRes, submissionsRes] = await Promise.all([
    quizIds.length > 0
      ? admin
          .from("quiz_keys")
          .select("item_id, answers")
          .in("item_id", quizIds)
      : Promise.resolve({ data: [] }),
    quizIds.length > 0
      ? supabase
          .from("attempts")
          .select(`
            id,
            item_id,
            student_id,
            score,
            total,
            submitted_at,
            answers,
            profiles (
              full_name,
              email
            )
          `)
          .in("item_id", quizIds)
          .order("submitted_at", { ascending: false })
      : Promise.resolve({ data: [] }),
    assignmentIds.length > 0
      ? supabase
          .from("submissions")
          .select(`
            id,
            item_id,
            student_id,
            text_answer,
            link_url,
            status,
            marks,
            feedback,
            submitted_at,
            graded_at,
            released_at,
            profiles (
              full_name,
              email
            )
          `)
          .in("item_id", assignmentIds)
          .order("submitted_at", { ascending: false })
      : Promise.resolve({ data: [] }),
  ]);

  // Index quiz keys by item_id
  const keyMap = new Map<string, Record<string, number>>();
  (quizKeysRes.data || []).forEach((k) => {
    keyMap.set(k.item_id, (k.answers as Record<string, number>) || {});
  });

  // Index attempts by item_id
  const attemptsMap = new Map<string, typeof attemptsRes.data>();
  (attemptsRes.data || []).forEach((att) => {
    const list = attemptsMap.get(att.item_id) || [];
    list.push(att);
    attemptsMap.set(att.item_id, list);
  });

  // Index submissions by item_id
  const submissionsMap = new Map<string, typeof submissionsRes.data>();
  (submissionsRes.data || []).forEach((sub) => {
    const list = submissionsMap.get(sub.item_id) || [];
    list.push(sub);
    submissionsMap.set(sub.item_id, list);
  });

  // Assemble quizResultsData
  const quizResultsData: QuizResultData[] = quizItems.map((q) => {
    const parsedQuestions =
      typeof q.body === "object" && q.body && "questions" in q.body
        ? (q.body.questions as Array<{ id: string; text: string; marks?: number }>)
        : [];
    const itemAttempts = attemptsMap.get(q.id) || [];

    return {
      item_id: q.id,
      title: q.title,
      max_marks: q.max_marks,
      due_at: q.due_at,
      questions: parsedQuestions,
      quiz_answers: keyMap.get(q.id) || {},
      attempts: itemAttempts.map((att) => {
        const prof = att.profiles as unknown as { full_name: string; email: string | null } | null;
        return {
          id: att.id,
          student_id: att.student_id,
          student_name: prof?.full_name || "Student",
          student_email: prof?.email || null,
          score: att.score,
          total: att.total,
          submitted_at: att.submitted_at,
          answers: (att.answers as Record<string, number>) || null,
        };
      }),
    };
  });

  // Assemble assignmentData
  const assignmentData: AssignmentItemData[] = assignmentItems.map((a) => {
    const itemSubs = submissionsMap.get(a.id) || [];
    return {
      item_id: a.id,
      title: a.title,
      max_marks: a.max_marks,
      submissions: itemSubs.map((sub) => {
        const prof = sub.profiles as unknown as { full_name: string; email: string | null } | null;
        return {
          id: sub.id,
          item_id: sub.item_id,
          student_id: sub.student_id,
          student_name: prof?.full_name || "Student",
          student_email: prof?.email || null,
          text_answer: sub.text_answer,
          link_url: sub.link_url,
          status: sub.status,
          marks: sub.marks,
          feedback: sub.feedback,
          submitted_at: sub.submitted_at,
          graded_at: sub.graded_at,
          released_at: sub.released_at,
        };
      }),
    };
  });

  const paymentList = (paymentsRes.data || []).map((p) => ({
    id: p.id,
    amountInr: p.amount_inr,
    commissionInr: p.commission_inr,
    status: p.status,
    createdAt: p.created_at,
    paymentId: p.razorpay_payment_id,
    studentName:
      (p.profiles as unknown as { full_name?: string } | null)?.full_name ||
      "Student",
    studentEmail:
      (p.profiles as unknown as { email?: string } | null)?.email || "",
  }));

  // WhatsApp and invite links
  const whatsappText = `Join our batch "${batch.name}" on ${APP_NAME}! Code: ${batch.join_code}`;
  const whatsappUrl = `https://wa.me/?text=${encodeURIComponent(whatsappText)}`;

  return (
    <AppShell
      role="tutor"
      userName={profile.full_name}
      userEmail={profile.email}
    >
      <div>
        {/* Back navigation link */}
        <div className="mb-4">
          <Link
            href="/t/batches"
            className="inline-flex items-center gap-1.5 text-xs text-muted hover:text-ink font-semibold transition-colors"
          >
            <ChevronLeft className="w-4 h-4" />
            <span>All Batches</span>
          </Link>
        </div>

        {/* Batch Header */}
        <header className="mb-8 p-6 sm:p-8 rounded-3xl bg-surface border border-border shadow-xs">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
            <div className="space-y-2">
              <div className="flex flex-wrap items-center gap-2">
                {batch.subject && (
                  <Badge variant="secondary" className="rounded-full text-xs font-semibold bg-primary-soft text-primary">
                    {batch.subject}
                  </Badge>
                )}
                {batch.grade && (
                  <Badge variant="outline" className="rounded-full text-xs font-medium text-muted">
                    {batch.grade}
                  </Badge>
                )}
                {batch.premium_price_inr > 0 ? (
                  <Badge variant="outline" className="rounded-full text-xs font-bold text-accent border-accent/40 bg-accent/10">
                    ₹{batch.premium_price_inr}/month
                  </Badge>
                ) : (
                  <Badge variant="outline" className="rounded-full text-xs text-muted border-dashed">
                    Free Access
                  </Badge>
                )}
              </div>

              <h1 className="font-serif text-3xl sm:text-4xl font-bold tracking-tight text-ink">
                {batch.name}
              </h1>

              {batch.description && (
                <p className="text-xs sm:text-sm text-muted max-w-2xl leading-relaxed">
                  {batch.description}
                </p>
              )}
            </div>

            {/* Quick Actions & Join Code */}
            <div className="flex flex-wrap sm:flex-nowrap items-center gap-2.5">
              {/* Join Code Display */}
              <div className="flex items-center gap-2 p-1.5 pl-3 rounded-2xl bg-surface border border-border">
                <div className="flex flex-col">
                  <span className="text-[10px] uppercase font-bold text-muted">Code</span>
                  <span className="font-mono font-extrabold text-base text-primary tracking-wider">
                    {batch.join_code}
                  </span>
                </div>
                <BatchShareDialog batchName={batch.name} joinCode={batch.join_code} triggerVariant="button" />
              </div>

              {/* Share on WhatsApp */}
              <a
                href={whatsappUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold bg-emerald-600 hover:bg-emerald-700 text-white shadow-xs transition-colors shrink-0"
              >
                <MessageCircle className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">WhatsApp</span>
              </a>
            </div>
          </div>
        </header>

        {/* 5 Tab Navigation (Scrollable on Mobile) */}
        <Tabs defaultValue={activeTab} className="space-y-6">
          <div className="overflow-x-auto pb-1 scrollbar-none">
            <TabsList className="inline-flex h-11 items-center justify-start rounded-2xl bg-surface p-1 border border-border text-muted min-w-max">
              <TabsTrigger
                value="content"
                className="rounded-xl px-4 py-1.5 text-xs font-semibold gap-1.5 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground data-[state=active]:shadow-xs"
              >
                <FileText className="w-3.5 h-3.5" />
                <span>Content ({itemList.length})</span>
              </TabsTrigger>

              <TabsTrigger
                value="students"
                className="rounded-xl px-4 py-1.5 text-xs font-semibold gap-1.5 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground data-[state=active]:shadow-xs"
              >
                <Users className="w-3.5 h-3.5" />
                <span>Students ({rosterList.length})</span>
              </TabsTrigger>

              <TabsTrigger
                value="results"
                className="rounded-xl px-4 py-1.5 text-xs font-semibold gap-1.5 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground data-[state=active]:shadow-xs"
              >
                <Award className="w-3.5 h-3.5" />
                <span>Quiz Results ({quizItems.length})</span>
              </TabsTrigger>

              <TabsTrigger
                value="submissions"
                className="rounded-xl px-4 py-1.5 text-xs font-semibold gap-1.5 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground data-[state=active]:shadow-xs"
              >
                <ClipboardList className="w-3.5 h-3.5" />
                <span>Submissions ({assignmentItems.length})</span>
              </TabsTrigger>

              <TabsTrigger
                value="settings"
                className="rounded-xl px-4 py-1.5 text-xs font-semibold gap-1.5 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground data-[state=active]:shadow-xs"
              >
                <Settings className="w-3.5 h-3.5" />
                <span>Settings</span>
              </TabsTrigger>
            </TabsList>
          </div>

          {/* TAB 1: CONTENT */}
          <TabsContent value="content">
            <BatchContentTab batchId={batch.id} items={itemList} />
          </TabsContent>

          {/* TAB 2: STUDENTS */}
          <TabsContent value="students">
            <BatchStudentsTab batchId={batch.id} roster={rosterList} />
          </TabsContent>

          {/* TAB 3: RESULTS */}
          <TabsContent value="results">
            <BatchResultsTab
              batchId={batch.id}
              quizzes={quizResultsData}
              joinedStudents={joinedMembers}
            />
          </TabsContent>

          {/* TAB 4: SUBMISSIONS */}
          <TabsContent value="submissions">
            <BatchSubmissionsTab
              batchId={batch.id}
              assignments={assignmentData}
            />
          </TabsContent>

          {/* TAB 5: SETTINGS */}
          <TabsContent value="settings">
            <BatchSettingsTab
              batch={{
                id: batch.id,
                name: batch.name,
                subject: batch.subject,
                grade: batch.grade,
                description: batch.description,
                joinCode: batch.join_code,
                premiumPriceInr: batch.premium_price_inr,
              }}
              payments={paymentList}
            />
          </TabsContent>
        </Tabs>
      </div>
    </AppShell>
  );
}
