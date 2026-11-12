import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { ItemEditor } from "@/components/tutor/item-editor";
import type { ItemType } from "@/lib/database.types";

interface PageProps {
  searchParams: Promise<{
    batchId?: string;
    type?: string;
  }>;
}

export default async function NewItemPage({ searchParams }: PageProps) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/tutor/login");
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .single();

  if (!profile || profile.role !== "tutor") {
    redirect("/student/login");
  }

  const resolvedParams = await searchParams;
  const defaultBatchId = resolvedParams.batchId || null;
  const rawType = resolvedParams.type;
  const validTypes: ItemType[] = ["quiz", "notes", "assignment", "announcement"];
  const defaultType: ItemType = validTypes.includes(rawType as ItemType)
    ? (rawType as ItemType)
    : "notes";

  // Fetch tutor's batches for the selector
  const { data: batches } = await supabase
    .from("batches")
    .select("id, name, subject, grade")
    .eq("tutor_id", user.id)
    .order("created_at", { ascending: false });

  return (
    <ItemEditor
      batches={batches || []}
      defaultBatchId={defaultBatchId}
      defaultType={defaultType}
    />
  );
}
