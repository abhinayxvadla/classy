"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Loader2, KeyRound, AlertTriangle } from "lucide-react";
import { AuthLogoPill } from "@/components/auth/auth-logo-pill";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { PasswordInput } from "@/components/auth/password-input";
import { resetPasswordAction } from "@/app/actions/auth";
import { createClient } from "@/lib/supabase/client";

export default function ResetPasswordPage() {
  const router = useRouter();
  const [isForced, setIsForced] = React.useState(true);
  const [currentPassword, setCurrentPassword] = React.useState("");
  const [newPassword, setNewPassword] = React.useState("");
  const [confirmPassword, setConfirmPassword] = React.useState("");

  const [checking, setChecking] = React.useState(true);
  const [loading, setLoading] = React.useState(false);
  const [errorMsg, setErrorMsg] = React.useState<string | null>(null);

  React.useEffect(() => {
    async function checkProfile() {
      try {
        const supabase = createClient();
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) {
          router.push("/student/login");
          return;
        }

        const { data: profile } = await supabase
          .from("profiles")
          .select("must_change_password, role")
          .eq("id", user.id)
          .maybeSingle();

        setIsForced(profile?.must_change_password ?? false);
      } catch {
        // Fallback
      } finally {
        setChecking(false);
      }
    }
    checkProfile();
  }, [router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);

    if (newPassword !== confirmPassword) {
      setErrorMsg("Passwords do not match");
      return;
    }

    if (newPassword.length < 8 || !/(?=.*[A-Za-z])(?=.*\d)/.test(newPassword)) {
      setErrorMsg(
        "Password must be at least 8 characters with at least one letter and one number."
      );
      return;
    }

    setLoading(true);

    try {
      const res = await resetPasswordAction(
        isForced
          ? { newPassword, confirmPassword }
          : { currentPassword, newPassword, confirmPassword },
        !isForced
      );

      if (res.error) {
        setErrorMsg(res.error);
        setLoading(false);
        return;
      }

      toast.success("Password changed successfully!");
      router.push(res.redirectUrl || "/s");
      router.refresh();
    } catch {
      setErrorMsg("Failed to update password. Please try again.");
      setLoading(false);
    }
  };

  if (checking) {
    return (
      <div className="min-h-screen bg-bg flex items-center justify-center">
        <AuthLogoPill />
        <Loader2 className="w-6 h-6 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-bg text-ink flex flex-col justify-between selection:bg-primary-soft selection:text-primary">
      <AuthLogoPill />

      <main className="flex-1 flex items-center justify-center pt-20 pb-12 px-4 sm:px-6">
        <div className="w-full max-w-md mx-auto bg-surface rounded-2xl border border-border p-6 sm:p-8 shadow-sm">
          <div className="mb-6 space-y-2">
            <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-accent/15 text-accent border border-accent/25">
              <KeyRound className="w-3.5 h-3.5" />
              {isForced ? "Action Required" : "Security Settings"}
            </div>
            <h1 className="font-serif text-2xl sm:text-3xl font-bold tracking-tight text-ink">
              {isForced ? "Set a New Password" : "Change Your Password"}
            </h1>
            <p className="text-xs sm:text-sm text-muted">
              {isForced
                ? "Your tutor has reset your password. Please choose a new, secure password to continue accessing your account."
                : "Enter your current password and choose a new one."}
            </p>
          </div>

          {isForced && (
            <div className="mb-5 p-3 rounded-xl bg-amber-500/10 border border-amber-500/20 text-xs text-amber-700 dark:text-amber-400 flex items-start gap-2.5">
              <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5" />
              <span>
                You must update your temporary password before you can view your batches and coursework.
              </span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            {errorMsg && (
              <Alert variant="destructive" className="rounded-xl">
                <AlertDescription className="text-xs sm:text-sm">
                  {errorMsg}
                </AlertDescription>
              </Alert>
            )}

            {!isForced && (
              <div className="space-y-1.5">
                <Label htmlFor="currentPassword" className="text-xs font-semibold">
                  Current Password
                </Label>
                <PasswordInput
                  id="currentPassword"
                  required
                  placeholder="••••••••"
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                  disabled={loading}
                />
              </div>
            )}

            <div className="space-y-1.5">
              <Label htmlFor="newPassword" className="text-xs font-semibold">
                New Password
              </Label>
              <PasswordInput
                id="newPassword"
                required
                placeholder="Min. 8 chars, 1 letter, 1 number"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                disabled={loading}
              />
              <p className="text-[11px] text-muted">
                At least 8 characters, with letters and numbers.
              </p>
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="confirmPassword" className="text-xs font-semibold">
                Confirm New Password
              </Label>
              <PasswordInput
                id="confirmPassword"
                required
                placeholder="Repeat new password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                disabled={loading}
              />
            </div>

            <Button
              type="submit"
              disabled={loading}
              className="w-full rounded-xl bg-primary hover:bg-primary/90 text-primary-foreground font-semibold py-2.5 shadow-xs"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin mr-2" />
                  Updating Password...
                </>
              ) : (
                "Save New Password"
              )}
            </Button>
          </form>
        </div>
      </main>
    </div>
  );
}
