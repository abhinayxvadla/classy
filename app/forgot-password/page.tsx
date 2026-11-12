"use client";

import * as React from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { toast } from "sonner";
import { Loader2, ArrowLeft, ShieldCheck, KeyRound } from "lucide-react";
import { AuthLayout } from "@/components/auth/auth-layout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { PasswordInput } from "@/components/auth/password-input";
import {
  forgotPasswordStep1Action,
  forgotPasswordStep2Action,
} from "@/app/actions/auth";

function ForgotPasswordContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const initialEmail = searchParams.get("email") || "";

  // Step 1: Email -> fetch security question
  // Step 2: Answer + New Password + Confirm
  const [step, setStep] = React.useState<1 | 2>(1);
  const [email, setEmail] = React.useState(initialEmail);
  const [securityQuestion, setSecurityQuestion] = React.useState("");
  const [securityAnswer, setSecurityAnswer] = React.useState("");
  const [newPassword, setNewPassword] = React.useState("");
  const [confirmPassword, setConfirmPassword] = React.useState("");

  const [loading, setLoading] = React.useState(false);
  const [errorMsg, setErrorMsg] = React.useState<string | null>(null);

  const handleStep1Submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setLoading(true);

    try {
      const res = await forgotPasswordStep1Action({ email });
      if (res.error) {
        setErrorMsg(res.error);
        setLoading(false);
        return;
      }

      if (res.question) {
        setSecurityQuestion(res.question);
        setStep(2);
      }
      setLoading(false);
    } catch {
      setErrorMsg("An unexpected error occurred. Please try again.");
      setLoading(false);
    }
  };

  const handleStep2Submit = async (e: React.FormEvent) => {
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
      const res = await forgotPasswordStep2Action({
        email,
        securityAnswer,
        newPassword,
        confirmPassword,
      });

      if (res.error) {
        setErrorMsg(res.error);
        setLoading(false);
        return;
      }

      toast.success("Password updated. Sign in with your new password.");
      router.push(res.redirectUrl || "/student/login?message=password_updated");
    } catch {
      setErrorMsg("Failed to reset password. Please try again.");
      setLoading(false);
    }
  };

  return (
    <AuthLayout
      portal="student"
      title="Reset Password"
      subtitle={
        step === 1
          ? "Enter your registered email to retrieve your security question."
          : "Answer your security question to set a new password."
      }
      otherPortalLink={{
        label: "Back to Home",
        href: "/",
      }}
    >
      {step === 1 ? (
        <form onSubmit={handleStep1Submit} className="space-y-4">
          {errorMsg && (
            <Alert variant="destructive" className="rounded-xl">
              <AlertDescription className="text-xs sm:text-sm">
                {errorMsg}
              </AlertDescription>
            </Alert>
          )}

          <div className="space-y-1.5">
            <Label htmlFor="email" className="text-xs font-semibold">
              Your registered email address
            </Label>
            <Input
              id="email"
              type="email"
              required
              autoComplete="email"
              placeholder="you@domain.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              disabled={loading}
              className="rounded-xl"
            />
            <p className="text-[11px] text-muted">
              We will present the security question you chose during registration. No emails are ever sent.
            </p>
          </div>

          <Button
            type="submit"
            disabled={loading}
            className="w-full rounded-xl bg-primary hover:bg-primary/90 text-primary-foreground font-semibold py-2.5 shadow-xs"
          >
            {loading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin mr-2" />
                Checking...
              </>
            ) : (
              "Continue to Security Question"
            )}
          </Button>

          <div className="pt-2 flex items-center justify-between text-xs">
            <Link
              href="/student/login"
              className="text-muted hover:text-ink inline-flex items-center gap-1 font-medium"
            >
              <ArrowLeft className="w-3.5 h-3.5" /> Student Login
            </Link>
            <Link
              href="/tutor/login"
              className="text-muted hover:text-ink inline-flex items-center gap-1 font-medium"
            >
              Tutor Login &rarr;
            </Link>
          </div>
        </form>
      ) : (
        <form onSubmit={handleStep2Submit} className="space-y-4">
          {errorMsg && (
            <Alert variant="destructive" className="rounded-xl">
              <AlertDescription className="text-xs sm:text-sm">
                {errorMsg}
              </AlertDescription>
            </Alert>
          )}

          {/* Account email preview */}
          <div className="p-3 rounded-xl bg-surface border border-border flex items-center justify-between text-xs">
            <span className="text-muted font-medium">Account:</span>
            <span className="font-semibold text-ink">{email}</span>
          </div>

          {/* Security Question Box */}
          <div className="p-3.5 rounded-xl bg-primary-soft text-primary border border-primary/20 space-y-1">
            <div className="flex items-center gap-1.5 text-xs font-semibold">
              <ShieldCheck className="w-4 h-4 shrink-0" />
              <span>Security Question</span>
            </div>
            <p className="text-sm font-medium text-ink">{securityQuestion}</p>
          </div>

          {/* Security Answer */}
          <div className="space-y-1.5">
            <Label htmlFor="securityAnswer" className="text-xs font-semibold">
              Your Answer
            </Label>
            <Input
              id="securityAnswer"
              type="text"
              required
              autoFocus
              placeholder="Enter your security answer"
              value={securityAnswer}
              onChange={(e) => setSecurityAnswer(e.target.value)}
              disabled={loading}
              className="rounded-xl"
            />
            <p className="text-[11px] text-muted">Answers are case-insensitive.</p>
          </div>

          {/* New Password & Confirm */}
          <div className="space-y-3 pt-2 border-t border-border">
            <div className="flex items-center gap-1.5 text-xs font-semibold text-ink">
              <KeyRound className="w-3.5 h-3.5 text-primary" />
              <span>New Password</span>
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="newPassword" className="text-xs text-muted">
                Create new password
              </Label>
              <PasswordInput
                id="newPassword"
                required
                placeholder="Min. 8 chars, 1 letter, 1 number"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                disabled={loading}
              />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="confirmPassword" className="text-xs text-muted">
                Confirm new password
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
              "Save New Password & Sign In"
            )}
          </Button>

          <div className="pt-2 text-center text-xs">
            <button
              type="button"
              onClick={() => {
                setStep(1);
                setErrorMsg(null);
              }}
              className="text-muted hover:text-ink font-medium"
            >
              &larr; Try a different email
            </button>
          </div>
        </form>
      )}
    </AuthLayout>
  );
}

export default function ForgotPasswordPage() {
  return (
    <React.Suspense
      fallback={
        <div className="min-h-screen bg-bg flex items-center justify-center">
          <Loader2 className="w-6 h-6 animate-spin text-primary" />
        </div>
      }
    >
      <ForgotPasswordContent />
    </React.Suspense>
  );
}
