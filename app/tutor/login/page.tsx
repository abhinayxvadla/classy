"use client";

import * as React from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { toast } from "sonner";
import { Loader2, ArrowRight } from "lucide-react";
import { AuthLayout } from "@/components/auth/auth-layout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { PasswordInput } from "@/components/auth/password-input";
import { signInAction } from "@/app/actions/auth";

function TutorLoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const next = searchParams.get("next") || "";
  const joinCode = searchParams.get("join") || "";
  const message = searchParams.get("message") || "";

  const [email, setEmail] = React.useState("");
  const [password, setPassword] = React.useState("");
  const [loading, setLoading] = React.useState(false);
  const [errorMsg, setErrorMsg] = React.useState<string | null>(null);
  const [portalRedirect, setPortalRedirect] = React.useState<string | null>(null);

  React.useEffect(() => {
    if (message === "password_updated") {
      toast.success("Password updated. Sign in with your new password.");
    }
  }, [message]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setPortalRedirect(null);
    setLoading(true);

    try {
      const res = await signInAction({
        email,
        password,
        expectedRole: "tutor",
        joinCode: joinCode || undefined,
        next: next || undefined,
      });

      if (res.error) {
        setErrorMsg(res.error);
        if (res.redirectUrl) {
          setPortalRedirect(res.redirectUrl);
        }
        setLoading(false);
        return;
      }

      toast.success("Welcome back!");
      router.push(res.redirectUrl || "/t");
      router.refresh();
    } catch {
      setErrorMsg("An unexpected error occurred. Please try again.");
      setLoading(false);
    }
  };

  const registerHref = `/tutor/register${
    next || joinCode
      ? `?${new URLSearchParams({
          ...(next ? { next } : {}),
          ...(joinCode ? { join: joinCode } : {}),
        }).toString()}`
      : ""
  }`;

  return (
    <AuthLayout
      portal="tutor"
      title="Tutor Sign In"
      subtitle="Welcome back. Manage your batches, AI tools, and coursework."
      otherPortalLink={{
        label: "Go to Student Login",
        href: `/student/login${
          next || joinCode
            ? `?${new URLSearchParams({
                ...(next ? { next } : {}),
                ...(joinCode ? { join: joinCode } : {}),
              }).toString()}`
            : ""
        }`,
      }}
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        {errorMsg && (
          <Alert variant="destructive" className="rounded-xl">
            <AlertDescription className="text-xs sm:text-sm flex flex-col gap-1.5">
              <span>{errorMsg}</span>
              {portalRedirect && (
                <Link
                  href={portalRedirect}
                  className="font-medium underline hover:opacity-80 inline-flex items-center gap-1"
                >
                  Switch to Student Login <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              )}
            </AlertDescription>
          </Alert>
        )}

        <div className="space-y-1.5">
          <Label htmlFor="email" className="text-xs font-semibold">
            Email address
          </Label>
          <Input
            id="email"
            type="email"
            required
            autoComplete="email"
            placeholder="tutor@academy.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            disabled={loading}
            className="rounded-xl"
          />
        </div>

        <div className="space-y-1.5">
          <div className="flex items-center justify-between">
            <Label htmlFor="password" className="text-xs font-semibold">
              Password
            </Label>
            <Link
              href={`/forgot-password?email=${encodeURIComponent(email)}`}
              className="text-xs text-primary hover:underline font-medium"
            >
              Forgot password?
            </Link>
          </div>
          <PasswordInput
            id="password"
            required
            autoComplete="current-password"
            placeholder="••••••••"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
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
              Signing in...
            </>
          ) : (
            "Sign In as Tutor"
          )}
        </Button>

        <div className="pt-2 text-center text-xs text-muted">
          New here?{" "}
          <Link
            href={registerHref}
            className="font-semibold text-primary hover:underline"
          >
            Register as a Tutor
          </Link>
        </div>
      </form>
    </AuthLayout>
  );
}

export default function TutorLoginPage() {
  return (
    <React.Suspense
      fallback={
        <div className="min-h-screen bg-bg flex items-center justify-center">
          <Loader2 className="w-6 h-6 animate-spin text-primary" />
        </div>
      }
    >
      <TutorLoginForm />
    </React.Suspense>
  );
}
