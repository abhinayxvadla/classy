"use client";

import React, { useState, useEffect, useTransition } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import {
  User,
  Phone,
  Building,
  BookOpen,
  Lock,
  Moon,
  Sun,
  Laptop,
  LogOut,
  Save,
  ShieldCheck,
  Mail,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card } from "@/components/ui/card";
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
  const [isPendingSignOut, startSignOutTransition] = useTransition();

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

  // Theme state
  const [theme, setTheme] = useState<"light" | "dark" | "system">("system");

  useEffect(() => {
    const saved = localStorage.getItem("classy-theme") as "light" | "dark" | "system" | null;
    if (saved) {
      setTheme(saved);
    }
  }, []);

  const handleThemeChange = (newTheme: "light" | "dark" | "system") => {
    setTheme(newTheme);
    localStorage.setItem("classy-theme", newTheme);

    const root = document.documentElement;
    if (newTheme === "dark") {
      root.classList.add("dark");
    } else if (newTheme === "light") {
      root.classList.remove("dark");
    } else {
      if (window.matchMedia("(prefers-color-scheme: dark)").matches) {
        root.classList.add("dark");
      } else {
        root.classList.remove("dark");
      }
    }
    toast.success(`Theme set to ${newTheme}`);
  };

  const toggleSubject = (subj: string) => {
    setSubjects((prev) =>
      prev.includes(subj) ? prev.filter((s) => s !== subj) : [...prev, subj]
    );
  };

  const addCustomSubject = () => {
    const trimmed = customSubject.trim();
    if (!trimmed) return;
    if (!subjects.includes(trimmed)) {
      setSubjects((prev) => [...prev, trimmed]);
    }
    setCustomSubject("");
  };

  const handleUpdateProfile = (e: React.FormEvent) => {
    e.preventDefault();
    if (!fullName.trim()) {
      toast.error("Full name is required.");
      return;
    }

    startProfileTransition(async () => {
      try {
        const res = await updateTutorProfileAction({
          fullName: fullName.trim(),
          phone: phone.trim() || undefined,
          institute: institute.trim() || undefined,
          subjects,
        });

        if (res.error) {
          toast.error(res.error);
        } else {
          toast.success("Profile updated successfully!");
        }
      } catch (err: unknown) {
        toast.error((err as Error)?.message || "Failed to update profile.");
      }
    });
  };

  const handleChangePassword = (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentPassword) {
      toast.error("Current password is required.");
      return;
    }
    if (newPassword.length < 8) {
      toast.error("New password must be at least 8 characters.");
      return;
    }
    if (newPassword !== confirmPassword) {
      toast.error("Passwords do not match.");
      return;
    }

    startPasswordTransition(async () => {
      try {
        const res = await resetPasswordAction(
          {
            currentPassword,
            newPassword,
            confirmPassword,
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
        toast.error((err as Error)?.message || "Failed to change password.");
      }
    });
  };

  const handleSignOut = () => {
    if (!confirm("Are you sure you want to sign out?")) return;

    startSignOutTransition(async () => {
      try {
        await signOutAction();
        toast.success("Signed out successfully.");
        router.push("/tutor/login");
        router.refresh();
      } catch (err: unknown) {
        toast.error((err as Error)?.message || "Failed to sign out.");
      }
    });
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      {/* Page Title */}
      <div>
        <h1 className="font-serif text-2xl sm:text-3xl font-bold text-ink tracking-tight">
          Account Settings
        </h1>
        <p className="text-sm text-muted mt-1">
          Manage your personal details, teaching subjects, security credentials, and preferences.
        </p>
      </div>

      {/* Profile Form */}
      <Card className="p-6 bg-surface border-border shadow-xs">
        <form onSubmit={handleUpdateProfile} className="space-y-6">
          <div className="flex items-center gap-3 pb-4 border-b border-border">
            <div className="h-10 w-10 rounded-xl bg-primary-soft text-primary flex items-center justify-center">
              <User className="h-5 w-5" />
            </div>
            <div>
              <h2 className="font-serif font-bold text-ink text-base">Tutor Profile</h2>
              <p className="text-xs text-muted">Your public teaching profile information.</p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Email (Readonly) */}
            <div className="space-y-1.5">
              <Label className="text-xs font-medium text-muted flex items-center gap-1.5">
                <Mail className="h-3.5 w-3.5" /> Account Email
              </Label>
              <Input
                value={profile.email}
                disabled
                className="h-10 text-sm bg-bg text-muted cursor-not-allowed"
              />
              <span className="text-[11px] text-muted">Email is permanent and used for sign-in.</span>
            </div>

            {/* Full Name */}
            <div className="space-y-1.5">
              <Label htmlFor="tutor-name" className="text-xs font-semibold text-ink">
                Full Name <span className="text-danger">*</span>
              </Label>
              <Input
                id="tutor-name"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                placeholder="Dr. Ramanujan"
                className="h-10 text-sm"
                required
              />
            </div>

            {/* Phone */}
            <div className="space-y-1.5">
              <Label htmlFor="tutor-phone" className="text-xs font-medium text-ink flex items-center gap-1.5">
                <Phone className="h-3.5 w-3.5" /> Phone Number (Optional)
              </Label>
              <Input
                id="tutor-phone"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="+91 9876543210"
                className="h-10 text-sm"
              />
            </div>

            {/* Institute */}
            <div className="space-y-1.5">
              <Label htmlFor="tutor-institute" className="text-xs font-medium text-ink flex items-center gap-1.5">
                <Building className="h-3.5 w-3.5" /> Institute / Academy (Optional)
              </Label>
              <Input
                id="tutor-institute"
                value={institute}
                onChange={(e) => setInstitute(e.target.value)}
                placeholder="e.g. Apex Academy"
                className="h-10 text-sm"
              />
            </div>
          </div>

          {/* Subjects Multi-select Chips */}
          <div className="space-y-2 pt-2">
            <Label className="text-xs font-semibold text-ink flex items-center gap-1.5">
              <BookOpen className="h-3.5 w-3.5 text-primary" /> Subjects You Teach
            </Label>
            <div className="flex flex-wrap gap-2 pt-1">
              {COMMON_SUBJECTS.map((subj) => {
                const selected = subjects.includes(subj);
                return (
                  <button
                    key={subj}
                    type="button"
                    onClick={() => toggleSubject(subj)}
                    className={cn(
                      "px-3 py-1.5 rounded-full text-xs font-medium border transition-all",
                      selected
                        ? "bg-primary text-primary-foreground border-primary shadow-xs"
                        : "bg-bg text-ink border-border hover:border-primary/60"
                    )}
                  >
                    {subj} {selected && "✓"}
                  </button>
                );
              })}
              {subjects
                .filter((s) => !COMMON_SUBJECTS.includes(s))
                .map((subj) => (
                  <button
                    key={subj}
                    type="button"
                    onClick={() => toggleSubject(subj)}
                    className="px-3 py-1.5 rounded-full text-xs font-medium bg-primary text-primary-foreground border border-primary shadow-xs"
                  >
                    {subj} ✓
                  </button>
                ))}
            </div>

            {/* Add Custom Subject */}
            <div className="flex items-center gap-2 max-w-xs pt-1">
              <Input
                value={customSubject}
                onChange={(e) => setCustomSubject(e.target.value)}
                placeholder="Add other subject..."
                className="h-8 text-xs"
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault();
                    addCustomSubject();
                  }
                }}
              />
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={addCustomSubject}
                className="h-8 text-xs"
              >
                Add
              </Button>
            </div>
          </div>

          <div className="flex justify-end pt-3 border-t border-border">
            <Button
              type="submit"
              disabled={isPendingProfile}
              className="bg-primary hover:bg-primary/90 text-primary-foreground font-medium gap-2 text-xs"
            >
              <Save className="h-3.5 w-3.5" />
              {isPendingProfile ? "Saving..." : "Save Profile"}
            </Button>
          </div>
        </form>
      </Card>

      {/* Password Change Form */}
      <Card className="p-6 bg-surface border-border shadow-xs">
        <form onSubmit={handleChangePassword} className="space-y-5">
          <div className="flex items-center gap-3 pb-4 border-b border-border">
            <div className="h-10 w-10 rounded-xl bg-accent/10 text-accent flex items-center justify-center">
              <Lock className="h-5 w-5" />
            </div>
            <div>
              <h2 className="font-serif font-bold text-ink text-base">Security & Password</h2>
              <p className="text-xs text-muted">Update your password to keep your account safe.</p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="space-y-1.5">
              <Label htmlFor="curr-pwd" className="text-xs font-medium text-ink">
                Current Password
              </Label>
              <Input
                id="curr-pwd"
                type="password"
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                placeholder="••••••••"
                className="h-10 text-sm"
                required
              />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="new-pwd" className="text-xs font-medium text-ink">
                New Password (min 8 chars)
              </Label>
              <Input
                id="new-pwd"
                type="password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder="••••••••"
                className="h-10 text-sm"
                required
              />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="confirm-pwd" className="text-xs font-medium text-ink">
                Confirm New Password
              </Label>
              <Input
                id="confirm-pwd"
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="••••••••"
                className="h-10 text-sm"
                required
              />
            </div>
          </div>

          <div className="flex justify-end pt-2">
            <Button
              type="submit"
              disabled={isPendingPassword}
              variant="outline"
              className="text-xs gap-1.5"
            >
              <ShieldCheck className="h-3.5 w-3.5 text-primary" />
              {isPendingPassword ? "Updating..." : "Update Password"}
            </Button>
          </div>
        </form>
      </Card>

      {/* Appearance & Preferences */}
      <Card className="p-6 bg-surface border-border shadow-xs space-y-4">
        <div className="flex items-center gap-3 pb-3 border-b border-border">
          <div className="h-10 w-10 rounded-xl bg-primary-soft text-primary flex items-center justify-center">
            <Sun className="h-5 w-5" />
          </div>
          <div>
            <h2 className="font-serif font-bold text-ink text-base">Appearance</h2>
            <p className="text-xs text-muted">Customize how Classy looks on your device.</p>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pt-1">
          <div>
            <div className="text-sm font-semibold text-ink">Theme Mode</div>
            <div className="text-xs text-muted">Switch between Light, Dark, or follow System settings.</div>
          </div>

          <div className="grid grid-cols-3 p-1 bg-bg rounded-xl border border-border text-xs font-medium w-full sm:w-auto">
            <button
              type="button"
              onClick={() => handleThemeChange("light")}
              className={cn(
                "flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-lg transition-all",
                theme === "light" ? "bg-surface text-ink font-semibold shadow-xs" : "text-muted hover:text-ink"
              )}
            >
              <Sun className="h-3.5 w-3.5" /> Light
            </button>
            <button
              type="button"
              onClick={() => handleThemeChange("dark")}
              className={cn(
                "flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-lg transition-all",
                theme === "dark" ? "bg-surface text-ink font-semibold shadow-xs" : "text-muted hover:text-ink"
              )}
            >
              <Moon className="h-3.5 w-3.5" /> Dark
            </button>
            <button
              type="button"
              onClick={() => handleThemeChange("system")}
              className={cn(
                "flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-lg transition-all",
                theme === "system" ? "bg-surface text-ink font-semibold shadow-xs" : "text-muted hover:text-ink"
              )}
            >
              <Laptop className="h-3.5 w-3.5" /> System
            </button>
          </div>
        </div>
      </Card>

      {/* Session / Sign out */}
      <Card className="p-6 bg-surface border-border shadow-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="font-serif font-bold text-ink text-base">Session & Sign Out</h2>
          <p className="text-xs text-muted mt-0.5">
            Signed in as <strong className="text-ink">{profile.email}</strong>.
          </p>
        </div>

        <Button
          onClick={handleSignOut}
          disabled={isPendingSignOut}
          variant="outline"
          className="text-danger hover:bg-danger/10 border-danger/30 text-xs gap-1.5"
        >
          <LogOut className="h-3.5 w-3.5" />
          {isPendingSignOut ? "Signing out..." : "Sign Out"}
        </Button>
      </Card>
    </div>
  );
}
