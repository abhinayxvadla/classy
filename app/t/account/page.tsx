import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { FloatingNav } from "@/components/nav/floating-nav";
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
    <div className="min-h-screen bg-bg">
      <FloatingNav role="tutor" />

      <main className="max-w-4xl mx-auto px-4 sm:px-6 pt-24 md:pt-[104px] pb-[calc(96px+env(safe-area-inset-bottom))]">
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
      </main>
    </div>
  );
}
