"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import type { Database, ItemType, ItemAccess, ItemVisibility, RosterStatus } from "@/lib/database.types";
import { normalizeIndianPhone } from "@/lib/auth/utils";
import { track } from "@/lib/track";

// Helper: Ensure the caller is authenticated and is a tutor
async function getAuthenticatedTutor() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    throw new Error("Unauthorized: Please sign in");
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("id, role, full_name, email")
    .eq("id", user.id)
    .single();

  if (!profile || profile.role !== "tutor") {
    throw new Error("Forbidden: Tutor role required");
  }

  return { supabase, user, profile };
}

// ---------------------------------------------------------------------------
// BATCH ACTIONS
// ---------------------------------------------------------------------------

export async function createBatchAction(data: {
  name: string;
  subject?: string;
  grade?: string;
  description?: string;
  premium_price_inr?: number;
}) {
  const { supabase, user } = await getAuthenticatedTutor();

  if (!data.name || data.name.trim().length === 0) {
    return { error: "Batch name is required" };
  }

  const { data: batch, error } = await supabase
    .from("batches")
    .insert({
      tutor_id: user.id,
      name: data.name.trim(),
      subject: data.subject?.trim() || null,
      grade: data.grade?.trim() || null,
      description: data.description?.trim() || null,
      premium_price_inr: Math.max(0, Number(data.premium_price_inr) || 0),
    })
    .select()
    .single();

  if (error) {
    return { error: error.message };
  }

  revalidatePath("/t");
  revalidatePath("/t/batches");
  track({
    event: "batch_created",
    source: "app",
    actorId: user.id,
    actorRole: "tutor",
    batchId: batch.id,
  });
  return { success: true, batch };
}

export async function updateBatchAction(
  batchId: string,
  data: {
    name?: string;
    subject?: string;
    grade?: string;
    description?: string;
    premium_price_inr?: number;
  }
) {
  const { supabase, user } = await getAuthenticatedTutor();

  const updatePayload: Database["public"]["Tables"]["batches"]["Update"] = {};
  if (data.name !== undefined) updatePayload.name = data.name.trim();
  if (data.subject !== undefined) updatePayload.subject = data.subject.trim() || null;
  if (data.grade !== undefined) updatePayload.grade = data.grade.trim() || null;
  if (data.description !== undefined) updatePayload.description = data.description.trim() || null;
  if (data.premium_price_inr !== undefined) {
    updatePayload.premium_price_inr = Math.max(0, Number(data.premium_price_inr) || 0);
  }

  const { error } = await supabase
    .from("batches")
    .update(updatePayload)
    .eq("id", batchId)
    .eq("tutor_id", user.id);

  if (error) {
    return { error: error.message };
  }

  revalidatePath(`/t/batches/${batchId}`);
  revalidatePath("/t/batches");
  revalidatePath("/t");
  return { success: true };
}

export async function regenerateJoinCodeAction(batchId: string) {
  const { supabase, user } = await getAuthenticatedTutor();

  // Call the database function to generate a unique 6-character code
  const { data: codeData, error: codeErr } = await supabase.rpc("generate_join_code");
  if (codeErr || !codeData) {
    return { error: "Failed to generate new join code" };
  }

  const { error } = await supabase
    .from("batches")
    .update({ join_code: codeData })
    .eq("id", batchId)
    .eq("tutor_id", user.id);

  if (error) {
    return { error: error.message };
  }

  revalidatePath(`/t/batches/${batchId}`);
  return { success: true, newCode: codeData };
}

export async function deleteBatchAction(batchId: string) {
  const { supabase, user } = await getAuthenticatedTutor();

  const { error } = await supabase
    .from("batches")
    .delete()
    .eq("id", batchId)
    .eq("tutor_id", user.id);

  if (error) {
    return { error: error.message };
  }

  revalidatePath("/t");
  revalidatePath("/t/batches");
  return { success: true };
}

// ---------------------------------------------------------------------------
// ROSTER & STUDENT ACTIONS
// ---------------------------------------------------------------------------

export async function addStudentToRosterAction(
  batchId: string,
  data: {
    fullName: string;
    email?: string;
    phone?: string;
  }
) {
  const { supabase, user } = await getAuthenticatedTutor();

  if (!data.fullName || data.fullName.trim().length === 0) {
    return { error: "Student full name is required" };
  }

  // Verify tutor owns batch
  const { data: batch } = await supabase
    .from("batches")
    .select("id")
    .eq("id", batchId)
    .eq("tutor_id", user.id)
    .single();

  if (!batch) {
    return { error: "Batch not found or unauthorized" };
  }

  const normalizedEmail = data.email?.trim().toLowerCase() || null;
  const normalizedPhone = data.phone ? normalizeIndianPhone(data.phone) : null;

  // Check if an existing profile matches this student by email or phone
  let studentId: string | null = null;
  if (normalizedEmail || normalizedPhone) {
    const admin = createAdminClient();
    const query = admin.from("profiles").select("id").eq("role", "student");
    if (normalizedEmail) {
      const { data: match } = await query.eq("email", normalizedEmail).maybeSingle();
      if (match) studentId = match.id;
    }
    if (!studentId && normalizedPhone) {
      const { data: match } = await admin
        .from("profiles")
        .select("id")
        .eq("role", "student")
        .eq("phone", normalizedPhone)
        .maybeSingle();
      if (match) studentId = match.id;
    }
  }

  const { data: rosterRow, error } = await supabase
    .from("roster")
    .insert({
      batch_id: batchId,
      full_name: data.fullName.trim(),
      email: normalizedEmail,
      phone: normalizedPhone,
      status: studentId ? "joined" : "invited",
      student_id: studentId,
      joined_at: studentId ? new Date().toISOString() : null,
    })
    .select()
    .single();

  if (error) {
    if (error.message.includes("unique") || error.code === "23505") {
      return { error: "A student with this account is already in this batch" };
    }
    return { error: error.message };
  }

  revalidatePath(`/t/batches/${batchId}`);
  track({
    event: "students_added",
    source: "app",
    actorId: user.id,
    actorRole: "tutor",
    batchId,
    meta: { count: 1 },
  });
  return { success: true, rosterRow };
}

export async function bulkAddStudentsAction(
  batchId: string,
  rawText: string
) {
  const { supabase, user } = await getAuthenticatedTutor();

  // Verify batch ownership
  const { data: batch } = await supabase
    .from("batches")
    .select("id")
    .eq("id", batchId)
    .eq("tutor_id", user.id)
    .single();

  if (!batch) {
    return { error: "Batch not found or unauthorized" };
  }

  // Parse lines: "Name, email, phone" or CSV format
  const lines = rawText.split("\n").map((l) => l.trim()).filter((l) => l.length > 0);
  if (lines.length === 0) {
    return { error: "No student entries provided" };
  }

  // Fetch current roster to deduplicate
  const { data: currentRoster } = await supabase
    .from("roster")
    .select("email, phone")
    .eq("batch_id", batchId);

  const existingEmails = new Set(
    currentRoster?.map((r) => r.email?.toLowerCase()).filter(Boolean)
  );
  const existingPhones = new Set(
    currentRoster?.map((r) => r.phone).filter(Boolean)
  );

  const admin = createAdminClient();
  const addedRows: Array<{
    batch_id: string;
    full_name: string;
    email: string | null;
    phone: string | null;
    status: RosterStatus;
    student_id: string | null;
    joined_at: string | null;
  }> = [];

  let skippedCount = 0;

  for (const line of lines) {
    // Split by comma
    const parts = line.split(",").map((p) => p.trim());
    const fullName = parts[0];
    const email = parts[1]?.toLowerCase() || null;
    const phone = parts[2] ? normalizeIndianPhone(parts[2]) : null;

    if (!fullName) continue;

    // Deduplicate against existing roster
    if (email && existingEmails.has(email)) {
      skippedCount++;
      continue;
    }
    if (phone && existingPhones.has(phone)) {
      skippedCount++;
      continue;
    }

    // Try finding matching student profile
    let studentId: string | null = null;
    if (email) {
      const { data: match } = await admin
        .from("profiles")
        .select("id")
        .eq("role", "student")
        .eq("email", email)
        .maybeSingle();
      if (match) studentId = match.id;
    }
    if (!studentId && phone) {
      const { data: match } = await admin
        .from("profiles")
        .select("id")
        .eq("role", "student")
        .eq("phone", phone)
        .maybeSingle();
      if (match) studentId = match.id;
    }

    addedRows.push({
      batch_id: batchId,
      full_name: fullName,
      email,
      phone,
      status: studentId ? "joined" : "invited",
      student_id: studentId,
      joined_at: studentId ? new Date().toISOString() : null,
    });

    if (email) existingEmails.add(email);
    if (phone) existingPhones.add(phone);
  }

  if (addedRows.length === 0) {
    return {
      success: true,
      added: 0,
      skipped: skippedCount,
      message: `All ${skippedCount} entries already exist in this batch.`,
    };
  }

  const { error: insertErr } = await supabase.from("roster").insert(addedRows);
  if (insertErr) {
    return { error: insertErr.message };
  }

  revalidatePath(`/t/batches/${batchId}`);
  track({
    event: "students_added",
    source: "app",
    actorId: user.id,
    actorRole: "tutor",
    batchId,
    meta: { count: addedRows.length },
  });
  return {
    success: true,
    added: addedRows.length,
    skipped: skippedCount,
  };
}

export async function updateRosterStatusAction(
  rosterId: string,
  newStatus: RosterStatus
) {
  const { supabase, user } = await getAuthenticatedTutor();

  // Verify tutor owns the batch containing this roster row
  const { data: row } = await supabase
    .from("roster")
    .select(`
      id,
      batch_id,
      student_id,
      batches!inner(tutor_id)
    `)
    .eq("id", rosterId)
    .single();

  if (!row || (row.batches as unknown as { tutor_id: string })?.tutor_id !== user.id) {
    return { error: "Unauthorized or roster entry not found" };
  }

  const updateData: Database["public"]["Tables"]["roster"]["Update"] = {
    status: newStatus,
  };
  if (newStatus === "joined") {
    updateData.joined_at = new Date().toISOString();
  }

  const { error } = await supabase
    .from("roster")
    .update(updateData)
    .eq("id", rosterId);

  if (error) {
    return { error: error.message };
  }

  revalidatePath(`/t/batches/${row.batch_id}`);
  return { success: true };
}

export async function removeRosterStudentAction(rosterId: string) {
  const { supabase, user } = await getAuthenticatedTutor();

  const { data: row } = await supabase
    .from("roster")
    .select(`
      id,
      batch_id,
      batches!inner(tutor_id)
    `)
    .eq("id", rosterId)
    .single();

  if (!row || (row.batches as unknown as { tutor_id: string })?.tutor_id !== user.id) {
    return { error: "Unauthorized or roster entry not found" };
  }

  const { error } = await supabase.from("roster").delete().eq("id", rosterId);
  if (error) {
    return { error: error.message };
  }

  revalidatePath(`/t/batches/${row.batch_id}`);
  return { success: true };
}

// ---------------------------------------------------------------------------
// ITEM ACTIONS (CRUD, Duplicate, Toggle Access, Toggle Visibility)
// ---------------------------------------------------------------------------

export interface SaveItemInput {
  id?: string;
  batch_id: string | null;
  type: ItemType;
  title: string;
  body: Record<string, unknown>;
  quiz_answers?: Record<string, number>; // question_id -> correct_option_index
  access: ItemAccess;
  visibility: ItemVisibility;
  grade?: string;
  subject?: string;
  due_at?: string | null;
  max_marks?: number | null;
  published: boolean;
}

export async function saveItemAction(input: SaveItemInput) {
  const { supabase, user } = await getAuthenticatedTutor();

  if (!input.title || input.title.trim().length === 0) {
    return { error: "Item title is required" };
  }

  // Rule: Public visibility is strictly allowed only when access = free
  let safeVisibility: ItemVisibility = input.visibility;
  if (input.access === "premium") {
    safeVisibility = "batch";
  }

  if (input.id) {
    // UPDATE ITEM
    const { error: updateErr } = await supabase
      .from("items")
      .update({
        batch_id: input.batch_id,
        title: input.title.trim(),
        body: input.body as Database["public"]["Tables"]["items"]["Update"]["body"],
        access: input.access,
        visibility: safeVisibility,
        grade: input.grade?.trim() || null,
        subject: input.subject?.trim() || null,
        due_at: input.due_at || null,
        max_marks: input.max_marks ?? null,
        published: input.published,
      })
      .eq("id", input.id)
      .eq("tutor_id", user.id);

    if (updateErr) {
      return { error: updateErr.message };
    }

    // If item is quiz, update quiz_keys
    if (input.type === "quiz" && input.quiz_answers) {
      const admin = createAdminClient();
      await admin.from("quiz_keys").upsert({
        item_id: input.id,
        answers: input.quiz_answers,
      });
    }

    if (input.batch_id) revalidatePath(`/t/batches/${input.batch_id}`);
    revalidatePath("/t");
    return { success: true, itemId: input.id };
  } else {
    // CREATE ITEM
    const { data: newItem, error: createErr } = await supabase
      .from("items")
      .insert({
        batch_id: input.batch_id,
        tutor_id: user.id,
        type: input.type,
        title: input.title.trim(),
        body: input.body as Database["public"]["Tables"]["items"]["Insert"]["body"],
        access: input.access,
        visibility: safeVisibility,
        grade: input.grade?.trim() || null,
        subject: input.subject?.trim() || null,
        due_at: input.due_at || null,
        max_marks: input.max_marks ?? null,
        published: input.published,
        source: "app",
      })
      .select()
      .single();

    if (createErr || !newItem) {
      return { error: createErr?.message || "Failed to create item" };
    }

    if (input.published) {
      track({
        event: "item_published",
        source: "app",
        actorId: user.id,
        actorRole: "tutor",
        batchId: input.batch_id,
        itemId: newItem.id,
        meta: { type: input.type },
      });
    }

    // If quiz, save correct answers in quiz_keys
    if (input.type === "quiz" && input.quiz_answers) {
      const admin = createAdminClient();
      await admin.from("quiz_keys").insert({
        item_id: newItem.id,
        answers: input.quiz_answers,
      });
    }

    if (input.batch_id) revalidatePath(`/t/batches/${input.batch_id}`);
    revalidatePath("/t");
    return { success: true, itemId: newItem.id };
  }
}

export async function duplicateItemAction(itemId: string) {
  const { supabase, user } = await getAuthenticatedTutor();

  const { data: original } = await supabase
    .from("items")
    .select("*")
    .eq("id", itemId)
    .eq("tutor_id", user.id)
    .single();

  if (!original) {
    return { error: "Item not found" };
  }

  const { data: duplicated, error: dupErr } = await supabase
    .from("items")
    .insert({
      batch_id: original.batch_id,
      tutor_id: user.id,
      type: original.type,
      title: `${original.title} (Copy)`,
      body: original.body,
      access: original.access,
      visibility: original.visibility,
      grade: original.grade,
      subject: original.subject,
      due_at: original.due_at,
      max_marks: original.max_marks,
      published: false, // duplicate starts unpublished
    })
    .select()
    .single();

  if (dupErr || !duplicated) {
    return { error: dupErr?.message || "Failed to duplicate item" };
  }

  // If quiz, also duplicate quiz_keys
  if (original.type === "quiz") {
    const admin = createAdminClient();
    const { data: keyData } = await admin
      .from("quiz_keys")
      .select("answers")
      .eq("item_id", original.id)
      .maybeSingle();

    if (keyData) {
      await admin.from("quiz_keys").insert({
        item_id: duplicated.id,
        answers: keyData.answers,
      });
    }
  }

  if (original.batch_id) revalidatePath(`/t/batches/${original.batch_id}`);
  return { success: true, newItemId: duplicated.id };
}

export async function deleteItemAction(itemId: string) {
  const { supabase, user } = await getAuthenticatedTutor();

  const { data: item } = await supabase
    .from("items")
    .select("batch_id")
    .eq("id", itemId)
    .eq("tutor_id", user.id)
    .single();

  const { error } = await supabase
    .from("items")
    .delete()
    .eq("id", itemId)
    .eq("tutor_id", user.id);

  if (error) {
    return { error: error.message };
  }

  if (item?.batch_id) revalidatePath(`/t/batches/${item.batch_id}`);
  revalidatePath("/t");
  return { success: true };
}

export async function toggleItemPublishedAction(itemId: string, published: boolean) {
  const { supabase, user } = await getAuthenticatedTutor();

  const { data: item, error } = await supabase
    .from("items")
    .update({ published })
    .eq("id", itemId)
    .eq("tutor_id", user.id)
    .select("batch_id")
    .single();

  if (error) {
    return { error: error.message };
  }

  if (published) {
    track({
      event: "item_published",
      source: "app",
      actorId: user.id,
      actorRole: "tutor",
      batchId: item?.batch_id,
      itemId,
    });
  }

  if (item?.batch_id) revalidatePath(`/t/batches/${item.batch_id}`);
  return { success: true };
}

export async function toggleItemAccessAction(itemId: string, access: ItemAccess) {
  const { supabase, user } = await getAuthenticatedTutor();

  // If toggling to premium, visibility MUST be batch
  const updateData: Database["public"]["Tables"]["items"]["Update"] = { access };
  if (access === "premium") {
    updateData.visibility = "batch";
  }

  const { data: item, error } = await supabase
    .from("items")
    .update(updateData)
    .eq("id", itemId)
    .eq("tutor_id", user.id)
    .select("batch_id")
    .single();

  if (error) {
    return { error: error.message };
  }

  if (item?.batch_id) revalidatePath(`/t/batches/${item.batch_id}`);
  return { success: true };
}

export async function toggleItemVisibilityAction(itemId: string, visibility: ItemVisibility) {
  const { supabase, user } = await getAuthenticatedTutor();

  // Check current item access
  const { data: current } = await supabase
    .from("items")
    .select("access, batch_id")
    .eq("id", itemId)
    .eq("tutor_id", user.id)
    .single();

  if (!current) {
    return { error: "Item not found" };
  }

  if (visibility === "public" && current.access === "premium") {
    return { error: "Premium items cannot be made public" };
  }

  const { error } = await supabase
    .from("items")
    .update({ visibility })
    .eq("id", itemId)
    .eq("tutor_id", user.id);

  if (error) {
    return { error: error.message };
  }

  if (current.batch_id) revalidatePath(`/t/batches/${current.batch_id}`);
  return { success: true };
}

// ---------------------------------------------------------------------------
// SUBMISSIONS & GRADING ACTIONS
// ---------------------------------------------------------------------------

export async function gradeSubmissionAction(
  submissionId: string,
  marks: number,
  feedback: string | null,
  releaseNow: boolean = false
) {
  const { supabase, user } = await getAuthenticatedTutor();

  // Verify tutor owns the item for this submission
  const { data: sub } = await supabase
    .from("submissions")
    .select(`
      id,
      item_id,
      items!inner(tutor_id, batch_id, max_marks)
    `)
    .eq("id", submissionId)
    .single();

  if (
    !sub ||
    (sub.items as unknown as { tutor_id: string })?.tutor_id !== user.id
  ) {
    return { error: "Unauthorized or submission not found" };
  }

  const maxMarks = (sub.items as unknown as { max_marks: number | null })?.max_marks;
  if (maxMarks != null && marks > maxMarks) {
    return { error: `Marks cannot exceed max marks (${maxMarks})` };
  }

  const now = new Date().toISOString();
  const updateData: Database["public"]["Tables"]["submissions"]["Update"] = {
    marks,
    feedback: feedback?.trim() || null,
    status: releaseNow ? "released" : "graded",
    graded_at: now,
    released_at: releaseNow ? now : null,
  };

  const { error } = await supabase
    .from("submissions")
    .update(updateData)
    .eq("id", submissionId);

  if (error) {
    return { error: error.message };
  }

  const batchId = (sub.items as unknown as { batch_id: string | null })?.batch_id;
  if (batchId) revalidatePath(`/t/batches/${batchId}`);
  track({
    event: "submission_graded",
    source: "app",
    actorId: user.id,
    actorRole: "tutor",
    itemId: sub.item_id,
    batchId,
  });
  return { success: true };
}

export async function releaseAllGradedAction(itemId: string) {
  const { supabase, user } = await getAuthenticatedTutor();

  // Verify item ownership
  const { data: item } = await supabase
    .from("items")
    .select("id, batch_id")
    .eq("id", itemId)
    .eq("tutor_id", user.id)
    .single();

  if (!item) {
    return { error: "Item not found or unauthorized" };
  }

  const { error } = await supabase
    .from("submissions")
    .update({
      status: "released",
      released_at: new Date().toISOString(),
    })
    .eq("item_id", itemId)
    .eq("status", "graded");

  if (error) {
    return { error: error.message };
  }

  if (item.batch_id) revalidatePath(`/t/batches/${item.batch_id}`);
  return { success: true };
}

// ---------------------------------------------------------------------------
// MCP TOKEN ACTIONS
// ---------------------------------------------------------------------------

export async function generateMcpTokenAction(label: string = "My AI") {
  const { supabase, user } = await getAuthenticatedTutor();

  // Call the database function to generate a 40-character random token
  const { data: tokenCode, error: tokenErr } = await supabase.rpc("generate_mcp_token");
  if (tokenErr || !tokenCode) {
    return { error: "Failed to generate MCP token" };
  }

  const { data: tokenRow, error } = await supabase
    .from("mcp_tokens")
    .insert({
      tutor_id: user.id,
      token: tokenCode,
      label: label.trim() || "My AI",
    })
    .select()
    .single();

  if (error) {
    return { error: error.message };
  }

  revalidatePath("/t/connect");
  revalidatePath("/t");
  return { success: true, token: tokenRow };
}

export async function revokeMcpTokenAction(tokenId: string) {
  const { supabase, user } = await getAuthenticatedTutor();

  const { error } = await supabase
    .from("mcp_tokens")
    .update({ revoked_at: new Date().toISOString() })
    .eq("id", tokenId)
    .eq("tutor_id", user.id);

  if (error) {
    return { error: error.message };
  }

  revalidatePath("/t/connect");
  revalidatePath("/t");
  return { success: true };
}

// ---------------------------------------------------------------------------
// TUTOR PROFILE UPDATE
// ---------------------------------------------------------------------------

export async function updateTutorProfileAction(data: {
  fullName: string;
  phone?: string;
  institute?: string;
  subjects?: string[];
}) {
  const { supabase, user } = await getAuthenticatedTutor();

  if (!data.fullName || data.fullName.trim().length === 0) {
    return { error: "Full name is required" };
  }

  const updateData: Database["public"]["Tables"]["profiles"]["Update"] = {
    full_name: data.fullName.trim(),
    institute: data.institute?.trim() || null,
    subjects: data.subjects || [],
  };

  if (data.phone) {
    updateData.phone = normalizeIndianPhone(data.phone);
  }

  const { error } = await supabase
    .from("profiles")
    .update(updateData)
    .eq("id", user.id);

  if (error) {
    return { error: error.message };
  }

  revalidatePath("/t/account");
  revalidatePath("/t");
  return { success: true };
}
