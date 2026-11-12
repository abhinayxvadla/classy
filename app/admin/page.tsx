import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { isUserAdmin } from "@/lib/config";
import { AdminDashboardClient, type AdminEventRow } from "@/components/admin/admin-dashboard-client";

export const metadata = {
  title: "Founder Dashboard",
};

export default async function AdminPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  // Strict Server Check: Access ONLY for emails listed in env ADMIN_EMAILS; everyone else gets 404
  if (!user || !isUserAdmin(user.email)) {
    notFound();
  }

  const admin = createAdminClient();

  // Fetch all core datasets in parallel using service role
  const [
    { data: profiles },
    { data: batches },
    { data: items },
    { count: attemptsCount },
    { count: submissionsCount },
    { data: payments },
    { data: rawEvents },
  ] = await Promise.all([
    admin
      .from("profiles")
      .select("id, email, full_name, role, created_at, last_seen_at")
      .order("created_at", { ascending: false }),
    admin
      .from("batches")
      .select("id, tutor_id, name, created_at")
      .order("created_at", { ascending: false }),
    admin
      .from("items")
      .select("id, tutor_id, batch_id, type, source, created_at")
      .order("created_at", { ascending: false }),
    admin
      .from("attempts")
      .select("*", { count: "exact", head: true }),
    admin
      .from("submissions")
      .select("*", { count: "exact", head: true }),
    admin
      .from("payments")
      .select("id, amount_inr, commission_inr, created_at")
      .eq("status", "paid")
      .order("created_at", { ascending: false }),
    admin
      .from("events")
      .select("*")
      .order("created_at", { ascending: false })
      .limit(100),
  ]);

  const profileMap = new Map((profiles || []).map((p) => [p.id, p.full_name]));
  const batchMap = new Map((batches || []).map((b) => [b.id, b.name]));

  const initialEvents: AdminEventRow[] = (rawEvents || []).map((e) => ({
    id: e.id,
    created_at: e.created_at,
    actor_id: e.actor_id,
    actor_role: e.actor_role,
    event: e.event,
    source: e.source as "mcp" | "app",
    tool: e.tool,
    client_name: e.client_name,
    batch_id: e.batch_id,
    item_id: e.item_id,
    success: e.success,
    duration_ms: e.duration_ms,
    meta: (e.meta as Record<string, unknown>) || {},
    actor_name: e.actor_id ? profileMap.get(e.actor_id) : undefined,
    batch_name: e.batch_id ? batchMap.get(e.batch_id) : undefined,
  }));

  return (
    <AdminDashboardClient
      initialEvents={initialEvents}
      profiles={profiles || []}
      batches={batches || []}
      items={items || []}
      attemptsCount={attemptsCount || 0}
      submissionsCount={submissionsCount || 0}
      payments={payments || []}
    />
  );
}
