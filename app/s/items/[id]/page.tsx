import { notFound, redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { ItemViewClient, type StudentItemViewData } from "@/components/student/item-view-client";

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function StudentItemPage({ params }: PageProps) {
  const { id: itemId } = await params;
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect(`/student/login?next=/s/items/${itemId}`);
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("role, full_name, email")
    .eq("id", user.id)
    .single();

  if (!profile || profile.role !== "student") {
    redirect("/t");
  }

  // Fetch item details via get_item_for_student RPC
  const { data: itemData, error: itemError } = await supabase.rpc(
    "get_item_for_student",
    { p_item_id: itemId }
  );

  if (itemError || !itemData) {
    // If RPC denied access (e.g. premium locked without purchase), check if the item exists in the batch
    const { data: rawItem } = await supabase
      .from("items")
      .select(`
        id,
        batch_id,
        tutor_id,
        type,
        title,
        access,
        visibility,
        grade,
        subject,
        due_at,
        max_marks,
        created_at,
        batches (
          name
        )
      `)
      .eq("id", itemId)
      .maybeSingle();

    if (rawItem && rawItem.access === "premium") {
      const batchName =
        (rawItem.batches as unknown as { name?: string } | null)?.name || undefined;

      const lockedItem: StudentItemViewData = {
        id: rawItem.id,
        batch_id: rawItem.batch_id,
        tutor_id: rawItem.tutor_id,
        batch_name: batchName,
        type: rawItem.type,
        title: rawItem.title,
        body: null,
        access: "premium",
        visibility: rawItem.visibility,
        grade: rawItem.grade,
        subject: rawItem.subject,
        due_at: rawItem.due_at,
        max_marks: rawItem.max_marks,
        created_at: rawItem.created_at,
        locked: true,
      };

      return (
        <ItemViewClient
          item={lockedItem}
          userName={profile.full_name}
          userEmail={profile.email}
        />
      );
    }

    notFound();
  }

  const raw = itemData as unknown as StudentItemViewData;

  // Augment with batch name and tutor name if needed
  let batchName = raw.batch_name;
  let tutorName = raw.tutor_name;

  if (raw.batch_id && (!batchName || !tutorName)) {
    const { data: batch } = await supabase
      .from("batches")
      .select(`
        name,
        profiles:tutor_id (
          full_name
        )
      `)
      .eq("id", raw.batch_id)
      .maybeSingle();

    if (batch) {
      batchName = batch.name;
      tutorName =
        (batch.profiles as unknown as { full_name?: string } | null)?.full_name ||
        tutorName;
    }
  }

  const item: StudentItemViewData = {
    ...raw,
    batch_name: batchName,
    tutor_name: tutorName,
  };

  return (
    <ItemViewClient
      item={item}
      userName={profile.full_name}
      userEmail={profile.email}
    />
  );
}
