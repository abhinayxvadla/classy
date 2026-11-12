import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { FloatingNav } from "@/components/nav/floating-nav";
import { BatchesListClient, type BatchListItem } from "@/components/tutor/batches-list-client";

export default async function TutorBatchesPage() {
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

  const { data: batches } = await supabase
    .from("batches")
    .select(`
      id,
      name,
      subject,
      grade,
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

  const batchList: BatchListItem[] = (batches || []).map((b) => {
    const roster = b.roster || [];
    const joined = roster.filter((r) => r.status === "joined").length;
    const pending = roster.filter((r) => r.status === "pending").length;
    const itemCount = b.items?.length || 0;

    return {
      id: b.id,
      name: b.name,
      subject: b.subject,
      grade: b.grade,
      joinCode: b.join_code,
      premiumPriceInr: b.premium_price_inr,
      joinedCount: joined,
      pendingCount: pending,
      itemCount,
    };
  });

  return (
    <div className="min-h-screen bg-bg text-ink flex flex-col justify-between selection:bg-primary-soft selection:text-primary">
      <FloatingNav
        role="tutor"
        userName={profile.full_name}
        userEmail={profile.email}
      />

      <main className="flex-1 w-full max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 pt-8 pb-20">
        <div className="mb-6">
          <h1 className="font-serif text-3xl font-bold tracking-tight text-ink">
            All Batches
          </h1>
          <p className="text-xs sm:text-sm text-muted mt-1">
            Browse, search, and manage all your teaching classrooms in one place.
          </p>
        </div>

        <BatchesListClient batches={batchList} />
      </main>
    </div>
  );
}
