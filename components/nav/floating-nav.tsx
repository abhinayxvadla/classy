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
  Sparkles,
  ChevronDown,
  Shield,
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

interface FloatingNavProps {
  role?: "tutor" | "student" | "public";
  userName?: string;
  userEmail?: string;
  isAdmin?: boolean;
}

export function FloatingNav({
  role = "public",
  userName = "User",
  userEmail,
  isAdmin = false,
}: FloatingNavProps) {
  const pathname = usePathname();
  const router = useRouter();

  // Scroll detection: hide on scroll down, show on scroll up
  const [isVisible, setIsVisible] = React.useState(true);
  const lastScrollY = React.useRef(0);

  React.useEffect(() => {
    const handleScroll = () => {
      const currentScrollY = window.scrollY;
      if (currentScrollY < 20) {
        setIsVisible(true);
      } else if (currentScrollY > lastScrollY.current + 5) {
        // Scrolling down
        setIsVisible(false);
      } else if (currentScrollY < lastScrollY.current - 5) {
        // Scrolling up
        setIsVisible(true);
      }
      lastScrollY.current = currentScrollY;
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const handleSignOut = async () => {
    await signOutAction();
    router.push("/");
    router.refresh();
  };

  const tutorLinks = [
    { label: "Dashboard", href: "/t", icon: LayoutDashboard },
    { label: "Batches", href: "/t/batches", icon: Users },
    { label: "Connect AI", href: "/t/connect", icon: Bot },
    { label: "Account", href: "/t/account", icon: User },
  ];

  const studentLinks = [
    { label: "Home", href: "/s", icon: Home },
    { label: "Batches", href: "/s/batches", icon: Users },
    { label: "Library", href: "/s/library", icon: BookOpen },
    { label: "Profile", href: "/s/profile", icon: User },
  ];

  const publicLinks = [
    { label: "How it works", href: "/#how-it-works" },
    { label: "For tutors", href: "/tutor/login" },
    { label: "For students", href: "/student/login" },
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
      {/* ================= DESKTOP FLOATING TOP PILL NAV (>= 768px) ================= */}
      <nav
        aria-label="Desktop primary navigation"
        className={cn(
          "hidden md:flex fixed top-4 inset-x-0 mx-auto z-40 w-[calc(100%-2rem)] max-w-5xl items-center justify-between px-5 py-2.5 rounded-full bg-surface/85 backdrop-blur-xl border border-border/80 shadow-md transition-all duration-300",
          isVisible ? "translate-y-0 opacity-100" : "-translate-y-24 opacity-0 pointer-events-none"
        )}
      >
        {/* Brand Logo */}
        <Link
          href={role === "tutor" ? "/t" : role === "student" ? "/s" : "/"}
          className="flex items-center gap-2.5 text-ink hover:opacity-85 transition-opacity"
        >
          <div className="w-8 h-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center shadow-xs">
            <GraduationCap className="w-4 h-4" />
          </div>
          <span className="font-serif font-bold text-lg tracking-tight text-ink">
            {APP_NAME}
          </span>
          {role !== "public" && (
            <span className="capitalize px-2 py-0.5 rounded-full text-[10px] font-semibold bg-primary-soft text-primary border border-primary/10">
              {role}
            </span>
          )}
        </Link>

        {/* Center Links */}
        <div className="flex items-center gap-1">
          {role === "public" ? (
            publicLinks.map((item) => (
              <Link
                key={item.label}
                href={item.href}
                className="px-3.5 py-1.5 rounded-full text-xs font-medium text-muted hover:text-ink hover:bg-black/5 dark:hover:bg-white/5 transition-colors"
              >
                {item.label}
              </Link>
            ))
          ) : (
            activeLinks.map((item) => {
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
                    "relative flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-semibold transition-all",
                    isActive
                      ? "bg-primary text-primary-foreground shadow-xs"
                      : "text-muted hover:text-ink hover:bg-black/5 dark:hover:bg-white/5"
                  )}
                >
                  <Icon className="w-3.5 h-3.5" />
                  <span>{item.label}</span>
                </Link>
              );
            })
          )}
        </div>

        {/* Right Menu (Avatar or Login CTAs) */}
        <div className="flex items-center gap-2">
          {role === "public" ? (
            <div className="flex items-center gap-2">
              <Link
                href="/tutor/login"
                className="px-3 py-1.5 rounded-full text-xs font-medium text-ink hover:bg-black/5 dark:hover:bg-white/5 transition-colors"
              >
                Tutor login
              </Link>
              <Link
                href="/student/login"
                className="px-4 py-1.5 rounded-full text-xs font-semibold bg-primary text-primary-foreground hover:bg-primary/90 shadow-xs transition-colors"
              >
                Student login
              </Link>
              <div className="h-4 w-px bg-border mx-1" />
              <ThemeToggle />
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <ThemeToggle />
              <DropdownMenu>
                <DropdownMenuTrigger
                  className="flex items-center gap-2 p-1 pl-1.5 pr-2.5 rounded-full hover:bg-black/5 dark:hover:bg-white/5 transition-colors cursor-pointer border border-transparent focus:outline-hidden"
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
                  className="w-56 rounded-2xl p-2 shadow-lg border border-border"
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
                        <Sparkles className="w-2.5 h-2.5" />
                        {role} account
                      </span>
                    </div>
                  </DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  {isAdmin && (
                    <DropdownMenuItem
                      onClick={() => router.push("/admin")}
                      className="rounded-xl cursor-pointer flex items-center gap-2 text-xs font-semibold text-primary"
                    >
                      <Shield className="w-3.5 h-3.5" />
                      <span>Founder Dashboard</span>
                    </DropdownMenuItem>
                  )}
                  <DropdownMenuItem
                    onClick={() => router.push(role === "tutor" ? "/t/account" : "/s/profile")}
                    className="rounded-xl cursor-pointer flex items-center gap-2 text-xs"
                  >
                    <User className="w-3.5 h-3.5" />
                    <span>Profile & Settings</span>
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    onClick={() => router.push("/reset-password")}
                    className="rounded-xl cursor-pointer flex items-center gap-2 text-xs"
                  >
                    <Sparkles className="w-3.5 h-3.5" />
                    <span>Change Password</span>
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
            </div>
          )}
        </div>
      </nav>

      {/* ================= MOBILE FLOATING BOTTOM PILL NAV (< 768px) ================= */}
      {role !== "public" && (
        <nav
          aria-label="Mobile primary navigation"
          className={cn(
            "md:hidden fixed bottom-[calc(16px+env(safe-area-inset-bottom))] inset-x-0 mx-auto z-40 w-[min(92vw,420px)] h-14 rounded-full bg-surface/85 backdrop-blur-xl border border-border shadow-lg flex items-center justify-around px-2 transition-all duration-300",
            isVisible ? "translate-y-0 opacity-100" : "translate-y-24 opacity-0 pointer-events-none"
          )}
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
                  "flex flex-col items-center justify-center min-w-[56px] min-h-[44px] py-1 px-2 rounded-full transition-all text-center",
                  isActive
                    ? "text-primary font-bold scale-105"
                    : "text-muted hover:text-ink font-medium"
                )}
              >
                <div
                  className={cn(
                    "p-1 rounded-full transition-colors",
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
