import { redirect } from "next/navigation";
import Link from "next/link";
import { ShieldAlert, ArrowLeft, LogOut } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { isUserAdmin } from "@/lib/config";
import { signOutAction } from "@/app/actions/auth";
import { buttonVariants } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { AdminDashboardClient, type AdminEventRow } from "@/components/admin/admin-dashboard-client";

export const metadata = {
  title: "Founder Console | Classy",
};

interface AdminDashboardData {
  profiles: Array<{
    id: string;
    email: string | null;
    full_name: string;
    role: "tutor" | "student";
    created_at: string;
    last_seen_at: string | null;
  }>;
  batches: Array<{
    id: string;
    tutor_id: string;
    name: string;
    created_at: string;
  }>;
  items: Array<{
    id: string;
    tutor_id: string;
    batch_id: string | null;
    type: string;
    source: string;
    created_at: string;
  }>;
  attempts_count: number;
  submissions_count: number;
  payments: Array<{
    id: string;
    amount_inr: number;
    commission_inr: number;
    created_at: string;
  }>;
  events: Array<{
    id: number;
    actor_id: string | null;
    actor_role: string | null;
    event: string;
    source: string;
    tool: string | null;
    client_name: string | null;
    batch_id: string | null;
    item_id: string | null;
    success: boolean;
    duration_ms: number | null;
    meta: Record<string, unknown>;
    created_at: string;
  }>;
}

export default async function AdminPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  // If not logged in, redirect to login
  if (!user) {
    redirect("/tutor/login?next=/admin");
  }

  // Access check for founder/admin emails
  if (!isUserAdmin(user.email)) {
    return (
      <div className="min-h-screen bg-bg flex items-center justify-center p-4">
        <Card className="max-w-md w-full p-8 text-center space-y-5 rounded-3xl border-border bg-surface shadow-xs">
          <div className="h-14 w-14 rounded-2xl bg-destructive/10 text-destructive flex items-center justify-center mx-auto">
            <ShieldAlert className="h-7 w-7" />
          </div>

          <div className="space-y-1.5">
            <h1 className="font-serif text-2xl font-bold text-ink">
              Restricted Founder Area
            </h1>
            <p className="text-xs text-muted">
              Signed in as <span className="font-semibold text-ink">{user.email}</span>
            </p>
          </div>

          <p className="text-xs text-muted leading-relaxed">
            This dashboard is reserved for verified platform administrators and founders. Please sign in with your authorized admin email.
          </p>

          <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-2.5">
            <Link
              href="/t"
              className={buttonVariants({
                variant: "outline",
                className: "w-full sm:w-auto text-xs rounded-xl",
              })}
            >
              <ArrowLeft className="w-3.5 h-3.5 mr-1" />
              Return to Portal
            </Link>

            <form
              action={async () => {
                "use server";
                await signOutAction();
                redirect("/tutor/login?next=/admin");
              }}
              className="w-full sm:w-auto"
            >
              <button
                type="submit"
                className="w-full sm:w-auto px-4 py-2 text-xs font-semibold text-destructive hover:bg-destructive/10 rounded-xl transition-colors border border-destructive/20 flex items-center justify-center gap-1.5 cursor-pointer"
              >
                <LogOut className="w-3.5 h-3.5" />
                Sign In Different Email
              </button>
            </form>
          </div>
        </Card>
      </div>
    );
  }

  // Fetch dashboard data via security definer RPC
  const { data: rpcData, error: rpcError } = await supabase.rpc(
    // @ts-expect-error - get_admin_dashboard_data is defined directly in Postgres
    "get_admin_dashboard_data"
  );

  let dashboardData: AdminDashboardData = {
    profiles: [],
    batches: [],
    items: [],
    attempts_count: 0,
    submissions_count: 0,
    payments: [],
    events: [],
  };

  if (!rpcError && rpcData) {
    dashboardData = rpcData as unknown as AdminDashboardData;
  } else {
    // Fallback: direct select via supabase client
    const [
      { data: profiles },
      { data: batches },
      { data: items },
      { count: attemptsCount },
      { count: submissionsCount },
      { data: payments },
      { data: rawEvents },
    ] = await Promise.all([
      supabase
        .from("profiles")
        .select("id, email, full_name, role, created_at, last_seen_at")
        .order("created_at", { ascending: false }),
      supabase
        .from("batches")
        .select("id, tutor_id, name, created_at")
        .order("created_at", { ascending: false }),
      supabase
        .from("items")
        .select("id, tutor_id, batch_id, type, source, created_at")
        .order("created_at", { ascending: false }),
      supabase
        .from("attempts")
        .select("*", { count: "exact", head: true }),
      supabase
        .from("submissions")
        .select("*", { count: "exact", head: true }),
      supabase
        .from("payments")
        .select("id, amount_inr, commission_inr, created_at")
        .eq("status", "paid")
        .order("created_at", { ascending: false }),
      supabase
        .from("events")
        .select("*")
        .order("created_at", { ascending: false })
        .limit(100),
    ]);

    dashboardData = {
      profiles: (profiles || []) as AdminDashboardData["profiles"],
      batches: (batches || []) as AdminDashboardData["batches"],
      items: (items || []) as AdminDashboardData["items"],
      attempts_count: attemptsCount || 0,
      submissions_count: submissionsCount || 0,
      payments: (payments || []) as AdminDashboardData["payments"],
      events: (rawEvents || []) as AdminDashboardData["events"],
    };
  }

  const profileMap = new Map(dashboardData.profiles.map((p) => [p.id, p.full_name]));
  const batchMap = new Map(dashboardData.batches.map((b) => [b.id, b.name]));

  const initialEvents: AdminEventRow[] = dashboardData.events.map((e) => ({
    id: e.id,
    created_at: e.created_at,
    actor_id: e.actor_id || null,
    actor_role: e.actor_role || null,
    event: e.event,
    source: (e.source as "mcp" | "app") || "app",
    tool: e.tool || null,
    client_name: e.client_name || null,
    batch_id: e.batch_id || null,
    item_id: e.item_id || null,
    success: e.success,
    duration_ms: e.duration_ms || null,
    meta: (e.meta as Record<string, unknown>) || {},
    actor_name: e.actor_id ? profileMap.get(e.actor_id) : undefined,
    batch_name: e.batch_id ? batchMap.get(e.batch_id) : undefined,
  }));

  const mappedProfiles = dashboardData.profiles.map((p) => ({
    ...p,
    email: p.email || "",
  }));

  return (
    <AdminDashboardClient
      initialEvents={initialEvents}
      profiles={mappedProfiles}
      batches={dashboardData.batches}
      items={dashboardData.items as never[]}
      attemptsCount={dashboardData.attempts_count}
      submissionsCount={dashboardData.submissions_count}
      payments={dashboardData.payments}
    />
  );
}
