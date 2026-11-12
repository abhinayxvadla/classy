"use client";

import React from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  LayoutDashboard,
  Users,
  Layers,
  User,
  BookOpen,
  Home,
  LogOut,
  Shield,
} from "lucide-react";
import { APP_NAME } from "@/lib/config";
import { ThemeToggle } from "@/components/theme-toggle";
import { signOutAction } from "@/app/actions/auth";
import { cn } from "@/lib/utils";

interface NavItem {
  label: string;
  href: string;
  icon: React.ComponentType<{ className?: string }>;
}

interface AppShellProps {
  role: "tutor" | "student";
  userName?: string;
  userEmail?: string;
  subtitle?: string;
  isAdmin?: boolean;
  hideNav?: boolean;
  children: React.ReactNode;
}

export function AppShell({
  role,
  userName = "User",
  userEmail,
  subtitle,
  isAdmin = false,
  hideNav = false,
  children,
}: AppShellProps) {
  const pathname = usePathname();
  const router = useRouter();

  const handleSignOut = async () => {
    await signOutAction();
    router.push("/");
    router.refresh();
  };

  const tutorNavItems: NavItem[] = [
    { label: "Dashboard", href: "/t", icon: LayoutDashboard },
    { label: "Batches", href: "/t/batches", icon: Users },
    { label: "Integrations", href: "/t/connect", icon: Layers },
    { label: "Account", href: "/t/account", icon: User },
  ];

  const studentNavItems: NavItem[] = [
    { label: "Home", href: "/s", icon: Home },
    { label: "Batches", href: "/s/batches", icon: Users },
    { label: "Library", href: "/s/library", icon: BookOpen },
    { label: "Profile", href: "/s/profile", icon: User },
  ];

  const navItems = role === "tutor" ? tutorNavItems : studentNavItems;

  const isExactActive = (href: string) => {
    if (href === "/t" || href === "/s") return pathname === href;
    return pathname.startsWith(href);
  };

  const initials = userName
    ? userName
        .split(" ")
        .map((n) => n[0])
        .join("")
        .toUpperCase()
        .slice(0, 2)
    : "CL";

  return (
    <div className="min-h-screen bg-bg text-ink flex flex-col md:flex-row w-full max-w-full selection:bg-primary-soft selection:text-primary">
      {/* ================= DESKTOP & TABLET FIXED SIDEBAR (md+) ================= */}
      {!hideNav && (
        <aside className="hidden md:flex flex-col md:w-60 lg:w-64 bg-surface border-r border-border fixed inset-y-0 left-0 h-screen z-30 select-none overflow-hidden justify-between">
          {/* Top: Brand Header */}
          <div className="p-5 lg:p-6 border-b border-border/80 flex items-center justify-between shrink-0">
            <Link
              href={role === "tutor" ? "/t" : "/s"}
              className="flex items-center gap-2.5 text-ink hover:opacity-90 transition-opacity"
            >
              <div className="w-8 h-8 rounded-xl bg-primary text-primary-foreground flex items-center justify-center font-bold shadow-xs">
                <span className="font-serif text-base leading-none">C</span>
              </div>
              <div>
                <div className="flex items-center gap-1.5">
                  <span className="font-serif italic font-bold text-lg tracking-tight text-ink">
                    {APP_NAME}
                  </span>
                  <span className="capitalize px-1.5 py-0.2 rounded-full text-[9px] font-semibold bg-primary-soft text-primary border border-primary/10">
                    {role}
                  </span>
                </div>
                <p className="text-[10px] text-muted font-medium truncate mt-0.5 max-w-[130px]">
                  {subtitle || (role === "tutor" ? "Educator Hub" : "Student Portal")}
                </p>
              </div>
            </Link>
            <ThemeToggle />
          </div>

          {/* Middle: Navigation Links */}
          <nav className="flex-1 px-3 py-5 space-y-1.5 overflow-y-auto">
            {navItems.map((item) => {
              const Icon = item.icon;
              const active = isExactActive(item.href);
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cn(
                    "relative flex items-center gap-3 px-3.5 py-2.5 rounded-xl font-medium text-xs transition-all duration-150",
                    active
                      ? "bg-primary-soft text-primary font-semibold shadow-2xs"
                      : "text-muted hover:bg-bg hover:text-ink"
                  )}
                >
                  <Icon
                    className={cn(
                      "w-4 h-4 shrink-0 transition-colors",
                      active ? "text-primary" : "text-muted"
                    )}
                  />
                  <span>{item.label}</span>
                </Link>
              );
            })}

            {isAdmin && (
              <Link
                href="/admin"
                className={cn(
                  "relative flex items-center gap-3 px-3.5 py-2.5 rounded-xl font-medium text-xs text-primary hover:bg-primary-soft/50 transition-colors mt-4 border border-primary/20",
                  pathname.startsWith("/admin") && "bg-primary-soft font-semibold"
                )}
              >
                <Shield className="w-4 h-4 text-primary shrink-0" />
                <span>Founder Dashboard</span>
              </Link>
            )}
          </nav>

          {/* Bottom: User Profile Snapshot & Sign Out */}
          <div className="p-3.5 lg:p-4 border-t border-border/80 bg-bg/50 shrink-0 space-y-2.5">
            <Link
              href={role === "tutor" ? "/t/account" : "/s/profile"}
              className="flex items-center gap-2.5 p-1 rounded-xl hover:bg-surface transition-colors cursor-pointer"
            >
              <div className="relative shrink-0">
                <div className="w-8 h-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center font-bold text-xs shadow-xs">
                  {initials}
                </div>
                <div
                  className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 rounded-full bg-emerald-500 border-2 border-surface"
                  title="Active"
                />
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-xs font-semibold text-ink truncate leading-tight">
                  {userName}
                </p>
                <p className="text-[10px] text-muted truncate mt-0.5">
                  {userEmail || (role === "tutor" ? "Tutor Account" : "Student Account")}
                </p>
              </div>
            </Link>

            <button
              type="button"
              onClick={handleSignOut}
              className="w-full flex items-center justify-center gap-2 px-3 py-1.5 text-xs font-semibold text-muted hover:text-danger hover:bg-danger/10 rounded-xl transition-colors border border-border/60 bg-surface cursor-pointer"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span>Sign Out</span>
            </button>
          </div>
        </aside>
      )}

      {/* ================= MOBILE TOP HEADER (< md) ================= */}
      {!hideNav && (
        <header className="md:hidden sticky top-0 z-30 bg-surface/95 backdrop-blur-md border-b border-border px-4 py-3 flex items-center justify-between shadow-xs shrink-0">
          <Link
            href={role === "tutor" ? "/t" : "/s"}
            className="flex items-center gap-2 text-ink"
          >
            <div className="w-7 h-7 rounded-lg bg-primary text-primary-foreground flex items-center justify-center font-bold text-xs shadow-xs">
              <span className="font-serif">C</span>
            </div>
            <span className="font-serif italic font-bold text-lg text-ink">
              {APP_NAME}
            </span>
            <span className="capitalize px-1.5 py-0.2 rounded-full text-[9px] font-semibold bg-primary-soft text-primary border border-primary/10">
              {role}
            </span>
          </Link>

          <div className="flex items-center gap-2">
            <ThemeToggle />
            <Link
              href={role === "tutor" ? "/t/account" : "/s/profile"}
              className="w-8 h-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center font-bold text-xs shadow-xs active:scale-95 transition-transform"
              title="Profile & Settings"
            >
              {initials}
            </Link>
          </div>
        </header>
      )}

      {/* ================= MAIN CONTENT CANVAS ================= */}
      <main
        className={cn(
          "flex-1 min-w-0 md:h-full md:overflow-y-auto px-4 sm:px-6 lg:px-8 max-w-6xl mx-auto w-full",
          !hideNav
            ? "md:ml-60 lg:ml-64 pb-28 sm:pb-32 md:pb-12 pt-4 md:pt-8"
            : "py-6 sm:py-10 max-w-4xl"
        )}
      >
        {children}
      </main>

      {/* ================= MOBILE FLOATING BOTTOM DOCK (< md) ================= */}
      {!hideNav && (
        <nav
          aria-label="Mobile Floating Navigation"
          className="md:hidden fixed z-40 left-3 right-3 sm:left-4 sm:right-4 max-w-md mx-auto bg-surface/95 backdrop-blur-md border border-border rounded-2xl shadow-dock overflow-hidden"
          style={{ bottom: "calc(0.75rem + env(safe-area-inset-bottom, 0px))" }}
        >
          <div className="grid grid-cols-4 h-15 items-center px-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              const active = isExactActive(item.href);
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cn(
                    "flex flex-col items-center justify-center py-1 select-none transition-colors duration-150 min-w-0",
                    active
                      ? "text-primary font-bold"
                      : "text-muted hover:text-ink font-medium"
                  )}
                >
                  <div
                    className={cn(
                      "p-1.5 rounded-xl transition-all",
                      active ? "bg-primary-soft text-primary" : ""
                    )}
                  >
                    <Icon
                      className={cn(
                        "w-4 h-4",
                        active ? "text-primary stroke-[2.3]" : "text-muted stroke-[1.8]"
                      )}
                    />
                  </div>
                  <span className="text-[10px] mt-0.5 leading-tight truncate px-0.5">
                    {item.label}
                  </span>
                </Link>
              );
            })}
          </div>
        </nav>
      )}
    </div>
  );
}
