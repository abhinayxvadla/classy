import { NextResponse } from "next/server";
import { z } from "zod";
import { nanoid } from "nanoid";
import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { recordPaidAndUnlockRoster } from "@/lib/payments/unlock";

const simulatedSchema = z.object({
  batchId: z.string().uuid("Invalid batch ID"),
});

export async function POST(req: Request) {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { data: profile } = await supabase
      .from("profiles")
      .select("role")
      .eq("id", user.id)
      .single();

    if (!profile || profile.role !== "student") {
      return NextResponse.json(
        { error: "Only students can unlock batch premium" },
        { status: 403 }
      );
    }

    const body = await req.json();
    const parsed = simulatedSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.issues[0]?.message || "Invalid input" },
        { status: 400 }
      );
    }

    const { batchId } = parsed.data;

    // Fetch batch details
    const admin = createAdminClient();
    const { data: batch, error: batchErr } = await admin
      .from("batches")
      .select("id, name, premium_price_inr")
      .eq("id", batchId)
      .single();

    if (batchErr || !batch) {
      return NextResponse.json({ error: "Batch not found" }, { status: 404 });
    }

    if (!batch.premium_price_inr || batch.premium_price_inr <= 0) {
      return NextResponse.json(
        { error: "This batch has no premium tier configured" },
        { status: 400 }
      );
    }

    // Verify student is joined
    const { data: roster, error: rosterErr } = await admin
      .from("roster")
      .select("status")
      .eq("batch_id", batchId)
      .eq("student_id", user.id)
      .maybeSingle();

    if (rosterErr || !roster || roster.status !== "joined") {
      return NextResponse.json(
        { error: "You must be a joined member of this batch before unlocking premium" },
        { status: 403 }
      );
    }

    const orderId = `SIM_ORD_${nanoid(8)}`;
    const paymentId = `SIM_PAY_${nanoid(10)}`;

    const result = await recordPaidAndUnlockRoster({
      batchId,
      studentId: user.id,
      amountInr: batch.premium_price_inr,
      orderId,
      paymentId,
    });

    revalidatePath("/s");
    revalidatePath("/s/batches");
    revalidatePath(`/s/batches/${batchId}`);

    return NextResponse.json({
      success: true,
      mode: "simulated",
      premiumUntil: result.premiumUntil,
      amountInr: batch.premium_price_inr,
    });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Simulated payment failed";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
