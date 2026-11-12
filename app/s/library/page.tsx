import { redirect } from "next/navigation";
import { Sparkles } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { FloatingNav } from "@/components/nav/floating-nav";
import { Badge } from "@/components/ui/badge";
import type { RosterStatus } from "@/lib/database.types";
import { PublicLibraryClient, type PublicLibraryItem } from "@/components/student/public-library-client";

export default async function StudentLibraryPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/student/login?next=/s/library");
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("id, role, full_name, email, grade, subjects")
    .eq("id", user.id)
    .single();

  if (!profile || profile.role !== "student") {
    redirect("/t");
  }

  // Fetch items via get_public_library RPC
  const { data: libraryData } = await supabase.rpc("get_public_library");
  const rawItems: PublicLibraryItem[] = Array.isArray(libraryData)
    ? (libraryData as unknown as PublicLibraryItem[])
    : [];

  // Also fetch student's roster statuses for pending/joined flags
  const { data: rosterRows } = await supabase
    .from("roster")
    .select("batch_id, status")
    .eq("student_id", user.id);

  const statusMap = new Map<string, string>();
  rosterRows?.forEach((r) => {
    statusMap.set(r.batch_id, r.status);
  });

  const items: PublicLibraryItem[] = rawItems.map((item) => ({
    ...item,
    roster_status: item.batch_id ? ((statusMap.get(item.batch_id) as RosterStatus) || null) : null,
  }));

  return (
    <div className="min-h-screen bg-bg text-ink flex flex-col justify-between">
      <FloatingNav
        role="student"
        userName={profile.full_name}
        userEmail={profile.email}
      />

      <main className="flex-1 w-full max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 pt-24 md:pt-[104px] pb-[calc(96px+env(safe-area-inset-bottom))] space-y-8">
        {/* Header */}
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <Badge className="bg-primary-soft text-primary font-medium text-xs px-2.5 py-1">
              <Sparkles className="h-3.5 w-3.5 mr-1 text-accent" /> Public Library
            </Badge>
            {profile.grade && (
              <Badge variant="outline" className="text-xs border-border text-muted">
                {profile.grade}
              </Badge>
            )}
          </div>
          <h1 className="font-serif text-3xl sm:text-4xl font-bold tracking-tight text-ink">
            Free Study Materials & Practice Quizzes
          </h1>
          <p className="text-sm text-muted max-w-2xl leading-relaxed">
            Open resources published by tutors across Classy. Practice with instant quizzes, read detailed notes, or request to join any tutor&apos;s batch.
          </p>
        </div>

        <PublicLibraryClient items={items} userGrade={profile.grade} />
      </main>
    </div>
  );
}
