"use client";

import * as React from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  GraduationCap,
  LayoutDashboard,
  Users,
  Bot,
  User,
  BookOpen,
  Home,
  LogOut,
  ChevronDown,
  ArrowRight,
  Menu,
  X,
} from "lucide-react";
import { APP_NAME } from "@/lib/config";
import { ThemeToggle } from "@/components/theme-toggle";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { signOutAction } from "@/app/actions/auth";
import { cn } from "@/lib/utils";
import { buttonVariants } from "@/components/ui/button";

interface FloatingNavProps {
  role?: "tutor" | "student" | "public";
  userName?: string;
  userEmail?: string;
}

export function FloatingNav({
  role = "public",
  userName = "User",
  userEmail,
}: FloatingNavProps) {
  const pathname = usePathname();
  const router = useRouter();
  const [mobileMenuOpen, setMobileMenuOpen] = React.useState(false);

  const handleSignOut = async () => {
    await signOutAction();
    router.push("/");
    router.refresh();
  };

  const tutorLinks = [
    { label: "Dashboard", href: "/t", icon: LayoutDashboard },
    { label: "Batches", href: "/t/batches", icon: Users },
    { label: "Assistant", href: "/t/connect", icon: Bot },
    { label: "Account", href: "/t/account", icon: User },
  ];

  const studentLinks = [
    { label: "Home", href: "/s", icon: Home },
    { label: "Batches", href: "/s/batches", icon: Users },
    { label: "Library", href: "/s/library", icon: BookOpen },
    { label: "Profile", href: "/s/profile", icon: User },
  ];

  const publicNavLinks = [
    { label: "How It Works", href: "#how-it-works" },
    { label: "Tutor Platform", href: "#capabilities" },
    { label: "The Difference", href: "#the-difference" },
    { label: "Pricing", href: "#pricing" },
    { label: "FAQ", href: "#faq" },
  ];

  const activeLinks =
    role === "tutor"
      ? tutorLinks
      : role === "student"
      ? studentLinks
      : [];

  const initials = userName
    ? userName
        .split(" ")
        .map((n) => n[0])
        .join("")
        .toUpperCase()
        .slice(0, 2)
    : "CL";

  return (
    <>
      {/* ================= STICKY TOP NAVBAR ================= */}
      <header className="sticky top-0 z-50 w-full backdrop-blur-md bg-surface/90 border-b border-border/70 transition-colors">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-4">
          {/* Brand Mark */}
          <Link
            href={role === "tutor" ? "/t" : role === "student" ? "/s" : "/"}
            className="flex items-center gap-2.5 text-ink hover:opacity-90 transition-opacity shrink-0"
          >
            <div className="w-8 h-8 rounded-xl bg-primary text-primary-foreground flex items-center justify-center font-bold shadow-xs">
              <span className="font-serif text-base leading-none">C</span>
            </div>
            <div className="flex items-baseline gap-1.5">
              <span className="font-serif font-bold text-xl tracking-tight text-ink">
                {APP_NAME}
              </span>
              {role !== "public" && (
                <span className="capitalize px-2 py-0.5 rounded-full text-[10px] font-semibold bg-primary-soft text-primary border border-primary/10">
                  {role}
                </span>
              )}
            </div>
          </Link>

          {/* Desktop Public Nav Links */}
          {role === "public" ? (
            <nav className="hidden md:flex items-center gap-1 text-xs font-medium text-muted">
              {publicNavLinks.map((link) => (
                <a
                  key={link.label}
                  href={link.href}
                  className="px-3 py-1.5 rounded-lg text-muted hover:text-ink transition-colors hover:bg-bg"
                >
                  {link.label}
                </a>
              ))}
            </nav>
          ) : (
            /* Desktop Stakeholder Navigation Links */
            <nav className="hidden md:flex items-center gap-1 text-xs font-medium">
              {activeLinks.map((item) => {
                const isActive =
                  item.href === "/t" || item.href === "/s"
                    ? pathname === item.href
                    : pathname.startsWith(item.href);
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={cn(
                      "px-3 py-1.5 rounded-lg transition-colors",
                      isActive
                        ? "bg-primary-soft text-primary font-semibold"
                        : "text-muted hover:text-ink hover:bg-bg"
                    )}
                  >
                    {item.label}
                  </Link>
                );
              })}
            </nav>
          )}

          {/* Right Action Buttons */}
          <div className="flex items-center gap-2">
            <ThemeToggle />

            {role === "public" ? (
              <div className="hidden sm:flex items-center gap-2">
                <Link
                  href="/student/login"
                  className={buttonVariants({
                    variant: "ghost",
                    size: "sm",
                    className: "text-xs font-medium text-muted hover:text-ink h-9",
                  })}
                >
                  Student Portal
                </Link>
                <Link
                  href="/tutor/login"
                  className={buttonVariants({
                    variant: "outline",
                    size: "sm",
                    className: "text-xs font-semibold h-9 rounded-xl border-border hover:bg-bg",
                  })}
                >
                  Tutor Sign In
                </Link>
                <Link
                  href="/tutor/register"
                  className={buttonVariants({
                    size: "sm",
                    className: "bg-primary hover:bg-primary/90 text-primary-foreground text-xs font-semibold h-9 px-4 rounded-xl shadow-xs gap-1.5",
                  })}
                >
                  <span>Become a Tutor</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            ) : (
              /* User Avatar Menu */
              <DropdownMenu>
                <DropdownMenuTrigger
                  className="flex items-center gap-2 p-1 pl-1.5 pr-2.5 rounded-full hover:bg-bg transition-colors cursor-pointer border border-border/60 focus:outline-hidden"
                  aria-label="User account menu"
                >
                  <Avatar className="w-7 h-7 bg-primary text-primary-foreground text-xs font-bold">
                    <AvatarFallback className="bg-primary text-primary-foreground text-xs font-bold">
                      {initials}
                    </AvatarFallback>
                  </Avatar>
                  <span className="text-xs font-medium text-ink max-w-[100px] truncate hidden lg:inline">
                    {userName}
                  </span>
                  <ChevronDown className="w-3 h-3 text-muted" />
                </DropdownMenuTrigger>
                <DropdownMenuContent
                  align="end"
                  className="w-56 rounded-2xl p-2 shadow-lg border border-border bg-surface"
                >
                  <DropdownMenuLabel className="font-normal p-2">
                    <div className="flex flex-col space-y-0.5">
                      <p className="text-sm font-semibold text-ink truncate">
                        {userName}
                      </p>
                      {userEmail && (
                        <p className="text-xs text-muted truncate">
                          {userEmail}
                        </p>
                      )}
                      <span className="inline-flex mt-1 w-fit items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold uppercase tracking-wider bg-primary-soft text-primary">
                        {role} account
                      </span>
                    </div>
                  </DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem
                    onClick={() => router.push(role === "tutor" ? "/t/account" : "/s/profile")}
                    className="rounded-xl cursor-pointer flex items-center gap-2 text-xs"
                  >
                    <User className="w-3.5 h-3.5" />
                    <span>Profile &amp; Settings</span>
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    onClick={() => router.push("/reset-password")}
                    className="rounded-xl cursor-pointer flex items-center gap-2 text-xs"
                  >
                    <GraduationCap className="w-3.5 h-3.5" />
                    <span>Security &amp; Password</span>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem
                    onClick={handleSignOut}
                    className="rounded-xl text-destructive focus:text-destructive focus:bg-destructive/10 cursor-pointer text-xs flex items-center gap-2"
                  >
                    <LogOut className="w-3.5 h-3.5" />
                    <span>Sign Out</span>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            )}

            {/* Mobile Menu Toggle (Public Only) */}
            {role === "public" && (
              <button
                type="button"
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="md:hidden p-2 rounded-lg text-muted hover:text-ink hover:bg-bg"
                aria-label="Toggle menu"
              >
                {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
              </button>
            )}
          </div>
        </div>

        {/* Mobile Dropdown Menu for Public */}
        {role === "public" && mobileMenuOpen && (
          <div className="md:hidden border-t border-border bg-surface px-4 py-4 space-y-3 shadow-lg">
            <div className="flex flex-col space-y-1">
              {publicNavLinks.map((link) => (
                <a
                  key={link.label}
                  href={link.href}
                  onClick={() => setMobileMenuOpen(false)}
                  className="px-3 py-2 rounded-lg text-xs font-medium text-ink hover:bg-bg"
                >
                  {link.label}
                </a>
              ))}
            </div>
            <div className="pt-2 border-t border-border flex flex-col gap-2">
              <Link
                href="/student/login"
                onClick={() => setMobileMenuOpen(false)}
                className={buttonVariants({
                  variant: "outline",
                  size: "sm",
                  className: "w-full text-xs font-semibold rounded-xl justify-center",
                })}
              >
                Student Portal
              </Link>
              <Link
                href="/tutor/login"
                onClick={() => setMobileMenuOpen(false)}
                className={buttonVariants({
                  variant: "outline",
                  size: "sm",
                  className: "w-full text-xs font-semibold rounded-xl justify-center",
                })}
              >
                Tutor Sign In
              </Link>
              <Link
                href="/tutor/register"
                onClick={() => setMobileMenuOpen(false)}
                className={buttonVariants({
                  size: "sm",
                  className: "w-full bg-primary text-primary-foreground text-xs font-semibold rounded-xl justify-center",
                })}
              >
                Become a Tutor (Free)
              </Link>
            </div>
          </div>
        )}
      </header>

      {/* ================= MOBILE BOTTOM NAV FOR LOGGED-IN USERS ================= */}
      {role !== "public" && (
        <nav
          aria-label="Mobile primary navigation"
          className="md:hidden fixed bottom-0 inset-x-0 z-40 bg-surface/95 backdrop-blur-md border-t border-border h-16 flex items-center justify-around px-2"
        >
          {activeLinks.map((item) => {
            const isActive =
              item.href === "/t" || item.href === "/s"
                ? pathname === item.href
                : pathname.startsWith(item.href);
            const Icon = item.icon;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "flex flex-col items-center justify-center min-w-[56px] py-1 px-2 transition-all",
                  isActive
                    ? "text-primary font-bold"
                    : "text-muted hover:text-ink font-medium"
                )}
              >
                <div
                  className={cn(
                    "p-1 rounded-xl transition-colors",
                    isActive ? "bg-primary-soft text-primary" : ""
                  )}
                >
                  <Icon className="w-4 h-4" />
                </div>
                <span className="text-[10px] leading-tight mt-0.5">
                  {item.label}
                </span>
              </Link>
            );
          })}
        </nav>
      )}
    </>
  );
}
