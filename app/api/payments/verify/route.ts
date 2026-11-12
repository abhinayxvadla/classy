import { NextResponse } from "next/server";
import { z } from "zod";
import crypto from "crypto";
import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { recordPaidAndUnlockRoster } from "@/lib/payments/unlock";

const verifySchema = z.object({
  orderId: z.string().min(1, "Order ID is required"),
  paymentId: z.string().min(1, "Payment ID is required"),
  signature: z.string().min(1, "Signature is required"),
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

    const keySecret = process.env.RAZORPAY_KEY_SECRET;
    if (!keySecret) {
      return NextResponse.json(
        { error: "Razorpay key secret not configured on server" },
        { status: 500 }
      );
    }

    const body = await req.json();
    const parsed = verifySchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.issues[0]?.message || "Invalid input" },
        { status: 400 }
      );
    }

    const { orderId, paymentId, signature, batchId } = parsed.data;

    // Verify HMAC-SHA256 signature
    const expectedSignature = crypto
      .createHmac("sha256", keySecret)
      .update(`${orderId}|${paymentId}`)
      .digest("hex");

    if (expectedSignature !== signature) {
      return NextResponse.json(
        { error: "Invalid payment signature" },
        { status: 400 }
      );
    }

    // Fetch batch price
    const admin = createAdminClient();
    const { data: batch } = await admin
      .from("batches")
      .select("premium_price_inr")
      .eq("id", batchId)
      .single();

    const price = batch?.premium_price_inr || 0;

    // Record paid payment and unlock student roster for 30 days
    const result = await recordPaidAndUnlockRoster({
      batchId,
      studentId: user.id,
      amountInr: price,
      orderId,
      paymentId,
    });

    revalidatePath("/s");
    revalidatePath("/s/batches");
    revalidatePath(`/s/batches/${batchId}`);

    return NextResponse.json({
      success: true,
      premiumUntil: result.premiumUntil,
    });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Payment verification failed";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
