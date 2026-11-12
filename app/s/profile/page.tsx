import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { AppShell } from "@/components/layout/app-shell";
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
    <AppShell
      role="student"
      userName={profile.full_name}
      userEmail={profile.email}
      subtitle={profile.grade ? `${profile.grade} Student` : "Profile"}
    >
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
    </AppShell>
  );
}
