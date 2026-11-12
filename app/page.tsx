import { redirect } from "next/navigation";
import Link from "next/link";
import {
  ArrowRight,
  Sparkles,
  Bot,
  GraduationCap,
  CheckCircle2,
  BookOpen,
} from "lucide-react";
import { Button, buttonVariants } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { FloatingNav } from "@/components/nav/floating-nav";
import { InteractiveSimulator } from "@/components/landing/simulator";
import { ContrastSection } from "@/components/landing/contrast-section";
import { BentoFeatures } from "@/components/landing/bento-features";
import { FAQSection } from "@/components/landing/faq-section";
import { InstallButton } from "@/components/pwa/install-button";
import { APP_NAME, APP_TAGLINE, PLATFORM_FEE_PERCENT } from "@/lib/config";
import { createClient } from "@/lib/supabase/server";

export default async function HomePage() {
  // If user is already logged in, redirect them to their respective home
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (user) {
    const { data: profile } = await supabase
      .from("profiles")
      .select("role")
      .eq("id", user.id)
      .maybeSingle();

    if (profile?.role === "tutor") {
      redirect("/t");
    } else if (profile?.role === "student") {
      redirect("/s");
    }
  }

  const tutorKeepPercent = 100 - PLATFORM_FEE_PERCENT;

  return (
    <div className="min-h-screen bg-bg text-ink flex flex-col justify-between selection:bg-primary-soft selection:text-primary transition-colors duration-300">
      {/* Floating Public Pill Nav */}
      <FloatingNav role="public" />

      {/* Main Content Area */}
      <main className="flex-1 max-w-5xl w-full mx-auto px-4 sm:px-6 lg:px-8 pt-24 md:pt-[104px] pb-[calc(104px+env(safe-area-inset-bottom))] flex flex-col items-center text-center">
        {/* =================================================================== */}
        {/* 1. HERO SECTION */}
        {/* =================================================================== */}
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-primary-soft text-primary text-xs font-semibold tracking-wide uppercase mb-6 border border-primary/20 shadow-2xs">
          <Sparkles className="w-3.5 h-3.5 text-accent" />
          The AI-Native Classroom · Unlimited for Tutors
        </div>

        <h1 className="text-4xl sm:text-6xl md:text-7xl font-serif font-bold tracking-tight text-ink max-w-3xl leading-[1.08] mb-6">
          You talk to your AI. Classy runs the class.
        </h1>

        <p className="text-lg sm:text-xl text-muted max-w-2xl font-normal leading-relaxed mb-8">
          Stop copy-pasting prompts into Google Forms, scattered PDFs, and chaotic WhatsApp groups.
          Connect Claude, ChatGPT, or Gemini once—Classy turns your conversations into interactive
          quizzes, offline revision notes, and auto-graded coursework on your students&apos; phones.
        </p>

        {/* Dual Portal CTAs */}
        <div className="flex flex-col sm:flex-row items-center gap-3.5 mb-8 w-full sm:w-auto">
          <Link
            href="/tutor/register"
            className={buttonVariants({
              className:
                "w-full sm:w-auto rounded-xl bg-primary text-primary-foreground hover:bg-primary/90 px-7 py-3.5 font-semibold shadow-xs flex items-center justify-center gap-2 text-sm",
            })}
          >
            <Bot className="w-4 h-4" />
            Start as a Tutor Free
          </Link>
          <Link
            href="/student/register"
            className={buttonVariants({
              variant: "outline",
              className:
                "w-full sm:w-auto rounded-xl border-border hover:bg-surface px-7 py-3.5 font-semibold flex items-center justify-center gap-2 text-sm",
            })}
          >
            <GraduationCap className="w-4 h-4" />
            I&apos;m a Student
          </Link>
        </div>

        {/* Quick Batch Join Code Input */}
        <form
          action="/join"
          method="GET"
          className="w-full max-w-md bg-surface p-2 sm:p-2.5 rounded-2xl border border-border shadow-xs mb-6 flex flex-col sm:flex-row items-center gap-2"
        >
          <input
            name="code"
            type="text"
            placeholder="Enter 6-char batch code (e.g. SCI10A)"
            maxLength={6}
            required
            className="w-full px-4 py-2.5 rounded-xl bg-transparent border-0 text-ink placeholder:text-muted focus:outline-hidden uppercase font-mono tracking-widest text-center sm:text-left text-sm font-semibold"
          />
          <Button
            type="submit"
            className="w-full sm:w-auto rounded-xl bg-primary text-white hover:bg-primary/90 px-5 whitespace-nowrap font-semibold cursor-pointer"
          >
            Join Class <ArrowRight className="w-4 h-4 ml-1.5" />
          </Button>
        </form>

        <p className="text-xs text-muted mb-10">
          ✓ Free for tutors · Setup in 60 seconds · Works as an app on any phone
        </p>

        {/* AI Client Ecosystem Badges */}
        <div className="flex flex-col items-center gap-3 mb-10 w-full">
          <span className="text-xs font-semibold uppercase tracking-wider text-muted">
            Works with your favourite AI assistant
          </span>
          <div className="flex flex-wrap items-center justify-center gap-2 sm:gap-2.5">
            <span className="px-3.5 py-1.5 rounded-xl bg-surface border border-border font-mono text-xs font-semibold text-ink shadow-2xs">
              Claude 3.7 Sonnet
            </span>
            <span className="px-3.5 py-1.5 rounded-xl bg-surface border border-border font-mono text-xs font-semibold text-ink shadow-2xs">
              ChatGPT (o3 / 4o)
            </span>
            <span className="px-3.5 py-1.5 rounded-xl bg-surface border border-border font-mono text-xs font-semibold text-ink shadow-2xs">
              Google Gemini
            </span>
            <span className="px-3.5 py-1.5 rounded-xl bg-surface border border-border font-mono text-xs font-semibold text-ink shadow-2xs">
              Perplexity AI
            </span>
            <span className="px-3.5 py-1.5 rounded-xl bg-surface border border-border font-mono text-xs font-semibold text-ink shadow-2xs">
              Cursor IDE
            </span>
          </div>
        </div>

        {/* =================================================================== */}
        {/* 2. INTERACTIVE SIMULATOR (Show, Don't Tell) */}
        {/* =================================================================== */}
        <InteractiveSimulator />

        {/* =================================================================== */}
        {/* 3. THE CONTRAST (The 6-App Chaos vs. The Classy Loop) */}
        {/* =================================================================== */}
        <ContrastSection />

        {/* =================================================================== */}
        {/* 4. THE 3-STEP ENGINE (Prompt it · Push it · Track it) */}
        {/* =================================================================== */}
        <section id="how-it-works" className="w-full my-16 text-left">
          <div className="text-center mb-10">
            <Badge
              variant="outline"
              className="rounded-full border-primary/30 bg-primary-soft text-primary font-semibold text-xs mb-2"
            >
              The 3-Step Engine
            </Badge>
            <h2 className="font-serif text-3xl sm:text-4xl font-bold text-ink">
              From Conversation to Graded Classroom
            </h2>
            <p className="text-muted text-xs sm:text-sm max-w-lg mx-auto mt-2">
              Three seamless steps from natural prompt to an interactive mobile experience.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="p-6 rounded-2xl border border-border bg-surface shadow-xs space-y-3">
              <div className="w-10 h-10 rounded-xl bg-primary-soft text-primary flex items-center justify-center font-bold text-base">
                1
              </div>
              <h3 className="font-serif text-xl font-bold text-ink">Prompt it</h3>
              <p className="text-xs sm:text-sm text-muted leading-relaxed">
                Draft quizzes, assignments, lecture notes, or notices in plain English inside your AI
                assistant. Specify grade level, target topics, and answer explanations.
              </p>
            </div>

            <div className="p-6 rounded-2xl border border-border bg-surface shadow-xs space-y-3">
              <div className="w-10 h-10 rounded-xl bg-primary-soft text-primary flex items-center justify-center font-bold text-base">
                2
              </div>
              <h3 className="font-serif text-xl font-bold text-ink">Push it</h3>
              <p className="text-xs sm:text-sm text-muted leading-relaxed">
                Connect your unique MCP link once. Your AI tool-calls Classy to create and schedule
                coursework in your batch instantly—with zero manual copy-pasting.
              </p>
            </div>

            <div className="p-6 rounded-2xl border border-border bg-surface shadow-xs space-y-3">
              <div className="w-10 h-10 rounded-xl bg-primary-soft text-primary flex items-center justify-center font-bold text-base">
                3
              </div>
              <h3 className="font-serif text-xl font-bold text-ink">Track it</h3>
              <p className="text-xs sm:text-sm text-muted leading-relaxed">
                Students solve timed quizzes, view notes offline in the app, and submit assignments.
                Classy evaluates attempts against encrypted keys in 12ms.
              </p>
            </div>
          </div>
        </section>

        {/* =================================================================== */}
        {/* 5. TUTOR SUPERPOWERS (BENTO GRID) */}
        {/* =================================================================== */}
        <BentoFeatures />

        {/* =================================================================== */}
        {/* 6. THE STUDENT EXPERIENCE */}
        {/* =================================================================== */}
        <section className="w-full my-12 p-7 sm:p-10 rounded-3xl border border-border bg-surface shadow-xs text-left">
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
            <div className="space-y-4 max-w-2xl">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-accent/20 text-accent text-xs font-semibold">
                <GraduationCap className="w-3.5 h-3.5" /> For Students
              </div>
              <h3 className="font-serif text-2xl sm:text-3xl font-bold text-ink">
                A Distraction-Free Mobile App Built for Real Focus
              </h3>
              <p className="text-xs sm:text-sm text-muted leading-relaxed">
                Students join your batch with a simple 6-character code. No social media spam, no
                notification overload—just clean, interactive learning on any phone.
              </p>

              <ul className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs sm:text-sm text-ink/90 pt-2">
                <li className="flex items-start gap-2.5">
                  <CheckCircle2 className="w-4 h-4 text-accent shrink-0 mt-0.5" />
                  <span>1-click join with batch code, invite link, or blackboard QR.</span>
                </li>
                <li className="flex items-start gap-2.5">
                  <CheckCircle2 className="w-4 h-4 text-accent shrink-0 mt-0.5" />
                  <span>Timed quiz player with live countdown & question navigator.</span>
                </li>
                <li className="flex items-start gap-2.5">
                  <CheckCircle2 className="w-4 h-4 text-accent shrink-0 mt-0.5" />
                  <span>Instant score breakdown and step-by-step explanations.</span>
                </li>
                <li className="flex items-start gap-2.5">
                  <CheckCircle2 className="w-4 h-4 text-accent shrink-0 mt-0.5" />
                  <span>Install as a mobile app; review opened study notes offline.</span>
                </li>
              </ul>
            </div>

            <div className="shrink-0 w-full sm:w-auto">
              <Link
                href="/student/register"
                className={buttonVariants({
                  variant: "outline",
                  className: "rounded-xl border-border font-semibold w-full sm:w-auto px-6 py-3",
                })}
              >
                Join as a Student <ArrowRight className="w-4 h-4 ml-1.5" />
              </Link>
            </div>
          </div>
        </section>

        {/* =================================================================== */}
        {/* 7. TRANSPARENT PRICING (Previous Revenue Model: 15% Platform Cut) */}
        {/* =================================================================== */}
        <section id="pricing" className="w-full my-16 text-center">
          <div className="mb-8">
            <Badge
              variant="outline"
              className="rounded-full border-primary/30 bg-primary-soft text-primary font-semibold text-xs mb-2"
            >
              Transparent Pricing
            </Badge>
            <h2 className="font-serif text-3xl sm:text-4xl font-bold text-ink">
              Free for tutors.
            </h2>
            <p className="text-muted text-xs sm:text-sm max-w-lg mx-auto mt-2">
              Classy earns {PLATFORM_FEE_PERCENT}% only when your premium students pay. You keep {tutorKeepPercent}% net.
            </p>
          </div>

          <div className="max-w-xl mx-auto p-8 rounded-3xl bg-surface border border-border shadow-sm text-left space-y-6">
            <div className="flex items-baseline justify-between border-b border-border/80 pb-6">
              <div>
                <h3 className="font-serif text-2xl font-bold text-ink">Tutor Tier</h3>
                <p className="text-xs text-muted mt-0.5">Everything you need to teach</p>
              </div>
              <div className="text-right">
                <span className="font-serif text-3xl font-bold text-primary">₹0</span>
                <span className="text-xs text-muted block">upfront or monthly fee</span>
              </div>
            </div>

            <ul className="space-y-3 text-xs sm:text-sm text-ink/90">
              <li className="flex items-center gap-2.5">
                <CheckCircle2 className="w-4 h-4 text-primary shrink-0" />
                <span>Unlimited batches & student rosters</span>
              </li>
              <li className="flex items-center gap-2.5">
                <CheckCircle2 className="w-4 h-4 text-primary shrink-0" />
                <span>Full MCP Server integration for Claude, ChatGPT & Gemini</span>
              </li>
              <li className="flex items-center gap-2.5">
                <CheckCircle2 className="w-4 h-4 text-primary shrink-0" />
                <span>Automated quiz evaluation & assignment collection</span>
              </li>
              <li className="flex items-center gap-2.5">
                <CheckCircle2 className="w-4 h-4 text-primary shrink-0" />
                <span>Set your own premium monthly price per batch (keep {tutorKeepPercent}%)</span>
              </li>
              <li className="flex items-center gap-2.5">
                <CheckCircle2 className="w-4 h-4 text-primary shrink-0" />
                <span>Integrated Razorpay UPI & card checkout with automated payouts</span>
              </li>
            </ul>

            <div className="pt-2">
              <Link
                href="/tutor/register"
                className={buttonVariants({
                  className: "w-full rounded-xl bg-primary text-white font-semibold py-3",
                })}
              >
                Create Free Tutor Account
              </Link>
            </div>
          </div>
        </section>

        {/* =================================================================== */}
        {/* 8. FAQ SECTION */}
        {/* =================================================================== */}
        <section id="faq" className="w-full my-16 text-center">
          <div className="mb-10">
            <Badge
              variant="outline"
              className="rounded-full border-primary/30 bg-primary-soft text-primary font-semibold text-xs mb-2"
            >
              Questions & Answers
            </Badge>
            <h2 className="font-serif text-3xl sm:text-4xl font-bold text-ink">
              Frequently asked questions
            </h2>
          </div>

          <FAQSection />
        </section>

        {/* =================================================================== */}
        {/* 9. FINAL CONVERSION BANNER */}
        {/* =================================================================== */}
        <section className="w-full my-16 p-8 sm:p-12 rounded-3xl bg-linear-to-b from-primary/10 via-primary/5 to-surface border border-primary/20 text-center space-y-6">
          <h2 className="font-serif text-3xl sm:text-5xl font-bold text-ink max-w-2xl mx-auto leading-tight">
            Your classroom is one prompt away.
          </h2>
          <p className="text-xs sm:text-base text-muted max-w-lg mx-auto">
            Join modern educators who manage their entire teaching workflow directly from their AI assistant.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3.5 pt-2">
            <Link
              href="/tutor/register"
              className={buttonVariants({
                className: "rounded-xl bg-primary text-white font-semibold px-8 py-3.5 shadow-xs",
              })}
            >
              Start as a Tutor Free <ArrowRight className="w-4 h-4 ml-1.5" />
            </Link>
            <Link
              href="/s/library"
              className={buttonVariants({
                variant: "outline",
                className: "rounded-xl border-border font-semibold px-6 py-3.5",
              })}
            >
              <BookOpen className="w-4 h-4 mr-2" />
              Browse Public Library
            </Link>
          </div>
        </section>
      </main>

      {/* =================================================================== */}
      {/* 10. FOOTER (Password Recovery Removed) */}
      {/* =================================================================== */}
      <footer className="w-full border-t border-border/80 bg-surface/50 py-8 text-xs text-muted">
        <div className="max-w-5xl mx-auto px-4 flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-xl bg-primary text-primary-foreground flex items-center justify-center font-serif text-sm font-bold shadow-xs">
              C
            </div>
            <div>
              <p className="font-semibold text-ink">{APP_NAME}</p>
              <p className="text-[11px] text-muted">{APP_TAGLINE}</p>
            </div>
          </div>

          <div className="flex flex-wrap items-center justify-center gap-4 text-xs font-medium">
            <Link href="/tutor/login" className="hover:text-ink transition-colors">
              Tutor Portal
            </Link>
            <Link href="/student/login" className="hover:text-ink transition-colors">
              Student Portal
            </Link>
            <InstallButton size="sm" variant="ghost" className="text-xs h-7 px-2" />
          </div>

          <p className="text-[11px] text-muted">
            &copy; {new Date().getFullYear()} {APP_NAME}. Zero AI in-app.
          </p>
        </div>
      </footer>
    </div>
  );
}
