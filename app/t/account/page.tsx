import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { AppShell } from "@/components/layout/app-shell";
import { TutorAccountClient } from "@/components/tutor/tutor-account-client";

export default async function TutorAccountPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/tutor/login");
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("id, email, full_name, phone, institute, subjects, created_at, role")
    .eq("id", user.id)
    .single();

  if (!profile || profile.role !== "tutor") {
    redirect("/student/login");
  }

  return (
    <AppShell
      role="tutor"
      userName={profile.full_name}
      userEmail={profile.email}
      subtitle={profile.institute || "Account Settings"}
    >
      <TutorAccountClient
        profile={{
          id: profile.id,
          email: profile.email,
          full_name: profile.full_name,
          phone: profile.phone,
          institute: profile.institute,
          subjects: profile.subjects,
          created_at: profile.created_at,
        }}
      />
    </AppShell>
  );
}
