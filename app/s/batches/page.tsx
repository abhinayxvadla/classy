import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { FloatingNav } from "@/components/nav/floating-nav";
import { StudentJoinBox } from "@/components/student/student-join-box";
import { StudentBatchesList, type MyBatchItem } from "@/components/student/student-batches-list";

export default async function StudentBatchesPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/student/login");
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("role, full_name, email")
    .eq("id", user.id)
    .single();

  if (!profile || profile.role !== "student") {
    redirect("/t");
  }

  const { data: batchesData } = await supabase.rpc("get_my_batches");
  const myBatches: MyBatchItem[] = Array.isArray(batchesData)
    ? (batchesData as unknown as MyBatchItem[])
    : [];

  return (
    <div className="min-h-screen bg-bg text-ink flex flex-col justify-between">
      <FloatingNav
        role="student"
        userName={profile.full_name}
        userEmail={profile.email}
      />

      <main className="flex-1 w-full max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 pt-24 md:pt-[104px] pb-[calc(96px+env(safe-area-inset-bottom))] space-y-8">
        <div>
          <h1 className="font-serif text-3xl sm:text-4xl font-bold tracking-tight text-ink">
            My Batches
          </h1>
          <p className="text-sm text-muted mt-1">
            All classes you are enrolled in or waiting to join.
          </p>
        </div>

        <StudentJoinBox />

        <StudentBatchesList batches={myBatches} />
      </main>
    </div>
  );
}
