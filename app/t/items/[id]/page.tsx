import { notFound, redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { ItemEditor } from "@/components/tutor/item-editor";

interface PageProps {
  params: Promise<{
    id: string;
  }>;
}

export default async function EditItemPage({ params }: PageProps) {
  const { id } = await params;
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

  // Fetch item
  const { data: item } = await supabase
    .from("items")
    .select("*")
    .eq("id", id)
    .eq("tutor_id", user.id)
    .maybeSingle();

  if (!item) {
    notFound();
  }

  // If item is quiz, fetch answers from quiz_keys using admin or user client
  let quizAnswers: Record<string, number> = {};
  if (item.type === "quiz") {
    const admin = createAdminClient();
    const { data: keyRow } = await admin
      .from("quiz_keys")
      .select("answers")
      .eq("item_id", item.id)
      .maybeSingle();

    if (keyRow?.answers && typeof keyRow.answers === "object") {
      quizAnswers = keyRow.answers as Record<string, number>;
    }
  }

  // Fetch tutor's batches for the selector
  const { data: batches } = await supabase
    .from("batches")
    .select("id, name, subject, grade")
    .eq("tutor_id", user.id)
    .order("created_at", { ascending: false });

  return (
    <ItemEditor
      initialItem={{
        id: item.id,
        batch_id: item.batch_id,
        type: item.type,
        title: item.title,
        body: (item.body as Record<string, unknown>) || {},
        access: item.access,
        visibility: item.visibility,
        grade: item.grade,
        subject: item.subject,
        due_at: item.due_at,
        max_marks: item.max_marks,
        published: item.published,
      }}
      initialAnswers={quizAnswers}
      batches={batches || []}
    />
  );
}
