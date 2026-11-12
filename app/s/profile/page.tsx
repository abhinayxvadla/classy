import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { FloatingNav } from "@/components/nav/floating-nav";
import { StudentProfileClient } from "@/components/student/student-profile-client";

export default async function StudentProfilePage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/student/login?next=/s/profile");
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("id, email, full_name, phone, grade, subjects, created_at, role")
    .eq("id", user.id)
    .single();

  if (!profile || profile.role !== "student") {
    redirect("/t");
  }

  return (
    <div className="min-h-screen bg-bg text-ink flex flex-col justify-between">
      <FloatingNav
        role="student"
        userName={profile.full_name}
        userEmail={profile.email}
      />

      <main className="flex-1 w-full max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 pt-24 md:pt-[104px] pb-[calc(96px+env(safe-area-inset-bottom))]">
        <StudentProfileClient
          profile={{
            id: profile.id,
            email: profile.email,
            full_name: profile.full_name,
            phone: profile.phone,
            grade: profile.grade,
            subjects: profile.subjects,
            created_at: profile.created_at,
          }}
        />
      </main>
    </div>
  );
}
