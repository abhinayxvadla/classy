import { redirect } from "next/navigation";
import Link from "next/link";
import {
  Users,
  BookOpen,
  ArrowRight,
  Clock,
  AlertCircle,
  FileText,
  HelpCircle,
  CheckCircle2,
  Crown,
  Calendar,
} from "lucide-react";
import { formatDistanceToNow, isPast } from "date-fns";
import { createClient } from "@/lib/supabase/server";
import { AppShell } from "@/components/layout/app-shell";
import { buttonVariants } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { StudentJoinBox } from "@/components/student/student-join-box";
import { InstallBanner } from "@/components/pwa/install-banner";
import type { ItemType } from "@/lib/database.types";

interface MyBatchItem {
  id: string;
  name: string;
  subject: string | null;
  grade: string | null;
  description: string | null;
  join_code: string;
  premium_price_inr: number;
  status: "joined" | "pending";
  joined_at: string | null;
  tutor_name: string;
  has_premium: boolean;
  premium_until: string | null;
  student_count: number;
  item_count: number;
}

interface PublicLibraryItem {
  id: string;
  batch_id: string | null;
  batch_name: string | null;
  tutor_name: string;
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
  is_member: boolean;
}

interface DueSoonItem {
  id: string;
  title: string;
  type: ItemType;
  due_at: string;
  max_marks: number | null;
  batch_name: string;
  batch_id: string;
  is_completed: boolean;
}

export default async function StudentHomePage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/student/login");
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", user.id)
    .single();

  if (!profile || profile.role !== "student") {
    redirect("/t");
  }

  // 1. Fetch student batches via get_my_batches RPC
  const { data: batchesData } = await supabase.rpc("get_my_batches");
  const myBatches: MyBatchItem[] = Array.isArray(batchesData) ? (batchesData as unknown as MyBatchItem[]) : [];

  const joinedBatches = myBatches.filter((b) => b.status === "joined");
  const pendingBatches = myBatches.filter((b) => b.status === "pending");
  const joinedBatchIds = joinedBatches.map((b) => b.id);

  // 2. Fetch "Due soon" items (next 7 days across joined batches)
  let dueSoonItems: DueSoonItem[] = [];
  if (joinedBatchIds.length > 0) {
    const nowIso = new Date().toISOString();
    const sevenDaysLater = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString();

    const { data: rawItems } = await supabase
      .from("items")
      .select(`
        id,
        title,
        type,
        due_at,
        max_marks,
        batch_id,
        batches (
          name
        )
      `)
      .in("batch_id", joinedBatchIds)
      .in("type", ["assignment", "quiz"])
      .eq("published", true)
      .not("due_at", "is", null)
      .gte("due_at", nowIso)
      .lte("due_at", sevenDaysLater)
      .order("due_at", { ascending: true })
      .limit(6);

    if (rawItems && rawItems.length > 0) {
      // Check which items are already submitted / attempted
      const itemIds = rawItems.map((i) => i.id);

      const [attemptsRes, submissionsRes] = await Promise.all([
        supabase
          .from("attempts")
          .select("item_id")
          .eq("student_id", user.id)
          .in("item_id", itemIds),
        supabase
          .from("submissions")
          .select("item_id")
          .eq("student_id", user.id)
          .in("item_id", itemIds),
      ]);

      const attemptedSet = new Set((attemptsRes.data || []).map((a) => a.item_id));
      const submittedSet = new Set((submissionsRes.data || []).map((s) => s.item_id));

      dueSoonItems = rawItems.map((item) => {
        const batchName =
          (item.batches as unknown as { name?: string } | null)?.name || "Batch";
        const isCompleted =
          item.type === "quiz"
            ? attemptedSet.has(item.id)
            : submittedSet.has(item.id);

        return {
          id: item.id,
          title: item.title,
          type: item.type as ItemType,
          due_at: item.due_at!,
          max_marks: item.max_marks,
          batch_name: batchName,
          batch_id: item.batch_id!,
          is_completed: isCompleted,
        };
      });
    }
  }

  // 3. If student has no batches, fetch first 6 items from get_public_library
  let freeForYouItems: PublicLibraryItem[] = [];
  if (myBatches.length === 0) {
    const { data: libraryData } = await supabase.rpc("get_public_library");
    if (Array.isArray(libraryData)) {
      freeForYouItems = (libraryData as unknown as PublicLibraryItem[]).slice(0, 6);
    }
  }

  return (
    <AppShell
      role="student"
      userName={profile.full_name}
      userEmail={profile.email}
      subtitle={profile.grade ? `${profile.grade} Student` : "Student Portal"}
    >
      <div className="space-y-8">
        {/* Dismissible PWA Install Banner */}
        <InstallBanner />

        {/* Welcome Greeting Banner */}
        <section className="p-6 sm:p-8 rounded-3xl bg-linear-to-br from-primary via-primary/95 to-ink text-white relative overflow-hidden shadow-sm">
          <div className="relative z-10 space-y-3">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-white/10 backdrop-blur-md border border-white/15">
              <span>Student Portal • {profile.grade || "All Classes"}</span>
            </div>
            <h1 className="font-serif text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight text-white">
              Hi, {profile.full_name}
            </h1>
            <p className="text-white/80 text-sm sm:text-base max-w-2xl leading-relaxed">
              Your classes, quizzes, and revision library in one calm space. Join a batch with a code from your teacher or explore free study material.
            </p>
          </div>
        </section>

        {/* Join a Batch Code Box */}
        <StudentJoinBox />

        {/* =================================================================== */}
        {/* DUE SOON STRIP (Next 7 days across batches) */}
        {/* =================================================================== */}
        {dueSoonItems.length > 0 && (
          <section className="space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Calendar className="h-4 w-4 text-primary" />
                <h2 className="font-serif text-xl font-bold text-ink">
                  Due Soon
                </h2>
              </div>
              <span className="text-xs text-muted">Next 7 days</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {dueSoonItems.map((item) => {
                const dueDate = new Date(item.due_at);
                const past = isPast(dueDate);

                return (
                  <Link
                    key={item.id}
                    href={`/s/items/${item.id}`}
                    className="group block p-4 rounded-2xl border border-border bg-surface hover:border-primary/50 transition-all shadow-2xs hover:shadow-sm"
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex items-center gap-1.5">
                        {item.type === "quiz" ? (
                          <HelpCircle className="h-4 w-4 text-primary shrink-0" />
                        ) : (
                          <FileText className="h-4 w-4 text-accent shrink-0" />
                        )}
                        <span className="text-[11px] font-semibold text-muted uppercase tracking-wider">
                          {item.type}
                        </span>
                      </div>

                      {item.is_completed ? (
                        <Badge className="bg-success/15 text-success border-transparent text-[10px] font-medium gap-1">
                          <CheckCircle2 className="h-3 w-3" /> Done
                        </Badge>
                      ) : past ? (
                        <Badge className="bg-destructive/15 text-destructive border-transparent text-[10px] font-medium">
                          Overdue
                        </Badge>
                      ) : (
                        <Badge className="bg-accent/15 text-ink border-transparent text-[10px] font-medium">
                          Due {formatDistanceToNow(dueDate, { addSuffix: true })}
                        </Badge>
                      )}
                    </div>

                    <h3 className="font-serif font-bold text-ink text-sm mt-2 line-clamp-1 group-hover:text-primary transition-colors">
                      {item.title}
                    </h3>

                    <div className="flex items-center justify-between mt-3 pt-2.5 border-t border-border/60 text-xs text-muted">
                      <span className="truncate max-w-[160px] font-medium text-ink">
                        {item.batch_name}
                      </span>
                      {item.max_marks != null && (
                        <span className="text-[11px] text-muted">
                          {item.max_marks} marks
                        </span>
                      )}
                    </div>
                  </Link>
                );
              })}
            </div>
          </section>
        )}

        {/* =================================================================== */}
        {/* PENDING APPROVAL REQUESTS */}
        {/* =================================================================== */}
        {pendingBatches.length > 0 && (
          <section className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="font-serif text-xl font-bold text-ink">
                  Join Requests Pending
                </h2>
                <p className="text-xs text-muted">
                  These batches are awaiting approval from the tutor.
                </p>
              </div>
              <Badge variant="outline" className="border-warning/50 text-warning text-xs">
                {pendingBatches.length} Pending
              </Badge>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {pendingBatches.map((b) => (
                <Card
                  key={b.id}
                  className="p-5 rounded-2xl border-warning/30 bg-surface shadow-xs space-y-3"
                >
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <h3 className="font-serif font-bold text-ink text-base">
                        {b.name}
                      </h3>
                      <p className="text-xs text-muted mt-0.5">
                        Taught by {b.tutor_name}
                      </p>
                    </div>

                    <Badge className="bg-warning/15 text-warning border-transparent text-xs font-medium gap-1 shrink-0 py-1">
                      <Clock className="h-3 w-3" /> Waiting for approval
                    </Badge>
                  </div>

                  <div className="flex flex-wrap items-center gap-1.5 pt-1">
                    {b.subject && (
                      <Badge variant="outline" className="text-[10px] text-ink border-border">
                        {b.subject}
                      </Badge>
                    )}
                    {b.grade && (
                      <Badge variant="outline" className="text-[10px] text-muted border-border">
                        {b.grade}
                      </Badge>
                    )}
                  </div>

                  <div className="p-3 rounded-xl bg-bg border border-border/60 text-xs text-muted flex items-start gap-2">
                    <AlertCircle className="h-4 w-4 text-warning shrink-0 mt-0.5" />
                    <span>
                      Your request has been submitted to {b.tutor_name}. Batch content will become accessible once your tutor approves you.
                    </span>
                  </div>
                </Card>
              ))}
            </div>
          </section>
        )}

        {/* =================================================================== */}
        {/* MY BATCHES SECTION */}
        {/* =================================================================== */}
        {myBatches.length > 0 ? (
          <section className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="font-serif text-xl font-bold text-ink">
                  Your Batches
                </h2>
                <p className="text-xs text-muted">
                  Batches you are enrolled in.
                </p>
              </div>
              <Link
                href="/s/batches"
                className="text-xs font-semibold text-primary hover:underline flex items-center gap-1"
              >
                <span>View all</span>
                <ArrowRight className="h-3 w-3" />
              </Link>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {joinedBatches.map((b) => (
                <Card
                  key={b.id}
                  className="p-5 rounded-2xl border-border bg-surface shadow-xs flex flex-col justify-between space-y-4 hover:border-primary/40 transition-all"
                >
                  <div className="space-y-2">
                    <div className="flex items-center justify-between gap-2">
                      <div className="flex items-center gap-1.5">
                        <Badge className="bg-success/15 text-success border-transparent text-[10px] font-semibold">
                          Joined
                        </Badge>
                        {b.has_premium ? (
                          <Badge className="bg-accent/20 text-accent-dark border-transparent text-[10px] font-semibold gap-1">
                            <Crown className="h-3 w-3 text-accent" /> Premium
                          </Badge>
                        ) : b.premium_price_inr > 0 ? (
                          <Badge variant="outline" className="text-[10px] text-muted border-border">
                            ₹{b.premium_price_inr}
                          </Badge>
                        ) : null}
                      </div>

                      {b.subject && (
                        <Badge variant="outline" className="text-[10px] text-ink border-border">
                          {b.subject}
                        </Badge>
                      )}
                    </div>

                    <h3 className="font-serif font-bold text-ink text-base line-clamp-1">
                      {b.name}
                    </h3>

                    <p className="text-xs text-muted">
                      Tutor: <strong className="text-ink font-medium">{b.tutor_name}</strong>
                    </p>

                    {b.description && (
                      <p className="text-xs text-muted line-clamp-2 leading-relaxed">
                        {b.description}
                      </p>
                    )}
                  </div>

                  <div className="pt-3 border-t border-border flex items-center justify-between">
                    <span className="text-[11px] text-muted">
                      {b.item_count} {b.item_count === 1 ? "item" : "items"}
                    </span>
                    <Link
                      href={`/s/batches/${b.id}`}
                      className={buttonVariants({
                        size: "sm",
                        className: "text-xs rounded-xl font-semibold gap-1",
                      })}
                    >
                      <span>Open Batch</span>
                      <ArrowRight className="h-3 w-3" />
                    </Link>
                  </div>
                </Card>
              ))}
            </div>
          </section>
        ) : (
          /* =================================================================== */
          /* EMPTY STATE (NO BATCHES) + "FREE FOR YOU" SECTION */
          /* =================================================================== */
          <div className="space-y-8">
            <Card className="p-8 text-center bg-surface border-border">
              <div className="h-12 w-12 rounded-2xl bg-primary-soft text-primary flex items-center justify-center mx-auto mb-3">
                <Users className="h-6 w-6" />
              </div>
              <h3 className="font-serif font-bold text-ink text-xl">
                Got a code from your tutor? Enter it above.
              </h3>
              <p className="text-sm text-muted max-w-md mx-auto mt-1 mb-5 leading-relaxed">
                Enter your 6-character batch code to access your teacher&apos;s custom quizzes, study notes, and assignments.
              </p>
              <Link
                href="/s/library"
                className={buttonVariants({
                  variant: "outline",
                  className: "text-xs font-semibold rounded-xl gap-1.5",
                })}
              >
                <BookOpen className="h-3.5 w-3.5" /> Explore Public Library
              </Link>
            </Card>

            {/* Free for you section (First 6 items matched to grade/subjects) */}
            {freeForYouItems.length > 0 && (
              <section className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h2 className="font-serif text-xl font-bold text-ink">
                      Free for You
                    </h2>
                    <p className="text-xs text-muted">
                      Open study materials and practice quizzes for {profile.grade || "your grade"}.
                    </p>
                  </div>
                  <Link
                    href="/s/library"
                    className="text-xs font-semibold text-primary hover:underline flex items-center gap-1"
                  >
                    <span>View all library</span>
                    <ArrowRight className="h-3 w-3" />
                  </Link>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  {freeForYouItems.map((item) => (
                    <Card
                      key={item.id}
                      className="p-5 rounded-2xl border-border bg-surface shadow-xs flex flex-col justify-between space-y-3 hover:border-primary/40 transition-all"
                    >
                      <div className="space-y-2">
                        <div className="flex items-center justify-between gap-2">
                          <Badge className="bg-primary-soft text-primary border-transparent text-[10px] font-semibold uppercase">
                            {item.type}
                          </Badge>
                          {item.subject && (
                            <Badge variant="outline" className="text-[10px] text-ink border-border">
                              {item.subject}
                            </Badge>
                          )}
                        </div>

                        <h3 className="font-serif font-bold text-ink text-base line-clamp-2">
                          {item.title}
                        </h3>

                        <p className="text-xs text-muted">
                          By <strong className="text-ink font-medium">{item.tutor_name}</strong>
                          {item.batch_name ? ` • ${item.batch_name}` : ""}
                        </p>
                      </div>

                      <div className="pt-3 border-t border-border flex items-center justify-between">
                        <Badge variant="outline" className="text-[10px] text-success border-success/30 bg-success/5 font-semibold">
                          Free
                        </Badge>
                        <Link
                          href={`/s/items/${item.id}`}
                          className={buttonVariants({
                            size: "sm",
                            variant: "outline",
                            className: "text-xs rounded-xl font-semibold gap-1",
                          })}
                        >
                          <span>Open</span>
                          <ArrowRight className="h-3 w-3" />
                        </Link>
                      </div>
                    </Card>
                  ))}
                </div>
              </section>
            )}
          </div>
        )}
      </div>
    </AppShell>
  );
}
