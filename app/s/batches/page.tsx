import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { AppShell } from "@/components/layout/app-shell";
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
    .select("role, full_name, email, grade")
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
    <AppShell
      role="student"
      userName={profile.full_name}
      userEmail={profile.email}
      subtitle={profile.grade ? `${profile.grade} Student` : "My Batches"}
    >
      <div className="space-y-8">
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
      </div>
    </AppShell>
  );
}
