import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { AppShell } from "@/components/layout/app-shell";
import { ConnectMcpClient } from "@/components/tutor/connect-mcp-client";

export default async function TutorConnectPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/tutor/login");
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("role, full_name, email")
    .eq("id", user.id)
    .single();

  if (!profile || profile.role !== "tutor") {
    redirect("/student/login");
  }

  // Fetch MCP tokens
  const { data: tokens } = await supabase
    .from("mcp_tokens")
    .select("id, label, token, created_at, last_used_at, revoked_at")
    .eq("tutor_id", user.id)
    .order("created_at", { ascending: false });

  const appUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";

  return (
    <AppShell
      role="tutor"
      userName={profile.full_name}
      userEmail={profile.email}
    >
      <ConnectMcpClient tokens={tokens || []} appUrl={appUrl} />
    </AppShell>
  );
}
