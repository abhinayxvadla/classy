"use server";

import bcrypt from "bcryptjs";
import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import {
  tutorRegisterSchema,
  studentRegisterSchema,
  signInSchema,
  forgotPasswordStep1Schema,
  forgotPasswordStep2Schema,
  resetPasswordForcedSchema,
  resetPasswordVoluntarySchema,
} from "@/lib/validators/auth";
import {
  normalizeSecurityAnswer,
  getDecoySecurityQuestion,
  generateTemporaryPassword,
  normalizeIndianPhone,
} from "@/lib/auth/utils";
import { track } from "@/lib/track";

// Dummy bcrypt hash for constant-time comparisons when email is not found
const DUMMY_BCRYPT_HASH =
  "$2a$10$wN1j1O.F506u7Wz6kU8eEOnxN0123456789abcdefghijklmnopqrstuv";

export type AuthActionResult = {
  success?: boolean;
  error?: string;
  question?: string;
  redirectUrl?: string;
  temporaryPassword?: string;
};

/**
 * Register a Tutor
 */
export async function registerTutorAction(
  rawData: unknown
): Promise<AuthActionResult> {
  const result = tutorRegisterSchema.safeParse(rawData);
  if (!result.success) {
    return { error: result.error.issues[0]?.message || "Invalid input data" };
  }

  const {
    fullName,
    email,
    phone,
    institute,
    password,
    securityQuestion,
    securityAnswer,
    next,
  } = result.data;

  const normalizedEmail = email.trim().toLowerCase();
  const normalizedPhone = normalizeIndianPhone(phone);
  const admin = createAdminClient();

  // Check if profile with email already exists
  const { data: existingProfile } = await admin
    .from("profiles")
    .select("id")
    .eq("email", normalizedEmail)
    .maybeSingle();

  if (existingProfile) {
    return {
      error: "An account with this email already exists. Sign in instead.",
    };
  }

  // Create user with admin client (triggers handle_new_user in Postgres)
  const { data: authData, error: authError } =
    await admin.auth.admin.createUser({
      email: normalizedEmail,
      password,
      email_confirm: true,
      user_metadata: {
        role: "tutor",
        full_name: fullName.trim(),
        phone: normalizedPhone,
        institute: institute?.trim() || null,
        grade: null,
        subjects: [],
        must_change_password: false,
      },
    });

  if (authError || !authData.user) {
    if (
      authError?.message?.toLowerCase().includes("already registered") ||
      authError?.message?.toLowerCase().includes("unique constraint")
    ) {
      return {
        error: "An account with this email already exists. Sign in instead.",
      };
    }
    return { error: authError?.message || "Failed to create tutor account." };
  }

  // Store hashed security answer
  const answerHash = await bcrypt.hash(
    normalizeSecurityAnswer(securityAnswer),
    10
  );

  const { error: secError } = await admin.from("security_answers").insert({
    user_id: authData.user.id,
    question: securityQuestion,
    answer_hash: answerHash,
    failed_attempts: 0,
    locked_until: null,
  });

  if (secError) {
    // If security answer fails, cleanup created auth user
    await admin.auth.admin.deleteUser(authData.user.id);
    return { error: "Failed to save security question. Please try again." };
  }

  // Sign in on server to set session cookies
  const supabase = await createClient();
  const { error: signInError } = await supabase.auth.signInWithPassword({
    email: normalizedEmail,
    password,
  });

  if (signInError) {
    return {
      error:
        "Account created successfully, but auto sign-in failed. Please sign in.",
      redirectUrl: "/tutor/login",
    };
  }

  revalidatePath("/", "layout");
  track({
    event: "tutor_registered",
    source: "app",
    actorId: authData.user.id,
    actorRole: "tutor",
  });
  const targetUrl = next && next.startsWith("/") ? next : "/t";
  return { success: true, redirectUrl: targetUrl };
}

/**
 * Register a Student
 */
export async function registerStudentAction(
  rawData: unknown
): Promise<AuthActionResult> {
  const result = studentRegisterSchema.safeParse(rawData);
  if (!result.success) {
    return { error: result.error.issues[0]?.message || "Invalid input data" };
  }

  const {
    fullName,
    email,
    phone,
    grade,
    subjects,
    password,
    securityQuestion,
    securityAnswer,
    joinCode,
    next,
  } = result.data;

  const normalizedEmail = email.trim().toLowerCase();
  const normalizedPhone = normalizeIndianPhone(phone);
  const admin = createAdminClient();

  // Check if profile with email already exists
  const { data: existingProfile } = await admin
    .from("profiles")
    .select("id")
    .eq("email", normalizedEmail)
    .maybeSingle();

  if (existingProfile) {
    return {
      error: "An account with this email already exists. Sign in instead.",
    };
  }

  // Create student user with admin client
  const { data: authData, error: authError } =
    await admin.auth.admin.createUser({
      email: normalizedEmail,
      password,
      email_confirm: true,
      user_metadata: {
        role: "student",
        full_name: fullName.trim(),
        phone: normalizedPhone,
        institute: null,
        grade: grade.trim(),
        subjects: subjects,
        must_change_password: false,
      },
    });

  if (authError || !authData.user) {
    if (
      authError?.message?.toLowerCase().includes("already registered") ||
      authError?.message?.toLowerCase().includes("unique constraint")
    ) {
      return {
        error: "An account with this email already exists. Sign in instead.",
      };
    }
    return { error: authError?.message || "Failed to create student account." };
  }

  // Store hashed security answer
  const answerHash = await bcrypt.hash(
    normalizeSecurityAnswer(securityAnswer),
    10
  );

  const { error: secError } = await admin.from("security_answers").insert({
    user_id: authData.user.id,
    question: securityQuestion,
    answer_hash: answerHash,
    failed_attempts: 0,
    locked_until: null,
  });

  if (secError) {
    await admin.auth.admin.deleteUser(authData.user.id);
    return { error: "Failed to save security question. Please try again." };
  }

  // Sign in on server to set session cookies
  const supabase = await createClient();
  const { error: signInError } = await supabase.auth.signInWithPassword({
    email: normalizedEmail,
    password,
  });

  if (signInError) {
    return {
      error:
        "Account created successfully, but auto sign-in failed. Please sign in.",
      redirectUrl: "/student/login",
    };
  }

  // If join code is provided, automatically join the batch
  let targetUrl = "/s";
  if (joinCode && joinCode.trim().length === 6) {
    const cleanCode = joinCode.trim().toUpperCase();
    const { data: joinData, error: joinErr } = await supabase.rpc(
      "join_batch_by_code",
      { p_code: cleanCode }
    );
    if (!joinErr && joinData && typeof joinData === "object" && "batch_id" in joinData) {
      const res = joinData as { batch_id: string; status: string };
      if (res.status === "joined") {
        targetUrl = `/s/batches/${res.batch_id}?joined=true`;
      } else {
        targetUrl = `/s?pending=true&batch=${res.batch_id}`;
      }
    } else {
      targetUrl = `/join/${cleanCode}`;
    }
  } else if (next && next.startsWith("/")) {
    targetUrl = next;
  }

  revalidatePath("/", "layout");
  track({
    event: "student_registered",
    source: "app",
    actorId: authData.user.id,
    actorRole: "student",
  });
  return { success: true, redirectUrl: targetUrl };
}

/**
 * Sign In for both portals with role enforcement
 */
export async function signInAction(rawData: unknown): Promise<AuthActionResult> {
  const result = signInSchema.safeParse(rawData);
  if (!result.success) {
    return { error: result.error.issues[0]?.message || "Invalid input data" };
  }

  const { email, password, expectedRole, joinCode, next } = result.data;
  const normalizedEmail = email.trim().toLowerCase();
  const supabase = await createClient();

  const { data: authData, error: authError } =
    await supabase.auth.signInWithPassword({
      email: normalizedEmail,
      password,
    });

  if (authError || !authData.user) {
    return { error: "Invalid email or password." };
  }

  // Verify role from profile
  const { data: profile, error: profileError } = await supabase
    .from("profiles")
    .select("role, must_change_password")
    .eq("id", authData.user.id)
    .single();

  if (profileError || !profile) {
    await supabase.auth.signOut();
    return { error: "Could not find profile for this account." };
  }

  // Role portal mismatch check
  if (profile.role !== expectedRole) {
    await supabase.auth.signOut();
    const otherPortal = profile.role === "tutor" ? "tutor" : "student";
    return {
      error: `This is a ${profile.role} account. Use the ${otherPortal} login.`,
      redirectUrl: `/${otherPortal}/login`,
    };
  }

  // Forced password change check
  if (profile.must_change_password) {
    track({
      event: "login",
      source: "app",
      actorId: authData.user.id,
      actorRole: profile.role,
    });
    revalidatePath("/", "layout");
    return { success: true, redirectUrl: "/reset-password" };
  }

  // Target routing
  let targetUrl = profile.role === "tutor" ? "/t" : "/s";
  if (joinCode && profile.role === "student" && joinCode.trim().length === 6) {
    const cleanCode = joinCode.trim().toUpperCase();
    const { data: joinData, error: joinErr } = await supabase.rpc(
      "join_batch_by_code",
      { p_code: cleanCode }
    );
    if (!joinErr && joinData && typeof joinData === "object" && "batch_id" in joinData) {
      const res = joinData as { batch_id: string; status: string };
      if (res.status === "joined") {
        targetUrl = `/s/batches/${res.batch_id}?joined=true`;
      } else {
        targetUrl = `/s?pending=true&batch=${res.batch_id}`;
      }
    } else {
      targetUrl = `/join/${cleanCode}`;
    }
  } else if (next && next.startsWith("/")) {
    targetUrl = next;
  }

  revalidatePath("/", "layout");
  track({
    event: "login",
    source: "app",
    actorId: authData.user.id,
    actorRole: profile.role,
  });
  return { success: true, redirectUrl: targetUrl };
}

/**
 * Forgot Password - Step 1: Request Security Question
 */
export async function forgotPasswordStep1Action(
  rawData: unknown
): Promise<AuthActionResult> {
  const result = forgotPasswordStep1Schema.safeParse(rawData);
  if (!result.success) {
    return { error: result.error.issues[0]?.message || "Invalid email" };
  }

  const { email } = result.data;
  const normalizedEmail = email.trim().toLowerCase();
  const admin = createAdminClient();

  // Query user profile
  const { data: profile } = await admin
    .from("profiles")
    .select("id")
    .eq("email", normalizedEmail)
    .maybeSingle();

  if (!profile) {
    // Return deterministic decoy question to never leak account existence
    return {
      success: true,
      question: getDecoySecurityQuestion(normalizedEmail),
    };
  }

  // Fetch security question
  const { data: sec } = await admin
    .from("security_answers")
    .select("question, locked_until")
    .eq("user_id", profile.id)
    .maybeSingle();

  if (!sec) {
    return {
      success: true,
      question: getDecoySecurityQuestion(normalizedEmail),
    };
  }

  // Check if account is locked
  if (sec.locked_until && new Date(sec.locked_until) > new Date()) {
    const diffMs = new Date(sec.locked_until).getTime() - Date.now();
    const remainingMin = Math.max(1, Math.ceil(diffMs / (60 * 1000)));
    return {
      error: `Too many attempts. Try again in ${remainingMin} minute${
        remainingMin > 1 ? "s" : ""
      }.`,
    };
  }

  return { success: true, question: sec.question };
}

/**
 * Forgot Password - Step 2: Answer question & update password
 */
export async function forgotPasswordStep2Action(
  rawData: unknown
): Promise<AuthActionResult> {
  const result = forgotPasswordStep2Schema.safeParse(rawData);
  if (!result.success) {
    return { error: result.error.issues[0]?.message || "Invalid input data" };
  }

  const { email, securityAnswer, newPassword } = result.data;
  const normalizedEmail = email.trim().toLowerCase();
  const admin = createAdminClient();

  // Query user profile
  const { data: profile } = await admin
    .from("profiles")
    .select("id, role")
    .eq("email", normalizedEmail)
    .maybeSingle();

  if (!profile) {
    // Constant-time dummy compare to prevent timing leaks
    await bcrypt.compare(
      normalizeSecurityAnswer(securityAnswer),
      DUMMY_BCRYPT_HASH
    );
    return { error: "That answer doesn't match." };
  }

  // Fetch security answer record
  const { data: sec } = await admin
    .from("security_answers")
    .select("question, answer_hash, failed_attempts, locked_until")
    .eq("user_id", profile.id)
    .maybeSingle();

  if (!sec) {
    await bcrypt.compare(
      normalizeSecurityAnswer(securityAnswer),
      DUMMY_BCRYPT_HASH
    );
    return { error: "That answer doesn't match." };
  }

  // Check lockout
  if (sec.locked_until && new Date(sec.locked_until) > new Date()) {
    const diffMs = new Date(sec.locked_until).getTime() - Date.now();
    const remainingMin = Math.max(1, Math.ceil(diffMs / (60 * 1000)));
    return {
      error: `Too many attempts. Try again in ${remainingMin} minute${
        remainingMin > 1 ? "s" : ""
      }.`,
    };
  }

  // Verify answer
  const normalizedInputAnswer = normalizeSecurityAnswer(securityAnswer);
  const isMatch = await bcrypt.compare(normalizedInputAnswer, sec.answer_hash);

  if (!isMatch) {
    const newFailedAttempts = (sec.failed_attempts || 0) + 1;
    let lockedUntil: string | null = sec.locked_until;

    // After 5 failed attempts, lock for 1 hour
    if (newFailedAttempts >= 5) {
      lockedUntil = new Date(Date.now() + 60 * 60 * 1000).toISOString();
    }

    await admin
      .from("security_answers")
      .update({
        failed_attempts: newFailedAttempts,
        locked_until: lockedUntil,
      })
      .eq("user_id", profile.id);

    if (newFailedAttempts >= 5) {
      return {
        error: "Too many attempts. Your account has been locked for 1 hour.",
      };
    }

    return { error: "That answer doesn't match." };
  }

  // Answer is correct -> reset security lock & update password
  await admin
    .from("security_answers")
    .update({
      failed_attempts: 0,
      locked_until: null,
    })
    .eq("user_id", profile.id);

  // Update password in Supabase Auth
  const { error: updateError } = await admin.auth.admin.updateUserById(
    profile.id,
    { password: newPassword }
  );

  if (updateError) {
    return { error: "Failed to update password. Please try again." };
  }

  // Reset must_change_password flag
  await admin
    .from("profiles")
    .update({ must_change_password: false })
    .eq("id", profile.id);

  const loginPortal = profile.role === "tutor" ? "tutor" : "student";
  return {
    success: true,
    redirectUrl: `/${loginPortal}/login?message=password_updated`,
  };
}

/**
 * Forced or voluntary password change for a logged-in user
 */
export async function resetPasswordAction(
  rawData: unknown,
  isVoluntary: boolean = false
): Promise<AuthActionResult> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { error: "You must be signed in to change your password." };
  }

  let newPassword = "";

  if (isVoluntary) {
    const result = resetPasswordVoluntarySchema.safeParse(rawData);
    if (!result.success) {
      return { error: result.error.issues[0]?.message || "Invalid input data" };
    }
    // Verify current password via re-authentication
    const { error: verifyErr } = await supabase.auth.signInWithPassword({
      email: user.email!,
      password: result.data.currentPassword,
    });
    if (verifyErr) {
      return { error: "Current password is incorrect." };
    }
    newPassword = result.data.newPassword;
  } else {
    const result = resetPasswordForcedSchema.safeParse(rawData);
    if (!result.success) {
      return { error: result.error.issues[0]?.message || "Invalid input data" };
    }
    newPassword = result.data.newPassword;
  }

  // Update password
  const { error: updateErr } = await supabase.auth.updateUser({
    password: newPassword,
  });

  if (updateErr) {
    return { error: updateErr.message || "Failed to update password." };
  }

  // Update profile must_change_password = false using admin client
  const admin = createAdminClient();
  await admin
    .from("profiles")
    .update({ must_change_password: false })
    .eq("id", user.id);

  // Retrieve user role
  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .single();

  revalidatePath("/", "layout");
  return {
    success: true,
    redirectUrl: profile?.role === "tutor" ? "/t" : "/s",
  };
}

/**
 * Tutor resets a student's password
 * Verifies that the caller is a tutor and that the student is joined in one of their batches.
 */
export async function resetStudentPassword(
  studentId: string
): Promise<AuthActionResult> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { error: "Unauthorized" };
  }

  // Verify caller is a tutor
  const { data: tutorProfile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .single();

  if (!tutorProfile || tutorProfile.role !== "tutor") {
    return { error: "Only tutors can reset student passwords." };
  }

  // Verify that the student is enrolled (status = 'joined') in one of the tutor's batches
  const { data: membership } = await supabase
    .from("roster")
    .select(
      `
      id,
      batch_id,
      student_id,
      batches!inner(tutor_id)
    `
    )
    .eq("student_id", studentId)
    .eq("status", "joined")
    .eq("batches.tutor_id", user.id)
    .maybeSingle();

  if (!membership) {
    return {
      error:
        "Student is not enrolled as a joined member in any of your batches.",
    };
  }

  // Generate temporary 10-char password
  const tempPassword = generateTemporaryPassword();
  const admin = createAdminClient();

  // Update student password in Supabase Auth
  const { error: updateErr } = await admin.auth.admin.updateUserById(studentId, {
    password: tempPassword,
  });

  if (updateErr) {
    return { error: "Failed to reset student password." };
  }

  // Flag must_change_password = true
  await admin
    .from("profiles")
    .update({ must_change_password: true })
    .eq("id", studentId);

  return {
    success: true,
    temporaryPassword: tempPassword,
  };
}

/**
 * Sign out action
 */
export async function signOutAction(): Promise<{ success: boolean }> {
  const supabase = await createClient();
  await supabase.auth.signOut();
  revalidatePath("/", "layout");
  return { success: true };
}
