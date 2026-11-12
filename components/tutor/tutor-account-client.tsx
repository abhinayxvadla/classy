"use client";

import React, { useState, useEffect, useTransition } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import {
  Building,
  Lock,
  LogOut,
  Save,
  Mail,
  Award,
  Calendar,
  Check,
  Smartphone,
  Download,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { updateTutorProfileAction } from "@/app/actions/tutor";
import { resetPasswordAction, signOutAction } from "@/app/actions/auth";
import { cn } from "@/lib/utils";

const COMMON_SUBJECTS = [
  "Mathematics",
  "Physics",
  "Chemistry",
  "Biology",
  "Computer Science",
  "English",
  "Social Science",
  "Economics",
  "Accountancy",
  "Business Studies",
];

export interface TutorProfileData {
  id: string;
  email: string;
  full_name: string;
  phone: string | null;
  institute: string | null;
  subjects: string[] | null;
  created_at: string;
}

interface TutorAccountClientProps {
  profile: TutorProfileData;
}

export function TutorAccountClient({ profile }: TutorAccountClientProps) {
  const router = useRouter();
  const [isPendingProfile, startProfileTransition] = useTransition();
  const [isPendingPassword, startPasswordTransition] = useTransition();

  // Profile form state
  const [fullName, setFullName] = useState(profile.full_name || "");
  const [phone, setPhone] = useState(profile.phone || "");
  const [institute, setInstitute] = useState(profile.institute || "");
  const [subjects, setSubjects] = useState<string[]>(profile.subjects || []);
  const [customSubject, setCustomSubject] = useState("");

  // Password change state
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  // PWA Install state
  const [deferredPrompt, setDeferredPrompt] = useState<{
    prompt: () => Promise<void>;
    userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
  } | null>(null);
  const [isInstalled, setIsInstalled] = useState(false);

  useEffect(() => {
    const handler = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(
        e as unknown as {
          prompt: () => Promise<void>;
          userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
        }
      );
    };
    window.addEventListener("beforeinstallprompt", handler);

    if (window.matchMedia("(display-mode: standalone)").matches) {
      setIsInstalled(true);
    }

    return () => window.removeEventListener("beforeinstallprompt", handler);
  }, []);

  const handleInstallClick = async () => {
    if (!deferredPrompt) {
      toast.info("To install Classy, tap Share (Safari) or Menu (Chrome) and select 'Add to Home Screen'.");
      return;
    }
    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    if (outcome === "accepted") {
      setIsInstalled(true);
      toast.success("App installed successfully!");
    }
    setDeferredPrompt(null);
  };

  const handleToggleSubject = (subject: string) => {
    setSubjects((prev) =>
      prev.includes(subject) ? prev.filter((s) => s !== subject) : [...prev, subject]
    );
  };

  const handleAddCustomSubject = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = customSubject.trim();
    if (!trimmed) return;
    if (!subjects.includes(trimmed)) {
      setSubjects((prev) => [...prev, trimmed]);
    }
    setCustomSubject("");
  };

  const handleSaveProfile = (e: React.FormEvent) => {
    e.preventDefault();
    if (!fullName.trim()) {
      toast.error("Full name is required");
      return;
    }

    startProfileTransition(async () => {
      try {
        const res = await updateTutorProfileAction({
          fullName: fullName.trim(),
          phone: phone.trim() || undefined,
          institute: institute.trim() || undefined,
          subjects: subjects.length > 0 ? subjects : undefined,
        });

        if (res.error) {
          toast.error(res.error);
        } else {
          toast.success("Profile updated successfully!");
          router.refresh();
        }
      } catch (err: unknown) {
        toast.error((err as Error)?.message || "Failed to update profile");
      }
    });
  };

  const handleChangePassword = (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentPassword) {
      toast.error("Current password is required");
      return;
    }
    if (newPassword.length < 6) {
      toast.error("New password must be at least 6 characters");
      return;
    }
    if (newPassword !== confirmPassword) {
      toast.error("New passwords do not match");
      return;
    }

    startPasswordTransition(async () => {
      try {
        const res = await resetPasswordAction(
          {
            currentPassword,
            newPassword,
          },
          true
        );

        if (res.error) {
          toast.error(res.error);
        } else {
          toast.success("Password changed successfully!");
          setCurrentPassword("");
          setNewPassword("");
          setConfirmPassword("");
        }
      } catch (err: unknown) {
        toast.error((err as Error)?.message || "Failed to change password");
      }
    });
  };

  const handleSignOut = async () => {
    await signOutAction();
    router.push("/");
    router.refresh();
  };

  const initials = profile.full_name
    ? profile.full_name
        .split(" ")
        .map((n) => n[0])
        .join("")
        .toUpperCase()
        .slice(0, 2)
    : "TU";

  return (
    <div className="space-y-6 max-w-4xl mx-auto text-ink">
      {/* =================================================================== */}
      {/* 1. TOP PROFILE HERO CARD (Speech AI Style) */}
      {/* =================================================================== */}
      <section className="bg-surface rounded-3xl p-6 sm:p-8 border border-border/80 shadow-xs space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center gap-5 sm:gap-6">
          {/* Avatar with Online Dot */}
          <div className="relative shrink-0">
            <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-full bg-primary text-primary-foreground font-serif text-2xl sm:text-3xl font-bold flex items-center justify-center shadow-xs">
              {initials}
            </div>
            <div
              className="absolute -bottom-1 -right-1 w-4 h-4 rounded-full bg-emerald-500 border-2 border-surface"
              title="Active Educator Account"
            />
          </div>

          {/* Details */}
          <div className="min-w-0 flex-1 space-y-1">
            <h1 className="font-serif text-2xl sm:text-3xl font-bold tracking-tight text-ink truncate">
              {profile.full_name}
            </h1>
            <p className="text-xs sm:text-sm text-muted truncate flex items-center gap-1.5">
              <Mail className="w-3.5 h-3.5 shrink-0" />
              <span>{profile.email}</span>
            </p>

            {/* Badges Container */}
            <div className="flex flex-wrap items-center gap-2 pt-2">
              <span className="inline-flex items-center gap-1 text-xs font-semibold px-3 py-1 rounded-full bg-primary-soft text-primary border border-primary/20">
                <Award className="w-3.5 h-3.5" />
                <span>Educator Account</span>
              </span>

              {profile.institute && (
                <span className="inline-flex items-center gap-1.5 text-xs font-medium px-3 py-1 rounded-full bg-bg text-ink border border-border/60">
                  <Building className="w-3.5 h-3.5 text-primary" />
                  <span>{profile.institute}</span>
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Member Since Strip */}
        <div className="pt-4 border-t border-border/60 flex items-center justify-between text-xs text-muted">
          <div className="flex items-center gap-2">
            <Calendar className="w-4 h-4 text-primary" />
            <span>Member since {new Date(profile.created_at).toLocaleDateString()}</span>
          </div>
          <span className="font-mono text-[11px] text-emerald-600 bg-emerald-500/10 px-2.5 py-0.5 rounded-full font-semibold">
            Verified
          </span>
        </div>
      </section>

      {/* =================================================================== */}
      {/* 2. TEACHING JOURNEY SNAPSHOT (Speech AI Step Sequence) */}
      {/* =================================================================== */}
      <section className="bg-surface rounded-3xl p-6 sm:p-7 border border-border/80 shadow-xs space-y-4">
        <div>
          <span className="text-[11px] font-semibold text-primary uppercase tracking-wider block mb-1">
            Classroom Roadmap
          </span>
          <h2 className="font-serif text-lg sm:text-xl font-bold text-ink tracking-tight">
            Teaching Journey Snapshot
          </h2>
          <p className="text-xs text-muted">
            Track your milestone progress from class creation to automated grading and student success.
          </p>
        </div>

        {/* Horizontal Milestone Sequence */}
        <div className="pt-4 pb-2">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            <div className="p-3.5 rounded-2xl bg-bg border border-border/60 space-y-1">
              <span className="text-[10px] font-bold uppercase tracking-wider text-muted">Step 1</span>
              <p className="font-serif text-sm font-bold text-ink">Class Setup</p>
              <p className="text-[11px] text-emerald-600 font-semibold flex items-center gap-1">
                <Check className="w-3 h-3" /> Ready
              </p>
            </div>

            <div className="p-3.5 rounded-2xl bg-bg border border-border/60 space-y-1">
              <span className="text-[10px] font-bold uppercase tracking-wider text-muted">Step 2</span>
              <p className="font-serif text-sm font-bold text-ink">Roster &amp; Share</p>
              <p className="text-[11px] text-emerald-600 font-semibold flex items-center gap-1">
                <Check className="w-3 h-3" /> Active
              </p>
            </div>

            <div className="p-3.5 rounded-2xl bg-bg border border-border/60 space-y-1">
              <span className="text-[10px] font-bold uppercase tracking-wider text-muted">Step 3</span>
              <p className="font-serif text-sm font-bold text-ink">Quizzes &amp; Notes</p>
              <p className="text-[11px] text-primary font-semibold">Publishing</p>
            </div>

            <div className="p-3.5 rounded-2xl bg-bg border border-border/60 space-y-1">
              <span className="text-[10px] font-bold uppercase tracking-wider text-muted">Step 4</span>
              <p className="font-serif text-sm font-bold text-ink">Submissions</p>
              <p className="text-[11px] text-primary font-semibold">Auto-Grading</p>
            </div>
          </div>
        </div>
      </section>

      {/* =================================================================== */}
      {/* 3. EDIT PROFILE & SUBJECTS */}
      {/* =================================================================== */}
      <section className="bg-surface rounded-3xl p-6 sm:p-7 border border-border/80 shadow-xs space-y-5">
        <div className="border-b border-border/60 pb-3">
          <h2 className="font-serif text-lg font-bold text-ink">
            Personal &amp; Institute Information
          </h2>
          <p className="text-xs text-muted">
            Update your public name, phone number, and teaching subjects.
          </p>
        </div>

        <form onSubmit={handleSaveProfile} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label htmlFor="full_name" className="text-xs font-semibold text-ink">
                Full Name
              </Label>
              <Input
                id="full_name"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                className="h-10 text-xs rounded-xl"
                placeholder="Dr. Raman Sharma"
              />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="phone" className="text-xs font-semibold text-ink">
                Phone Number (Optional)
              </Label>
              <Input
                id="phone"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="h-10 text-xs rounded-xl"
                placeholder="+91 98765 43210"
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="institute" className="text-xs font-semibold text-ink">
              Institute or Coaching Name
            </Label>
            <Input
              id="institute"
              value={institute}
              onChange={(e) => setInstitute(e.target.value)}
              className="h-10 text-xs rounded-xl"
              placeholder="e.g. Apex Physics Academy"
            />
          </div>

          {/* Subjects Pills */}
          <div className="space-y-2 pt-2">
            <Label className="text-xs font-semibold text-ink">
              Subjects Taught
            </Label>
            <div className="flex flex-wrap gap-1.5">
              {COMMON_SUBJECTS.map((sub) => {
                const isSelected = subjects.includes(sub);
                return (
                  <button
                    key={sub}
                    type="button"
                    onClick={() => handleToggleSubject(sub)}
                    className={cn(
                      "px-3 py-1.5 rounded-xl text-xs font-medium border transition-colors cursor-pointer",
                      isSelected
                        ? "bg-primary text-primary-foreground border-primary"
                        : "bg-bg text-muted border-border hover:text-ink"
                    )}
                  >
                    {sub}
                  </button>
                );
              })}
            </div>

            {/* Custom Subject Input */}
            <div className="flex gap-2 pt-1 max-w-sm">
              <Input
                value={customSubject}
                onChange={(e) => setCustomSubject(e.target.value)}
                placeholder="Add other subject..."
                className="h-9 text-xs rounded-xl"
              />
              <Button
                type="button"
                onClick={handleAddCustomSubject}
                variant="outline"
                size="sm"
                className="h-9 text-xs rounded-xl shrink-0"
              >
                Add
              </Button>
            </div>
          </div>

          <div className="pt-2 flex justify-end">
            <Button
              type="submit"
              disabled={isPendingProfile}
              className="bg-primary hover:bg-primary/90 text-primary-foreground font-semibold text-xs h-10 px-6 rounded-xl gap-1.5"
            >
              <Save className="w-3.5 h-3.5" />
              <span>{isPendingProfile ? "Saving..." : "Save Changes"}</span>
            </Button>
          </div>
        </form>
      </section>

      {/* =================================================================== */}
      {/* 4. APP INSTALLATION & PWA */}
      {/* =================================================================== */}
      <section className="bg-surface rounded-3xl p-6 sm:p-7 border border-border/80 shadow-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <Smartphone className="w-4 h-4 text-primary" />
            <h3 className="font-serif text-base font-bold text-ink">
              Get Standalone App
            </h3>
          </div>
          <p className="text-xs text-muted max-w-md">
            Install Classy as a standalone desktop or mobile application for instant access, offline coursework review, and faster notifications.
          </p>
        </div>

        <Button
          onClick={handleInstallClick}
          variant="outline"
          className="rounded-xl text-xs font-semibold h-10 px-5 border-border hover:bg-bg gap-1.5 shrink-0"
        >
          <Download className="w-3.5 h-3.5 text-primary" />
          <span>{isInstalled ? "App Installed" : "Install App"}</span>
        </Button>
      </section>

      {/* =================================================================== */}
      {/* 5. SECURITY & PASSWORD CHANGE */}
      {/* =================================================================== */}
      <section className="bg-surface rounded-3xl p-6 sm:p-7 border border-border/80 shadow-xs space-y-4">
        <div className="border-b border-border/60 pb-3">
          <h2 className="font-serif text-lg font-bold text-ink flex items-center gap-2">
            <Lock className="w-4 h-4 text-primary" />
            <span>Security &amp; Password</span>
          </h2>
          <p className="text-xs text-muted">
            Ensure your account is using a secure, unique password.
          </p>
        </div>

        <form onSubmit={handleChangePassword} className="space-y-3.5 max-w-md">
          <div className="space-y-1">
            <Label className="text-xs font-semibold text-ink">Current Password</Label>
            <Input
              type="password"
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
              className="h-10 text-xs rounded-xl"
              placeholder="••••••••"
            />
          </div>

          <div className="space-y-1">
            <Label className="text-xs font-semibold text-ink">New Password</Label>
            <Input
              type="password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              className="h-10 text-xs rounded-xl"
              placeholder="At least 6 characters"
            />
          </div>

          <div className="space-y-1">
            <Label className="text-xs font-semibold text-ink">Confirm New Password</Label>
            <Input
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              className="h-10 text-xs rounded-xl"
              placeholder="Repeat new password"
            />
          </div>

          <div className="pt-2">
            <Button
              type="submit"
              disabled={isPendingPassword}
              variant="outline"
              className="text-xs font-semibold h-10 px-5 rounded-xl border-border hover:bg-bg"
            >
              {isPendingPassword ? "Updating..." : "Update Password"}
            </Button>
          </div>
        </form>
      </section>

      {/* =================================================================== */}
      {/* 6. SIGN OUT */}
      {/* =================================================================== */}
      <section className="bg-surface rounded-3xl p-6 border border-border/80 shadow-xs flex items-center justify-between">
        <div>
          <h3 className="font-serif text-base font-bold text-ink">Sign Out</h3>
          <p className="text-xs text-muted">End your current session on this device.</p>
        </div>

        <Button
          onClick={handleSignOut}
          variant="outline"
          className="rounded-xl text-xs font-semibold h-10 px-5 border-border hover:bg-danger/10 hover:text-danger hover:border-danger/30 text-muted gap-1.5"
        >
          <LogOut className="w-3.5 h-3.5" />
          <span>Sign Out</span>
        </Button>
      </section>
    </div>
  );
}
