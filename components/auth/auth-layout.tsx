import * as React from "react";
import Link from "next/link";
import { Sparkles, CheckCircle2, ShieldCheck, ArrowRight } from "lucide-react";
import { AuthLogoPill } from "@/components/auth/auth-logo-pill";
import { APP_NAME, APP_TAGLINE } from "@/lib/config";

interface AuthLayoutProps {
  portal: "tutor" | "student";
  title: string;
  subtitle: string;
  otherPortalLink: {
    label: string;
    href: string;
  };
  children: React.ReactNode;
}

export function AuthLayout({
  portal,
  title,
  subtitle,
  otherPortalLink,
  children,
}: AuthLayoutProps) {
  const isTutor = portal === "tutor";

  return (
    <div className="min-h-screen bg-bg text-ink flex flex-col justify-between selection:bg-primary-soft selection:text-primary">
      {/* Floating Logo Pill */}
      <AuthLogoPill />

      {/* Main Container */}
      <main className="flex-1 flex items-center justify-center pt-20 pb-12 px-4 sm:px-6 lg:px-8">
        <div className="w-full max-w-5xl grid grid-cols-1 md:grid-cols-12 gap-8 lg:gap-12 items-stretch my-auto">
          
          {/* Brand Panel (Visible on Desktop/Tablet ≥ 768px) */}
          <aside className="hidden md:flex md:col-span-5 lg:col-span-5 flex-col justify-between p-8 lg:p-10 rounded-3xl bg-linear-to-br from-primary via-primary/95 to-ink text-white shadow-xl relative overflow-hidden">
            {/* Ambient Illustration Gradient Accent */}
            <div className="absolute -top-24 -right-24 w-72 h-72 rounded-full bg-accent/20 blur-3xl pointer-events-none" />
            <div className="absolute -bottom-24 -left-24 w-72 h-72 rounded-full bg-primary-soft/15 blur-3xl pointer-events-none" />

            <div className="relative z-10 space-y-6">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold tracking-wide bg-white/10 backdrop-blur-md border border-white/15 text-white">
                <Sparkles className="w-3.5 h-3.5 text-accent" />
                {isTutor ? "Tutor Portal" : "Student Hub"}
              </div>

              <div>
                <h1 className="font-serif text-3xl lg:text-4xl font-bold tracking-tight text-white leading-tight">
                  {isTutor ? "Start teaching your students today." : "Your classes, in one calm app."}
                </h1>
                <p className="mt-3 text-white/80 text-sm lg:text-base leading-relaxed">
                  {APP_TAGLINE}
                </p>
              </div>

              {/* Value Highlights */}
              <div className="space-y-3.5 pt-4 border-t border-white/10">
                {isTutor ? (
                  <>
                    <div className="flex items-start gap-3 text-xs lg:text-sm text-white/90">
                      <CheckCircle2 className="w-4 h-4 text-accent mt-0.5 shrink-0" />
                      <span>Anyone can teach: create batches in 30 seconds with zero paperwork.</span>
                    </div>
                    <div className="flex items-start gap-3 text-xs lg:text-sm text-white/90">
                      <CheckCircle2 className="w-4 h-4 text-accent mt-0.5 shrink-0" />
                      <span>Invite students with a 1-tap WhatsApp link or 6-letter join code.</span>
                    </div>
                    <div className="flex items-start gap-3 text-xs lg:text-sm text-white/90">
                      <ShieldCheck className="w-4 h-4 text-accent mt-0.5 shrink-0" />
                      <span>Auto-graded timed quizzes, revision notes, and homework tracking.</span>
                    </div>
                  </>
                ) : (
                  <>
                    <div className="flex items-start gap-3 text-xs lg:text-sm text-white/90">
                      <CheckCircle2 className="w-4 h-4 text-accent mt-0.5 shrink-0" />
                      <span>Join batches instantly with your tutor&apos;s 6-character code.</span>
                    </div>
                    <div className="flex items-start gap-3 text-xs lg:text-sm text-white/90">
                      <CheckCircle2 className="w-4 h-4 text-accent mt-0.5 shrink-0" />
                      <span>Interactive timed quizzes with instant explanations &amp; scorecards.</span>
                    </div>
                    <div className="flex items-start gap-3 text-xs lg:text-sm text-white/90">
                      <ShieldCheck className="w-4 h-4 text-accent mt-0.5 shrink-0" />
                      <span>Distraction-free revision notes and study library for your grade.</span>
                    </div>
                  </>
                )}
              </div>
            </div>

            {/* Portal Switcher Footnote */}
            <div className="relative z-10 pt-6 mt-6 border-t border-white/10 text-xs text-white/70 flex items-center justify-between">
              <span>Looking for {isTutor ? "student" : "tutor"} access?</span>
              <Link
                href={otherPortalLink.href}
                className="text-white font-medium hover:text-accent transition-colors inline-flex items-center gap-1 group"
              >
                {otherPortalLink.label}
                <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
              </Link>
            </div>
          </aside>

          {/* Form Card (Mobile-First Centered Card) */}
          <div className="md:col-span-7 lg:col-span-7 flex flex-col justify-center">
            <div className="w-full max-w-md mx-auto bg-surface rounded-2xl border border-border p-6 sm:p-8 shadow-sm">
              <div className="mb-6">
                <div className="md:hidden flex items-center justify-between mb-4 pb-3 border-b border-border">
                  <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-primary-soft text-primary">
                    <Sparkles className="w-3 h-3" />
                    {isTutor ? "Tutor Portal" : "Student Hub"}
                  </span>
                  <Link
                    href={otherPortalLink.href}
                    className="text-xs text-muted hover:text-primary transition-colors flex items-center gap-1"
                  >
                    {isTutor ? "Student portal" : "Tutor portal"} &rarr;
                  </Link>
                </div>
                <h2 className="font-serif text-2xl sm:text-3xl font-bold tracking-tight text-ink">
                  {title}
                </h2>
                <p className="mt-1.5 text-sm text-muted">
                  {subtitle}
                </p>
              </div>

              {/* Form Content */}
              {children}

              {/* Mobile Portal Switcher */}
              <div className="md:hidden mt-6 pt-4 border-t border-border text-center text-xs text-muted">
                <span>Looking for the other portal? </span>
                <Link
                  href={otherPortalLink.href}
                  className="font-medium text-primary hover:underline"
                >
                  {otherPortalLink.label}
                </Link>
              </div>
            </div>
          </div>

        </div>
      </main>

      {/* Subtle Footer */}
      <footer className="py-4 text-center text-xs text-muted">
        <p>
          &copy; {new Date().getFullYear()} {APP_NAME}. All rights reserved.
        </p>
      </footer>
    </div>
  );
}
