"use client";

import * as React from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { toast } from "sonner";
import { Loader2, ShieldCheck } from "lucide-react";
import { AuthLayout } from "@/components/auth/auth-layout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { PasswordInput } from "@/components/auth/password-input";
import { SECURITY_QUESTIONS } from "@/lib/config";
import { registerTutorAction } from "@/app/actions/auth";

function TutorRegisterForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const next = searchParams.get("next") || "";
  const joinCode = searchParams.get("join") || "";

  const [fullName, setFullName] = React.useState("");
  const [email, setEmail] = React.useState("");
  const [phone, setPhone] = React.useState("");
  const [institute, setInstitute] = React.useState("");
  const [password, setPassword] = React.useState("");
  const [confirmPassword, setConfirmPassword] = React.useState("");
  const [securityQuestion, setSecurityQuestion] = React.useState<string>(
    SECURITY_QUESTIONS[0]
  );
  const [securityAnswer, setSecurityAnswer] = React.useState("");

  const [loading, setLoading] = React.useState(false);
  const [errorMsg, setErrorMsg] = React.useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);

    if (password !== confirmPassword) {
      setErrorMsg("Passwords do not match");
      return;
    }

    if (password.length < 8 || !/(?=.*[A-Za-z])(?=.*\d)/.test(password)) {
      setErrorMsg("Password must be at least 8 characters with at least one letter and one number.");
      return;
    }

    setLoading(true);

    try {
      const res = await registerTutorAction({
        fullName,
        email,
        phone,
        institute: institute || undefined,
        password,
        confirmPassword,
        securityQuestion,
        securityAnswer,
        next: next || undefined,
        joinCode: joinCode || undefined,
      });

      if (res.error) {
        setErrorMsg(res.error);
        setLoading(false);
        return;
      }

      toast.success("Tutor account created! Welcome to Classy.");
      router.push(res.redirectUrl || "/t");
      router.refresh();
    } catch {
      setErrorMsg("Failed to create account. Please check your information and try again.");
      setLoading(false);
    }
  };

  const loginHref = `/tutor/login${
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
      title="Create Tutor Account"
      subtitle="Start teaching on Classy. Set up your classroom and invite your students in seconds."
      otherPortalLink={{
        label: "Register as Student",
        href: `/student/register${
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
            <AlertDescription className="text-xs sm:text-sm">
              {errorMsg}
            </AlertDescription>
          </Alert>
        )}

        {/* Full Name */}
        <div className="space-y-1.5">
          <Label htmlFor="fullName" className="text-xs font-semibold">
            Full name *
          </Label>
          <Input
            id="fullName"
            type="text"
            required
            placeholder="Dr. Rajesh Sharma"
            value={fullName}
            onChange={(e) => setFullName(e.target.value)}
            disabled={loading}
            className="rounded-xl"
          />
        </div>

        {/* Email & Phone */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div className="space-y-1.5">
            <Label htmlFor="email" className="text-xs font-semibold">
              Email address *
            </Label>
            <Input
              id="email"
              type="email"
              required
              placeholder="rajesh@academy.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              disabled={loading}
              className="rounded-xl"
            />
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="phone" className="text-xs font-semibold">
              Mobile number *
            </Label>
            <Input
              id="phone"
              type="tel"
              required
              placeholder="+91 98765 43210"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              disabled={loading}
              className="rounded-xl"
            />
          </div>
        </div>

        {/* Institute (Optional) */}
        <div className="space-y-1.5">
          <Label htmlFor="institute" className="text-xs font-semibold">
            Institute / Academy <span className="text-muted font-normal">(optional)</span>
          </Label>
          <Input
            id="institute"
            type="text"
            placeholder="Apex IIT-JEE Coaching / Freelance"
            value={institute}
            onChange={(e) => setInstitute(e.target.value)}
            disabled={loading}
            className="rounded-xl"
          />
        </div>

        {/* Password & Confirm */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div className="space-y-1.5">
            <Label htmlFor="password" className="text-xs font-semibold">
              Password *
            </Label>
            <PasswordInput
              id="password"
              required
              placeholder="Min. 8 chars"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              disabled={loading}
            />
            <p className="text-[11px] text-muted">Min 8 chars, 1 letter, 1 number</p>
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="confirmPassword" className="text-xs font-semibold">
              Confirm password *
            </Label>
            <PasswordInput
              id="confirmPassword"
              required
              placeholder="Repeat password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              disabled={loading}
            />
          </div>
        </div>

        {/* Security Question & Answer */}
        <div className="pt-2 border-t border-border space-y-3">
          <div className="flex items-center gap-1.5 text-xs font-semibold text-ink">
            <ShieldCheck className="w-3.5 h-3.5 text-primary" />
            <span>Password Recovery Security Question</span>
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="securityQuestion" className="text-xs text-muted">
              Select Question *
            </Label>
            <Select
              value={securityQuestion}
              onValueChange={(val) => {
                if (val) setSecurityQuestion(val);
              }}
              disabled={loading}
            >
              <SelectTrigger id="securityQuestion" className="rounded-xl text-xs sm:text-sm">
                <SelectValue placeholder="Choose a security question" />
              </SelectTrigger>
              <SelectContent className="rounded-xl">
                {SECURITY_QUESTIONS.map((q) => (
                  <SelectItem key={q} value={q} className="text-xs sm:text-sm">
                    {q}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="securityAnswer" className="text-xs text-muted">
              Your Answer *
            </Label>
            <Input
              id="securityAnswer"
              type="text"
              required
              placeholder="Your answer (case-insensitive)"
              value={securityAnswer}
              onChange={(e) => setSecurityAnswer(e.target.value)}
              disabled={loading}
              className="rounded-xl"
            />
            <p className="text-[11px] text-muted">
              Used if you forget your password. No emails are ever sent.
            </p>
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
              Creating account...
            </>
          ) : (
            "Create Tutor Account"
          )}
        </Button>

        <div className="pt-2 text-center text-xs text-muted">
          Already have an account?{" "}
          <Link
            href={loginHref}
            className="font-semibold text-primary hover:underline"
          >
            Sign In
          </Link>
        </div>
      </form>
    </AuthLayout>
  );
}

export default function TutorRegisterPage() {
  return (
    <React.Suspense
      fallback={
        <div className="min-h-screen bg-bg flex items-center justify-center">
          <Loader2 className="w-6 h-6 animate-spin text-primary" />
        </div>
      }
    >
      <TutorRegisterForm />
    </React.Suspense>
  );
}
