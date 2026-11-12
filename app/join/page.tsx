import { redirect } from "next/navigation";
import { JoinPageClient } from "@/components/batch/join-page-client";

interface PageProps {
  searchParams: Promise<{
    code?: string;
  }>;
}

export default async function JoinRootPage({ searchParams }: PageProps) {
  const { code } = await searchParams;
  const cleanCode = (code || "").trim().toUpperCase();

  if (cleanCode.length === 6) {
    redirect(`/join/${cleanCode}`);
  }

  const appUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";

  return (
    <JoinPageClient
      code=""
      batch={null}
      userRole={null}
      currentMembershipStatus={null}
      appUrl={appUrl}
    />
  );
}
