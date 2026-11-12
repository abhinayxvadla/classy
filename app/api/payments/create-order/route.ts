import { NextResponse } from "next/server";
import { z } from "zod";
import Razorpay from "razorpay";
import { nanoid } from "nanoid";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { PLATFORM_FEE_PERCENT } from "@/lib/config";

const createOrderSchema = z.object({
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
      .select("id, role, full_name, email, phone")
      .eq("id", user.id)
      .single();

    if (!profile || profile.role !== "student") {
      return NextResponse.json(
        { error: "Only students can unlock batch premium" },
        { status: 403 }
      );
    }

    const body = await req.json();
    const parsed = createOrderSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.issues[0]?.message || "Invalid input" },
        { status: 400 }
      );
    }

    const { batchId } = parsed.data;

    // Check batch and price
    const { data: batch, error: batchErr } = await supabase
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
    const { data: roster, error: rosterErr } = await supabase
      .from("roster")
      .select("status, premium_until")
      .eq("batch_id", batchId)
      .eq("student_id", user.id)
      .maybeSingle();

    if (rosterErr || !roster || roster.status !== "joined") {
      return NextResponse.json(
        { error: "You must be a joined member of this batch before unlocking premium" },
        { status: 403 }
      );
    }

    // Count premium items in this batch
    const { count: premiumItemsCount } = await supabase
      .from("items")
      .select("*", { count: "exact", head: true })
      .eq("batch_id", batchId)
      .eq("access", "premium")
      .eq("published", true);

    const price = batch.premium_price_inr;
    const keyId = process.env.RAZORPAY_KEY_ID || process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID;
    const keySecret = process.env.RAZORPAY_KEY_SECRET;

    // If Razorpay keys are not configured, offer simulated mode
    if (!keyId || !keySecret) {
      return NextResponse.json({
        mode: "simulated",
        batchId: batch.id,
        batchName: batch.name,
        priceInr: price,
        premiumItemsCount: premiumItemsCount ?? 0,
      });
    }

    // Razorpay keys exist: create actual Razorpay order
    const razorpay = new Razorpay({
      key_id: keyId,
      key_secret: keySecret,
    });

    const receipt = `rcpt_${nanoid(10)}`;
    const amountInPaise = price * 100;

    const order = await razorpay.orders.create({
      amount: amountInPaise,
      currency: "INR",
      receipt,
      notes: {
        batch_id: batchId,
        student_id: user.id,
      },
    });

    // Insert pending payments row
    const admin = createAdminClient();
    const commissionInr = Math.round((price * PLATFORM_FEE_PERCENT) / 100);

    await admin.from("payments").insert({
      batch_id: batchId,
      student_id: user.id,
      amount_inr: price,
      commission_inr: commissionInr,
      razorpay_order_id: order.id,
      status: "created",
    });

    return NextResponse.json({
      mode: "razorpay",
      keyId,
      orderId: order.id,
      amount: order.amount,
      currency: order.currency,
      batchId: batch.id,
      batchName: batch.name,
      priceInr: price,
      premiumItemsCount: premiumItemsCount ?? 0,
      student: {
        name: profile.full_name,
        email: profile.email,
        phone: profile.phone || "",
      },
    });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Failed to create payment order";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
