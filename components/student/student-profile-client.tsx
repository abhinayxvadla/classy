"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import {
  User,
  Lock,
  Sun,
  Moon,
  Laptop,
  Download,
  LogOut,
  Save,
  CheckCircle2,
  Eye,
  EyeOff,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
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
  "Maths",
  "Science",
  "Physics",
  "Chemistry",
  "Biology",
  "English",
  "Social Science",
  "Computer Science",
  "Commerce",
  "Other",
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

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
}

export function StudentProfileClient({ profile }: StudentProfileClientProps) {
  const router = useRouter();

  // Profile Form state
  const [fullName, setFullName] = React.useState(profile.full_name);
  const [phone, setPhone] = React.useState(profile.phone || "");
  const [grade, setGrade] = React.useState(profile.grade || "");
  const [selectedSubjects, setSelectedSubjects] = React.useState<string[]>(
    profile.subjects || []
  );
  const [isSavingProfile, setIsSavingProfile] = React.useState(false);

  // Password state
  const [currentPassword, setCurrentPassword] = React.useState("");
  const [newPassword, setNewPassword] = React.useState("");
  const [confirmPassword, setConfirmPassword] = React.useState("");
  const [showCurrentPassword, setShowCurrentPassword] = React.useState(false);
  const [showNewPassword, setShowNewPassword] = React.useState(false);
  const [isChangingPassword, setIsChangingPassword] = React.useState(false);

  // Theme state
  const [theme, setTheme] = React.useState<"light" | "dark" | "system">("system");

  // PWA install prompt state
  const [installPrompt, setInstallPrompt] = React.useState<BeforeInstallPromptEvent | null>(null);
  const [isInstalled, setIsInstalled] = React.useState(false);

  React.useEffect(() => {
    // Detect theme
    if (typeof window !== "undefined") {
      const isDark = document.documentElement.classList.contains("dark");
      setTheme(isDark ? "dark" : "light");

      // Check PWA display mode
      if (window.matchMedia("(display-mode: standalone)").matches) {
        setIsInstalled(true);
      }

      const handleBeforeInstall = (e: Event) => {
        e.preventDefault();
        setInstallPrompt(e as BeforeInstallPromptEvent);
      };

      window.addEventListener("beforeinstallprompt", handleBeforeInstall);
      return () => window.removeEventListener("beforeinstallprompt", handleBeforeInstall);
    }
  }, []);

  const handleThemeChange = (newTheme: "light" | "dark" | "system") => {
    setTheme(newTheme);
    if (typeof window === "undefined") return;

    if (newTheme === "dark") {
      document.documentElement.classList.add("dark");
      localStorage.setItem("theme", "dark");
    } else if (newTheme === "light") {
      document.documentElement.classList.remove("dark");
      localStorage.setItem("theme", "light");
    } else {
      localStorage.removeItem("theme");
      if (window.matchMedia("(prefers-color-scheme: dark)").matches) {
        document.documentElement.classList.add("dark");
      } else {
        document.documentElement.classList.remove("dark");
      }
    }
  };

  const handleToggleSubject = (sub: string) => {
    setSelectedSubjects((prev) =>
      prev.includes(sub) ? prev.filter((s) => s !== sub) : [...prev, sub]
    );
  };

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!fullName.trim() || fullName.trim().length < 2) {
      toast.error("Full name must be at least 2 characters.");
      return;
    }

    setIsSavingProfile(true);
    try {
      const res = await updateStudentProfileAction({
        fullName,
        phone,
        grade,
        subjects: selectedSubjects,
      });

      if (res.error) {
        toast.error(res.error);
        return;
      }

      toast.success("Profile updated successfully!");
    } catch {
      toast.error("Failed to update profile.");
    } finally {
      setIsSavingProfile(false);
    }
  };

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!currentPassword) {
      toast.error("Please enter your current password.");
      return;
    }

    if (newPassword.length < 8) {
      toast.error("New password must be at least 8 characters.");
      return;
    }

    if (!/[a-zA-Z]/.test(newPassword) || !/[0-9]/.test(newPassword)) {
      toast.error("New password must contain both letters and numbers.");
      return;
    }

    if (newPassword !== confirmPassword) {
      toast.error("New passwords do not match.");
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
        return;
      }

      toast.success("Password changed successfully!");
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
    } catch {
      toast.error("Failed to change password.");
    } finally {
      setIsChangingPassword(false);
    }
  };

  const handleInstallApp = async () => {
    if (installPrompt) {
      installPrompt.prompt();
      const choiceResult = await installPrompt.userChoice;
      if (choiceResult.outcome === "accepted") {
        toast.success("Thank you for installing Classy!");
        setIsInstalled(true);
      }
      setInstallPrompt(null);
    } else {
      toast.info(
        "To install Classy, tap the Share or Menu button in your browser and select 'Add to Home Screen'."
      );
    }
  };

  const handleSignOut = async () => {
    await signOutAction();
    router.push("/");
    router.refresh();
  };

  return (
    <div className="w-full max-w-3xl mx-auto space-y-8 pb-16">
      {/* Page Title */}
      <div className="space-y-1">
        <h1 className="font-serif text-3xl sm:text-4xl font-bold tracking-tight text-ink">
          Student Profile
        </h1>
        <p className="text-sm text-muted">
          Manage your personal details, learning subjects, password, and app preferences.
        </p>
      </div>

      {/* 1. Profile Details Card */}
      <Card className="rounded-3xl border-border bg-surface shadow-xs p-6 sm:p-8 space-y-6">
        <div className="flex items-center gap-3 pb-4 border-b border-border">
          <div className="h-10 w-10 rounded-xl bg-primary-soft text-primary flex items-center justify-center">
            <User className="h-5 w-5" />
          </div>
          <div>
            <h2 className="font-serif text-lg font-bold text-ink">
              Personal Information
            </h2>
            <p className="text-xs text-muted">
              Used to identify you in your tutor&apos;s batches.
            </p>
          </div>
        </div>

        <form onSubmit={handleSaveProfile} className="space-y-5">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="fullName" className="text-xs font-semibold text-ink">
                Full Name
              </Label>
              <Input
                id="fullName"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                required
                className="bg-bg border-border rounded-xl text-sm h-11"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="email" className="text-xs font-semibold text-muted">
                Email Address (Read-only)
              </Label>
              <Input
                id="email"
                value={profile.email}
                disabled
                className="bg-bg/50 border-border text-muted rounded-xl text-sm h-11 cursor-not-allowed"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="phone" className="text-xs font-semibold text-ink">
                Phone Number
              </Label>
              <Input
                id="phone"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="e.g. 9876543210"
                className="bg-bg border-border rounded-xl text-sm h-11"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="grade" className="text-xs font-semibold text-ink">
                Grade / Class
              </Label>
              <Select value={grade} onValueChange={(val) => setGrade(val || "")}>
                <SelectTrigger className="bg-bg border-border rounded-xl text-sm h-11">
                  <SelectValue placeholder="Select your grade" />
                </SelectTrigger>
                <SelectContent className="rounded-xl bg-surface">
                  {GRADE_OPTIONS.map((g) => (
                    <SelectItem key={g} value={g} className="text-sm">
                      {g}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Subjects Chips */}
          <div className="space-y-2.5 pt-2">
            <Label className="text-xs font-semibold text-ink block">
              Subjects You Study
            </Label>
            <p className="text-xs text-muted">
              Select your subjects to personalize recommendations in the free public library.
            </p>

            <div className="flex flex-wrap gap-2 pt-1">
              {SUBJECT_OPTIONS.map((sub) => {
                const isSelected = selectedSubjects.includes(sub);
                return (
                  <button
                    key={sub}
                    type="button"
                    onClick={() => handleToggleSubject(sub)}
                    className={`px-3 py-1.5 rounded-full text-xs font-medium transition-all cursor-pointer ${
                      isSelected
                        ? "bg-primary text-white shadow-2xs"
                        : "bg-bg text-muted border border-border hover:border-ink/40"
                    }`}
                  >
                    {sub}
                  </button>
                );
              })}
            </div>
          </div>

          <div className="flex justify-end pt-3">
            <Button
              type="submit"
              disabled={isSavingProfile}
              className="rounded-xl text-xs font-semibold px-6 gap-1.5 bg-primary text-white"
            >
              <Save className="h-4 w-4" />
              <span>{isSavingProfile ? "Saving Changes..." : "Save Changes"}</span>
            </Button>
          </div>
        </form>
      </Card>

      {/* 2. Change Password Card */}
      <Card className="rounded-3xl border-border bg-surface shadow-xs p-6 sm:p-8 space-y-6">
        <div className="flex items-center gap-3 pb-4 border-b border-border">
          <div className="h-10 w-10 rounded-xl bg-accent/20 text-accent-dark flex items-center justify-center">
            <Lock className="h-5 w-5 text-accent" />
          </div>
          <div>
            <h2 className="font-serif text-lg font-bold text-ink">
              Change Password
            </h2>
            <p className="text-xs text-muted">
              Keep your account safe with a strong, unique password.
            </p>
          </div>
        </div>

        <form onSubmit={handleChangePassword} className="space-y-4 max-w-md">
          <div className="space-y-2">
            <Label htmlFor="currentPassword" className="text-xs font-semibold text-ink">
              Current Password
            </Label>
            <div className="relative">
              <Input
                id="currentPassword"
                type={showCurrentPassword ? "text" : "password"}
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                required
                className="bg-bg border-border rounded-xl text-sm h-11 pr-10"
              />
              <button
                type="button"
                onClick={() => setShowCurrentPassword((prev) => !prev)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted hover:text-ink cursor-pointer"
              >
                {showCurrentPassword ? (
                  <EyeOff className="h-4 w-4" />
                ) : (
                  <Eye className="h-4 w-4" />
                )}
              </button>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="newPassword" className="text-xs font-semibold text-ink">
              New Password (min 8 chars, 1 letter + 1 number)
            </Label>
            <div className="relative">
              <Input
                id="newPassword"
                type={showNewPassword ? "text" : "password"}
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                required
                className="bg-bg border-border rounded-xl text-sm h-11 pr-10"
              />
              <button
                type="button"
                onClick={() => setShowNewPassword((prev) => !prev)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted hover:text-ink cursor-pointer"
              >
                {showNewPassword ? (
                  <EyeOff className="h-4 w-4" />
                ) : (
                  <Eye className="h-4 w-4" />
                )}
              </button>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="confirmPassword" className="text-xs font-semibold text-ink">
              Confirm New Password
            </Label>
            <Input
              id="confirmPassword"
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
              className="bg-bg border-border rounded-xl text-sm h-11"
            />
          </div>

          <div className="pt-2">
            <Button
              type="submit"
              disabled={isChangingPassword}
              className="rounded-xl text-xs font-semibold px-6"
            >
              {isChangingPassword ? "Updating..." : "Update Password"}
            </Button>
          </div>
        </form>
      </Card>

      {/* 3. Appearance & App Settings */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {/* Theme Settings */}
        <Card className="rounded-3xl border-border bg-surface shadow-xs p-6 space-y-4">
          <div className="space-y-1">
            <h3 className="font-serif font-bold text-ink text-base">
              Theme Mode
            </h3>
            <p className="text-xs text-muted">
              Choose your preferred appearance.
            </p>
          </div>

          <div className="flex items-center gap-2 pt-1">
            <button
              type="button"
              onClick={() => handleThemeChange("light")}
              className={`flex-1 p-3 rounded-xl border flex flex-col items-center gap-2 text-xs font-semibold cursor-pointer transition-all ${
                theme === "light"
                  ? "bg-primary-soft text-primary border-primary"
                  : "bg-bg text-muted border-border hover:text-ink"
              }`}
            >
              <Sun className="h-4 w-4" />
              <span>Light</span>
            </button>

            <button
              type="button"
              onClick={() => handleThemeChange("dark")}
              className={`flex-1 p-3 rounded-xl border flex flex-col items-center gap-2 text-xs font-semibold cursor-pointer transition-all ${
                theme === "dark"
                  ? "bg-primary-soft text-primary border-primary"
                  : "bg-bg text-muted border-border hover:text-ink"
              }`}
            >
              <Moon className="h-4 w-4" />
              <span>Dark</span>
            </button>

            <button
              type="button"
              onClick={() => handleThemeChange("system")}
              className={`flex-1 p-3 rounded-xl border flex flex-col items-center gap-2 text-xs font-semibold cursor-pointer transition-all ${
                theme === "system"
                  ? "bg-primary-soft text-primary border-primary"
                  : "bg-bg text-muted border-border hover:text-ink"
              }`}
            >
              <Laptop className="h-4 w-4" />
              <span>System</span>
            </button>
          </div>
        </Card>

        {/* Install PWA App */}
        <Card className="rounded-3xl border-border bg-surface shadow-xs p-6 space-y-4 flex flex-col justify-between">
          <div className="space-y-1">
            <h3 className="font-serif font-bold text-ink text-base">
              Install Classy App
            </h3>
            <p className="text-xs text-muted">
              Install Classy on your home screen for quick offline access to quizzes and notes.
            </p>
          </div>

          <div>
            {isInstalled ? (
              <Badge className="bg-success/15 text-success border-transparent text-xs font-medium gap-1 py-1.5 px-3">
                <CheckCircle2 className="h-3.5 w-3.5" /> App is Installed
              </Badge>
            ) : (
              <Button
                type="button"
                variant="outline"
                onClick={handleInstallApp}
                className="rounded-xl text-xs font-semibold gap-1.5 w-full sm:w-auto"
              >
                <Download className="h-4 w-4" />
                <span>Install Web App</span>
              </Button>
            )}
          </div>
        </Card>
      </div>

      {/* 4. Sign Out Card */}
      <Card className="rounded-3xl border-border bg-surface shadow-xs p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="space-y-1">
          <h3 className="font-serif font-bold text-ink text-base">
            Sign Out
          </h3>
          <p className="text-xs text-muted">
            Signed in as {profile.email}
          </p>
        </div>

        <Button
          type="button"
          variant="destructive"
          onClick={handleSignOut}
          className="rounded-xl text-xs font-semibold gap-1.5 self-start sm:self-auto"
        >
          <LogOut className="h-4 w-4" />
          <span>Sign Out</span>
        </Button>
      </Card>
    </div>
  );
}
