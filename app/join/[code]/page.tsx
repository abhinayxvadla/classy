import { createClient } from "@/lib/supabase/server";
import { JoinPageClient } from "@/components/batch/join-page-client";
import type { PublicBatchInfo } from "@/app/actions/student";
import type { RosterStatus } from "@/lib/database.types";

interface PageProps {
  params: Promise<{
    code: string;
  }>;
}

export default async function JoinBatchPage({ params }: PageProps) {
  const { code } = await params;
  const cleanCode = (code || "").trim().toUpperCase();

  const supabase = await createClient();

  // 1. Fetch public batch info via get_batch_public RPC
  let batchData: PublicBatchInfo | null = null;
  if (cleanCode.length === 6) {
    const { data: batchRes } = await supabase.rpc("get_batch_public", {
      p_code: cleanCode,
    });
    if (batchRes && typeof batchRes === "object" && (batchRes as { id?: string }).id) {
      batchData = batchRes as unknown as PublicBatchInfo;
    }
  }

  // 2. Check current authenticated user and profile
  const {
    data: { user },
  } = await supabase.auth.getUser();

  let userRole: "student" | "tutor" | null = null;
  let membershipStatus: RosterStatus | null = null;

  if (user) {
    const { data: profile } = await supabase
      .from("profiles")
      .select("role")
      .eq("id", user.id)
      .maybeSingle();

    if (profile) {
      userRole = profile.role as "student" | "tutor";

      // If user is a student and the batch exists, check existing roster status
      if (userRole === "student" && batchData?.id) {
        const { data: rosterRow } = await supabase
          .from("roster")
          .select("status")
          .eq("batch_id", batchData.id)
          .eq("student_id", user.id)
          .maybeSingle();

        if (rosterRow) {
          membershipStatus = rosterRow.status as RosterStatus;
        }
      }
    }
  }

  const appUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";

  return (
    <JoinPageClient
      code={cleanCode}
      batch={batchData}
      userRole={userRole}
      currentMembershipStatus={membershipStatus}
      appUrl={appUrl}
    />
  );
}
