"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import {
  Crown,
  CheckCircle2,
  ShieldCheck,
  CreditCard,
  Loader2,
  FlaskConical,
} from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

interface RazorpayResponse {
  razorpay_order_id: string;
  razorpay_payment_id: string;
  razorpay_signature: string;
}

interface UnlockPremiumDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  batchId: string;
  batchName: string;
  priceInr: number;
  premiumItemsCount?: number;
  onSuccess?: (newUntil: string) => void;
}

// Helper to dynamically load Razorpay checkout script
function loadRazorpayScript(): Promise<boolean> {
  return new Promise((resolve) => {
    if (typeof window === "undefined") {
      resolve(false);
      return;
    }
    if ((window as unknown as { Razorpay?: unknown }).Razorpay) {
      resolve(true);
      return;
    }

    const script = document.createElement("script");
    script.src = "https://checkout.razorpay.com/v1/checkout.js";
    script.async = true;
    script.onload = () => resolve(true);
    script.onerror = () => resolve(false);
    document.body.appendChild(script);
  });
}

export function UnlockPremiumDialog({
  open,
  onOpenChange,
  batchId,
  batchName,
  priceInr,
  premiumItemsCount = 0,
  onSuccess,
}: UnlockPremiumDialogProps) {
  const router = useRouter();
  const [loading, setLoading] = React.useState(false);
  const [paymentMode, setPaymentMode] = React.useState<"razorpay" | "simulated" | null>(null);
  const [unlockedSuccess, setUnlockedSuccess] = React.useState(false);

  // Check payment mode when dialog opens
  React.useEffect(() => {
    if (!open) {
      setUnlockedSuccess(false);
      return;
    }

    // Probe create-order or check mode
    const checkMode = async () => {
      try {
        const res = await fetch("/api/payments/create-order", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ batchId }),
        });
        const data = await res.json();
        if (data.mode === "simulated") {
          setPaymentMode("simulated");
        } else if (data.mode === "razorpay") {
          setPaymentMode("razorpay");
        }
      } catch {
        setPaymentMode("simulated");
      }
    };

    checkMode();
  }, [open, batchId]);

  // Execute Simulated Payment
  const handleSimulatedPayment = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/payments/simulated", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ batchId }),
      });

      const data = await res.json();
      if (!res.ok || data.error) {
        throw new Error(data.error || "Simulated payment failed");
      }

      setUnlockedSuccess(true);
      toast.success("Batch premium unlocked for 30 days!");
      onSuccess?.(data.premiumUntil);
      router.refresh();

      setTimeout(() => {
        onOpenChange(false);
      }, 1500);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Payment failed";
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  // Execute Razorpay Real Payment
  const handleRazorpayPayment = async () => {
    setLoading(true);
    try {
      const scriptLoaded = await loadRazorpayScript();
      if (!scriptLoaded) {
        throw new Error("Unable to load Razorpay checkout script. Please check your internet connection.");
      }

      const res = await fetch("/api/payments/create-order", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ batchId }),
      });

      const data = await res.json();
      if (!res.ok || data.error) {
        throw new Error(data.error || "Failed to initiate payment");
      }

      // If server returned simulated fallback
      if (data.mode === "simulated") {
        await handleSimulatedPayment();
        return;
      }

      // Razorpay options
      const options = {
        key: data.keyId,
        amount: data.amount,
        currency: data.currency,
        name: "Classy",
        description: `Batch Premium Access — ${data.batchName}`,
        order_id: data.orderId,
        prefill: {
          name: data.student?.name || "",
          email: data.student?.email || "",
          contact: data.student?.phone || "",
        },
        theme: {
          color: "#005B41", // Classy primary
        },
        handler: async (response: RazorpayResponse) => {
          try {
            setLoading(true);
            const verifyRes = await fetch("/api/payments/verify", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                orderId: response.razorpay_order_id,
                paymentId: response.razorpay_payment_id,
                signature: response.razorpay_signature,
                batchId,
              }),
            });

            const verifyData = await verifyRes.json();
            if (!verifyRes.ok || verifyData.error) {
              throw new Error(verifyData.error || "Payment verification failed");
            }

            setUnlockedSuccess(true);
            toast.success("Payment verified! Batch premium unlocked for 30 days.");
            onSuccess?.(verifyData.premiumUntil);
            router.refresh();

            setTimeout(() => {
              onOpenChange(false);
            }, 1500);
          } catch (err: unknown) {
            const msg = err instanceof Error ? err.message : "Verification failed";
            toast.error(msg);
          } finally {
            setLoading(false);
          }
        },
        modal: {
          ondismiss: () => {
            setLoading(false);
            toast.info("Payment cancelled.");
          },
        },
      };

      const razorpayInstance = new (window as unknown as { Razorpay: new (opts: unknown) => { open: () => void } }).Razorpay(options);
      razorpayInstance.open();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Payment initiation failed";
      toast.error(msg);
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="rounded-3xl max-w-md bg-surface p-6 sm:p-8 space-y-5">
        {unlockedSuccess ? (
          <div className="py-6 text-center space-y-4">
            <div className="h-16 w-16 rounded-full bg-success/15 text-success flex items-center justify-center mx-auto animate-bounce">
              <CheckCircle2 className="h-8 w-8" />
            </div>

            <div className="space-y-1">
              <h3 className="font-serif text-2xl font-bold text-ink">
                Premium Unlocked!
              </h3>
              <p className="text-sm text-muted">
                You now have full access to {batchName} for the next 30 days.
              </p>
            </div>
          </div>
        ) : (
          <>
            <DialogHeader className="space-y-2 text-center sm:text-left">
              <div className="flex items-center justify-center sm:justify-start gap-2">
                <Badge className="bg-accent/20 text-accent-dark border-transparent text-xs font-semibold gap-1 py-1">
                  <Crown className="h-3.5 w-3.5 text-accent" /> Premium Batch Access
                </Badge>
              </div>

              <DialogTitle className="font-serif text-2xl font-bold text-ink">
                Unlock {batchName}
              </DialogTitle>

              <DialogDescription className="text-xs text-muted">
                Get 30 days of complete access to all exclusive study materials, quizzes, and tutor feedback.
              </DialogDescription>
            </DialogHeader>

            {/* Price Card */}
            <div className="p-4 rounded-2xl bg-primary-soft/50 border border-primary/20 flex items-center justify-between">
              <div>
                <span className="text-xs text-muted block font-medium">Subscription</span>
                <span className="text-xs text-ink/80">30 days full access</span>
              </div>
              <div className="text-right">
                <span className="font-serif text-3xl font-bold text-primary">
                  ₹{priceInr}
                </span>
                <span className="text-xs text-muted block">/ month</span>
              </div>
            </div>

            {/* Included Features List */}
            <div className="space-y-2.5 text-xs text-ink/90">
              <span className="font-semibold text-ink block text-xs uppercase tracking-wider">
                What&apos;s Included:
              </span>

              <div className="space-y-2">
                <div className="flex items-start gap-2.5">
                  <CheckCircle2 className="h-4 w-4 text-primary shrink-0 mt-0.5" />
                  <span>
                    <strong>{premiumItemsCount > 0 ? `${premiumItemsCount} premium items` : "All premium items"}</strong> (practice tests, notes, and homework)
                  </span>
                </div>

                <div className="flex items-start gap-2.5">
                  <CheckCircle2 className="h-4 w-4 text-primary shrink-0 mt-0.5" />
                  <span>
                    Full access valid for <strong>30 days</strong> (stacks with existing days)
                  </span>
                </div>

                <div className="flex items-start gap-2.5">
                  <CheckCircle2 className="h-4 w-4 text-primary shrink-0 mt-0.5" />
                  <span>
                    Detailed step-by-step solutions and tutor feedback
                  </span>
                </div>

                <div className="flex items-start gap-2.5">
                  <CheckCircle2 className="h-4 w-4 text-primary shrink-0 mt-0.5" />
                  <span>
                    No auto-debit; renew only when you choose
                  </span>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="space-y-3 pt-3 border-t border-border">
              {paymentMode === "razorpay" ? (
                <Button
                  type="button"
                  size="lg"
                  disabled={loading}
                  onClick={handleRazorpayPayment}
                  className="w-full rounded-xl text-xs font-semibold h-12 bg-primary text-white shadow-xs gap-2"
                >
                  {loading ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      <span>Processing Payment...</span>
                    </>
                  ) : (
                    <>
                      <CreditCard className="h-4 w-4" />
                      <span>Pay ₹{priceInr} via Razorpay</span>
                    </>
                  )}
                </Button>
              ) : (
                <div className="space-y-2">
                  <div className="p-3 rounded-xl bg-accent/15 border border-accent/30 text-xs text-ink/90 flex items-start gap-2">
                    <FlaskConical className="h-4 w-4 text-accent shrink-0 mt-0.5" />
                    <span>
                      Razorpay keys are not configured in your environment. You can unlock using the simulated payment flow.
                    </span>
                  </div>

                  <Button
                    type="button"
                    size="lg"
                    disabled={loading}
                    onClick={handleSimulatedPayment}
                    className="w-full rounded-xl text-xs font-semibold h-12 bg-primary text-white shadow-xs gap-2"
                  >
                    {loading ? (
                      <>
                        <Loader2 className="h-4 w-4 animate-spin" />
                        <span>Unlocking Batch...</span>
                      </>
                    ) : (
                      <>
                        <FlaskConical className="h-4 w-4 text-accent" />
                        <span>Test Mode: Simulated Payment (₹{priceInr})</span>
                      </>
                    )}
                  </Button>
                </div>
              )}

              <p className="text-[11px] text-muted text-center flex items-center justify-center gap-1">
                <ShieldCheck className="h-3.5 w-3.5 text-primary" />
                <span>Encrypted & secure transaction</span>
              </p>
            </div>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}
