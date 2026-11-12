"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import {
  Lock,
  Download,
  LogOut,
  Save,
  Check,
  Award,
  Calendar,
  Smartphone,
  Mail,
  GraduationCap,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  updateStudentProfileAction,
  changeStudentPasswordAction,
} from "@/app/actions/student";
import { signOutAction } from "@/app/actions/auth";
import { cn } from "@/lib/utils";

const GRADE_OPTIONS = [
  "Class 6",
  "Class 7",
  "Class 8",
  "Class 9",
  "Class 10",
  "Class 11",
  "Class 12",
  "College",
  "Working professional",
  "Other",
];

const SUBJECT_OPTIONS = [
  "Mathematics",
  "Science",
  "Physics",
  "Chemistry",
  "Biology",
  "English",
  "Social Science",
  "Computer Science",
  "Commerce",
];

export interface StudentProfileData {
  id: string;
  email: string;
  full_name: string;
  phone: string | null;
  grade: string | null;
  subjects: string[] | null;
  created_at: string;
}

interface StudentProfileClientProps {
  profile: StudentProfileData;
}

export function StudentProfileClient({ profile }: StudentProfileClientProps) {
  const router = useRouter();

  // Profile Form state
  const [fullName, setFullName] = useState(profile.full_name);
  const [phone, setPhone] = useState(profile.phone || "");
  const [grade, setGrade] = useState(profile.grade || "");
  const [selectedSubjects, setSelectedSubjects] = useState<string[]>(
    profile.subjects || []
  );
  const [isSavingProfile, setIsSavingProfile] = useState(false);

  // Password state
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isChangingPassword, setIsChangingPassword] = useState(false);

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

  const handleToggleSubject = (sub: string) => {
    setSelectedSubjects((prev) =>
      prev.includes(sub) ? prev.filter((s) => s !== sub) : [...prev, sub]
    );
  };

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!fullName.trim()) {
      toast.error("Full name is required");
      return;
    }

    setIsSavingProfile(true);
    try {
      const res = await updateStudentProfileAction({
        fullName: fullName.trim(),
        phone: phone.trim() || undefined,
        grade: grade || undefined,
        subjects: selectedSubjects,
      });

      if (res.error) {
        toast.error(res.error);
      } else {
        toast.success("Profile updated successfully!");
        router.refresh();
      }
    } catch (err: unknown) {
      toast.error((err as Error)?.message || "Failed to update profile");
    } finally {
      setIsSavingProfile(false);
    }
  };

  const handleChangePassword = async (e: React.FormEvent) => {
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
      toast.error("Passwords do not match");
      return;
    }

    setIsChangingPassword(true);
    try {
      const res = await changeStudentPasswordAction({
        currentPassword,
        newPassword,
      });

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
    } finally {
      setIsChangingPassword(false);
    }
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
    : "ST";

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
              title="Active Student Account"
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
                <GraduationCap className="w-3.5 h-3.5" />
                <span>Student Account</span>
              </span>

              {profile.grade && (
                <span className="inline-flex items-center gap-1.5 text-xs font-medium px-3 py-1 rounded-full bg-bg text-ink border border-border/60">
                  <Award className="w-3.5 h-3.5 text-primary" />
                  <span>{profile.grade}</span>
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Member Since Strip */}
        <div className="pt-4 border-t border-border/60 flex items-center justify-between text-xs text-muted">
          <div className="flex items-center gap-2">
            <Calendar className="w-4 h-4 text-primary" />
            <span>Enrolled since {new Date(profile.created_at).toLocaleDateString()}</span>
          </div>
          <span className="font-mono text-[11px] text-emerald-600 bg-emerald-500/10 px-2.5 py-0.5 rounded-full font-semibold">
            Active Student
          </span>
        </div>
      </section>

      {/* =================================================================== */}
      {/* 2. LEARNING JOURNEY SNAPSHOT (Speech AI Step Sequence) */}
      {/* =================================================================== */}
      <section className="bg-surface rounded-3xl p-6 sm:p-7 border border-border/80 shadow-xs space-y-4">
        <div>
          <span className="text-[11px] font-semibold text-primary uppercase tracking-wider block mb-1">
            Learning Pathway
          </span>
          <h2 className="font-serif text-lg sm:text-xl font-bold text-ink tracking-tight">
            Learning Journey Snapshot
          </h2>
          <p className="text-xs text-muted">
            Track your coursework progress across enrolled classes.
          </p>
        </div>

        {/* Horizontal Milestone Sequence */}
        <div className="pt-4 pb-2">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            <div className="p-3.5 rounded-2xl bg-bg border border-border/60 space-y-1">
              <span className="text-[10px] font-bold uppercase tracking-wider text-muted">Milestone 1</span>
              <p className="font-serif text-sm font-bold text-ink">Joined Class</p>
              <p className="text-[11px] text-emerald-600 font-semibold flex items-center gap-1">
                <Check className="w-3 h-3" /> Enrolled
              </p>
            </div>

            <div className="p-3.5 rounded-2xl bg-bg border border-border/60 space-y-1">
              <span className="text-[10px] font-bold uppercase tracking-wider text-muted">Milestone 2</span>
              <p className="font-serif text-sm font-bold text-ink">Study Notes</p>
              <p className="text-[11px] text-emerald-600 font-semibold flex items-center gap-1">
                <Check className="w-3 h-3" /> Reading
              </p>
            </div>

            <div className="p-3.5 rounded-2xl bg-bg border border-border/60 space-y-1">
              <span className="text-[10px] font-bold uppercase tracking-wider text-muted">Milestone 3</span>
              <p className="font-serif text-sm font-bold text-ink">Timed Quizzes</p>
              <p className="text-[11px] text-primary font-semibold">Active</p>
            </div>

            <div className="p-3.5 rounded-2xl bg-bg border border-border/60 space-y-1">
              <span className="text-[10px] font-bold uppercase tracking-wider text-muted">Milestone 4</span>
              <p className="font-serif text-sm font-bold text-ink">Homework</p>
              <p className="text-[11px] text-primary font-semibold">Submitting</p>
            </div>
          </div>
        </div>
      </section>

      {/* =================================================================== */}
      {/* 3. EDIT PROFILE & GRADE */}
      {/* =================================================================== */}
      <section className="bg-surface rounded-3xl p-6 sm:p-7 border border-border/80 shadow-xs space-y-5">
        <div className="border-b border-border/60 pb-3">
          <h2 className="font-serif text-lg font-bold text-ink">
            Personal &amp; Academic Details
          </h2>
          <p className="text-xs text-muted">
            Keep your display name and academic level up to date.
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
                placeholder="Rohan Sharma"
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
            <Label htmlFor="grade" className="text-xs font-semibold text-ink">
              Grade / Academic Level
            </Label>
            <Select value={grade} onValueChange={(val) => setGrade(val || "")}>
              <SelectTrigger id="grade" className="h-10 text-xs rounded-xl">
                <SelectValue placeholder="Select your grade" />
              </SelectTrigger>
              <SelectContent className="rounded-xl">
                {GRADE_OPTIONS.map((g) => (
                  <SelectItem key={g} value={g} className="text-xs">
                    {g}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Subjects Pills */}
          <div className="space-y-2 pt-2">
            <Label className="text-xs font-semibold text-ink">
              Focus Subjects
            </Label>
            <div className="flex flex-wrap gap-1.5">
              {SUBJECT_OPTIONS.map((sub) => {
                const isSelected = selectedSubjects.includes(sub);
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
          </div>

          <div className="pt-2 flex justify-end">
            <Button
              type="submit"
              disabled={isSavingProfile}
              className="bg-primary hover:bg-primary/90 text-primary-foreground font-semibold text-xs h-10 px-6 rounded-xl gap-1.5"
            >
              <Save className="w-3.5 h-3.5" />
              <span>{isSavingProfile ? "Saving..." : "Save Details"}</span>
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
              Add Classy to Mobile Home Screen
            </h3>
          </div>
          <p className="text-xs text-muted max-w-md">
            Install on your phone for a fast, distraction-free app experience. Review quizzes and notes offline.
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
            Ensure your account has a strong password.
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
              disabled={isChangingPassword}
              variant="outline"
              className="text-xs font-semibold h-10 px-5 rounded-xl border-border hover:bg-bg"
            >
              {isChangingPassword ? "Updating..." : "Update Password"}
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
          <p className="text-xs text-muted">End your session on this device.</p>
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
