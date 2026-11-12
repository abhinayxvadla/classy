import "server-only";
import { createAdminClient } from "@/lib/supabase/admin";
import { PLATFORM_FEE_PERCENT } from "@/lib/config";

interface UnlockBatchParams {
  batchId: string;
  studentId: string;
  amountInr: number;
  orderId: string;
  paymentId: string;
}

export async function recordPaidAndUnlockRoster(params: UnlockBatchParams) {
  const { batchId, studentId, amountInr, orderId, paymentId } = params;
  const admin = createAdminClient();

  const commissionInr = Math.round((amountInr * PLATFORM_FEE_PERCENT) / 100);

  // 1. Check if a payment record with this orderId already exists
  const { data: existingPayment } = await admin
    .from("payments")
    .select("id")
    .eq("razorpay_order_id", orderId)
    .maybeSingle();

  if (existingPayment) {
    await admin
      .from("payments")
      .update({
        status: "paid",
        razorpay_payment_id: paymentId,
      })
      .eq("id", existingPayment.id);
  } else {
    await admin.from("payments").insert({
      batch_id: batchId,
      student_id: studentId,
      amount_inr: amountInr,
      commission_inr: commissionInr,
      razorpay_order_id: orderId,
      razorpay_payment_id: paymentId,
      status: "paid",
    });
  }

  // 2. Fetch student's current roster entry
  const { data: roster, error: rosterErr } = await admin
    .from("roster")
    .select("premium_until, status")
    .eq("batch_id", batchId)
    .eq("student_id", studentId)
    .maybeSingle();

  if (rosterErr || !roster) {
    throw new Error("Student is not in the roster for this batch");
  }

  // 3. Compute 30 days extension from greatest(now(), existing)
  const nowMs = Date.now();
  const existingMs = roster.premium_until ? new Date(roster.premium_until).getTime() : 0;
  const baseMs = Math.max(nowMs, existingMs);
  const newUntilIso = new Date(baseMs + 30 * 24 * 60 * 60 * 1000).toISOString();

  // 4. Update roster with new premium_until
  const { error: updateErr } = await admin
    .from("roster")
    .update({
      premium_until: newUntilIso,
      status: "joined",
    })
    .eq("batch_id", batchId)
    .eq("student_id", studentId);

  if (updateErr) {
    throw new Error(`Failed to update roster: ${updateErr.message}`);
  }

  return {
    success: true,
    premiumUntil: newUntilIso,
    amountInr,
    commissionInr,
  };
}
