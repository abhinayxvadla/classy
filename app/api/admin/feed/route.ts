import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { isUserAdmin } from "@/lib/config";

export async function GET() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user || !isUserAdmin(user.email)) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  const admin = createAdminClient();
  const { data: events, error } = await admin
    .from("events")
    .select("*")
    .order("created_at", { ascending: false })
    .limit(50);

  if (error || !events) {
    return NextResponse.json({ events: [] });
  }

  const actorIds = Array.from(
    new Set(events.map((e) => e.actor_id).filter(Boolean))
  ) as string[];
  const batchIds = Array.from(
    new Set(events.map((e) => e.batch_id).filter(Boolean))
  ) as string[];

  const [{ data: profiles }, { data: batches }] = await Promise.all([
    actorIds.length > 0
      ? admin.from("profiles").select("id, full_name").in("id", actorIds)
      : Promise.resolve({ data: [] }),
    batchIds.length > 0
      ? admin.from("batches").select("id, name").in("id", batchIds)
      : Promise.resolve({ data: [] }),
  ]);

  const profileMap = new Map((profiles || []).map((p) => [p.id, p.full_name]));
  const batchMap = new Map((batches || []).map((b) => [b.id, b.name]));

  const enriched = events.map((e) => ({
    ...e,
    actor_name: e.actor_id ? profileMap.get(e.actor_id) : undefined,
    batch_name: e.batch_id ? batchMap.get(e.batch_id) : undefined,
  }));

  return NextResponse.json({ events: enriched });
}
