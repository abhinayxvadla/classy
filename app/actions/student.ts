"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { track } from "@/lib/track";

export interface PublicBatchInfo {
  id: string;
  name: string;
  subject: string | null;
  grade: string | null;
  description: string | null;
  premium_price_inr: number;
  tutor_name: string;
  student_count: number;
  free_item_count: number;
}

export type JoinBatchResult = {
  success?: boolean;
  error?: string;
  batchId?: string;
  status?: "joined" | "pending" | "invited" | "rejected";
};

/**
 * Fetch public batch preview details by join code (callable by anyone, even unauthenticated)
 */
export async function getBatchPublicAction(
  code: string
): Promise<{ data?: PublicBatchInfo | null; error?: string }> {
  const cleanCode = code.trim().toUpperCase();
  if (cleanCode.length !== 6) {
    return { data: null };
  }

  const supabase = await createClient();
  const { data, error } = await supabase.rpc("get_batch_public", {
    p_code: cleanCode,
  });

  if (error) {
    return { error: error.message };
  }

  if (!data || typeof data !== "object" || !(data as { id?: string }).id) {
    return { data: null };
  }

  return { data: data as unknown as PublicBatchInfo };
}

/**
 * Join a batch using a 6-character join code
 * For logged in students only
 */
export async function joinBatchByCodeAction(
  code: string
): Promise<JoinBatchResult> {
  const cleanCode = code.trim().toUpperCase();
  if (cleanCode.length !== 6) {
    return { error: "Join code must be 6 characters." };
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { error: "Please sign in as a student to join this batch." };
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .single();

  if (!profile || profile.role !== "student") {
    return { error: "Only students can join batches." };
  }

  const { data, error } = await supabase.rpc("join_batch_by_code", {
    p_code: cleanCode,
  });

  if (error) {
    return { error: error.message };
  }

  const res = data as { batch_id: string; status: "joined" | "pending" };

  revalidatePath("/s");
  revalidatePath(`/s/batches/${res.batch_id}`);
  revalidatePath(`/join/${cleanCode}`);

  track({
    event: res.status === "joined" ? "batch_joined" : "join_pending",
    source: "app",
    actorId: user.id,
    actorRole: "student",
    batchId: res.batch_id,
  });

  return {
    success: true,
    batchId: res.batch_id,
    status: res.status,
  };
}

/**
 * Request to join a batch from a public library item
 * For logged in students only
 */
export async function requestJoinAction(
  batchId: string
): Promise<JoinBatchResult> {
  if (!batchId) {
    return { error: "Batch ID is required." };
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { error: "Please sign in as a student to request to join." };
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .single();

  if (!profile || profile.role !== "student") {
    return { error: "Only students can request to join batches." };
  }

  const { data, error } = await supabase.rpc("request_join", {
    p_batch_id: batchId,
  });

  if (error) {
    return { error: error.message };
  }

  const res = data as { batch_id: string; status: "joined" | "pending" };

  revalidatePath("/s");
  revalidatePath(`/s/batches/${batchId}`);

  track({
    event: "join_pending",
    source: "app",
    actorId: user.id,
    actorRole: "student",
    batchId,
  });

  return {
    success: true,
    batchId: res.batch_id,
    status: res.status,
  };
}

export interface QuizSubmissionResult {
  attempt_id: string;
  score: number;
  total: number;
  results: Array<{
    id: string;
    is_correct: boolean;
    student_option_index: number;
    correct_option_index: number;
    marks_awarded: number;
    max_marks: number;
    explanation?: string | null;
  }>;
}

/**
 * Submit answers for a quiz
 */
export async function submitQuizAction(
  itemId: string,
  answers: Record<string, number>
): Promise<{ success?: boolean; data?: QuizSubmissionResult; error?: string }> {
  if (!itemId) {
    return { error: "Quiz item ID is required." };
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { error: "Please sign in to submit your quiz." };
  }

  const { data, error } = await supabase.rpc("submit_quiz", {
    p_item_id: itemId,
    p_answers: answers,
  });

  if (error) {
    return { error: error.message };
  }

  revalidatePath("/s");
  revalidatePath(`/s/items/${itemId}`);

  const quizData = data as unknown as QuizSubmissionResult;
  const scorePct =
    quizData?.total && quizData.total > 0
      ? Math.round((quizData.score / quizData.total) * 100)
      : 0;

  track({
    event: "quiz_submitted",
    source: "app",
    actorId: user.id,
    actorRole: "student",
    itemId,
    meta: { score_pct: scorePct },
  });

  return {
    success: true,
    data: quizData,
  };
}

/**
 * Submit assignment text and/or link
 */
export async function submitAssignmentAction(
  itemId: string,
  textAnswer?: string | null,
  linkUrl?: string | null
): Promise<{ success?: boolean; error?: string; submissionId?: string }> {
  if (!itemId) {
    return { error: "Assignment item ID is required." };
  }

  const cleanText = textAnswer?.trim() || null;
  const cleanLink = linkUrl?.trim() || null;

  if (!cleanText && !cleanLink) {
    return { error: "Please provide either a text response or a link URL." };
  }

  if (cleanLink) {
    try {
      new URL(cleanLink);
    } catch {
      return { error: "Please provide a valid URL for your submission link." };
    }
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { error: "Please sign in to submit your assignment." };
  }

  const { data, error } = await supabase.rpc("submit_assignment", {
    p_item_id: itemId,
    p_text: cleanText || "",
    p_link: cleanLink || "",
  });

  if (error) {
    return { error: error.message };
  }

  const res = data as { submission_id?: string };

  revalidatePath("/s");
  revalidatePath(`/s/items/${itemId}`);

  track({
    event: "assignment_submitted",
    source: "app",
    actorId: user.id,
    actorRole: "student",
    itemId,
  });

  return {
    success: true,
    submissionId: res?.submission_id,
  };
}

/**
 * Update student profile info
 */
export async function updateStudentProfileAction(params: {
  fullName: string;
  phone?: string | null;
  grade?: string | null;
  subjects?: string[];
}): Promise<{ success?: boolean; error?: string }> {
  const { fullName, phone, grade, subjects } = params;

  if (!fullName || fullName.trim().length < 2) {
    return { error: "Full name must be at least 2 characters." };
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { error: "Not authenticated" };
  }

  const { error } = await supabase
    .from("profiles")
    .update({
      full_name: fullName.trim(),
      phone: phone?.trim() || null,
      grade: grade || null,
      subjects: subjects || [],
    })
    .eq("id", user.id);

  if (error) {
    return { error: error.message };
  }

  revalidatePath("/s");
  revalidatePath("/s/profile");

  return { success: true };
}

/**
 * Change student password with verification of current password
 */
export async function changeStudentPasswordAction(params: {
  currentPassword: string;
  newPassword: string;
}): Promise<{ success?: boolean; error?: string }> {
  const { currentPassword, newPassword } = params;

  if (!currentPassword) {
    return { error: "Current password is required." };
  }

  if (!newPassword || newPassword.length < 8) {
    return { error: "New password must be at least 8 characters long." };
  }

  if (!/[a-zA-Z]/.test(newPassword) || !/[0-9]/.test(newPassword)) {
    return { error: "New password must contain at least one letter and one number." };
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user || !user.email) {
    return { error: "Not authenticated" };
  }

  // Verify current password by signing in
  const { error: signInError } = await supabase.auth.signInWithPassword({
    email: user.email,
    password: currentPassword,
  });

  if (signInError) {
    return { error: "Current password is incorrect." };
  }

  // Update password
  const { error: updateError } = await supabase.auth.updateUser({
    password: newPassword,
  });

  if (updateError) {
    return { error: updateError.message };
  }

  return { success: true };
}
