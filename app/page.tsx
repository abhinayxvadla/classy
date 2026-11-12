import { redirect } from "next/navigation";
import Link from "next/link";
import { ArrowRight, CheckCircle2, MessageSquare, Smartphone, Zap } from "lucide-react";
import { buttonVariants } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { FloatingNav } from "@/components/nav/floating-nav";
import { InteractiveSimulator } from "@/components/landing/simulator";
import { ContrastSection } from "@/components/landing/contrast-section";
import { BentoFeatures } from "@/components/landing/bento-features";
import { FAQSection } from "@/components/landing/faq-section";
import { APP_NAME } from "@/lib/config";
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

  return (
    <div className="min-h-screen bg-bg text-ink flex flex-col justify-between selection:bg-primary-soft selection:text-primary transition-colors duration-300">
      {/* Sticky Top Navigation */}
      <FloatingNav role="public" />

      {/* Main Page Content */}
      <main className="flex-1 max-w-6xl w-full mx-auto px-4 sm:px-6 lg:px-8 pt-12 md:pt-16 pb-20 flex flex-col items-center text-center">
        {/* =================================================================== */}
        {/* 1. HERO SECTION (Editorial Serif, Menler Style) */}
        {/* =================================================================== */}
        <section className="max-w-4xl mx-auto flex flex-col items-center pt-6 pb-10">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-primary-soft text-primary text-xs font-semibold tracking-wide uppercase mb-6 border border-primary/20 shadow-2xs">
            <span className="w-1.5 h-1.5 rounded-full bg-primary" />
            <span>Built for Independent Tutors &amp; Teachers</span>
          </div>

          <h1 className="text-4xl sm:text-6xl lg:text-7xl font-serif font-bold tracking-tight text-ink leading-[1.08] mb-6">
            You talk to your AI. <br className="hidden sm:inline" />
            <span className="text-primary font-bold">Classy</span> runs the class.
          </h1>

          <p className="text-sm sm:text-base md:text-lg text-muted max-w-2xl leading-relaxed mb-8">
            Create timed quizzes, push study decks, and assign homework just by talking to Claude, ChatGPT, Gemini, or your preferred AI. Classy delivers it to your students&apos; phones, grades submissions, and tracks attendance automatically.
          </p>

          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 w-full sm:w-auto">
            <Link
              href="/tutor/register"
              className={buttonVariants({
                size: "lg",
                className: "bg-primary hover:bg-primary/90 text-primary-foreground text-sm font-semibold h-12 px-7 rounded-2xl shadow-sm gap-2 justify-center",
              })}
            >
              <span>Become a Tutor (Free)</span>
              <ArrowRight className="w-4 h-4" />
            </Link>

            <Link
              href="/student/login"
              className={buttonVariants({
                variant: "outline",
                size: "lg",
                className: "text-ink border-border hover:bg-surface text-sm font-semibold h-12 px-6 rounded-2xl justify-center",
              })}
            >
              <span>Student Portal</span>
            </Link>
          </div>

          {/* Trust & Outcome Metrics Strip */}
          <div className="mt-12 pt-8 border-t border-border/60 w-full grid grid-cols-2 md:grid-cols-4 gap-4 text-left">
            <div className="space-y-0.5">
              <p className="font-serif text-xl sm:text-2xl font-bold text-ink">0.4s</p>
              <p className="text-xs text-muted">Prompt-to-phone sync</p>
            </div>
            <div className="space-y-0.5">
              <p className="font-serif text-xl sm:text-2xl font-bold text-ink">1-Tap</p>
              <p className="text-xs text-muted">WhatsApp batch invites</p>
            </div>
            <div className="space-y-0.5">
              <p className="font-serif text-xl sm:text-2xl font-bold text-ink">Instant</p>
              <p className="text-xs text-muted">Auto-grading &amp; answers</p>
            </div>
            <div className="space-y-0.5">
              <p className="font-serif text-xl sm:text-2xl font-bold text-emerald-600 dark:text-emerald-400">₹0</p>
              <p className="text-xs text-muted">Monthly platform fee</p>
            </div>
          </div>
        </section>

        {/* =================================================================== */}
        {/* 2. INTERACTIVE PRODUCT CANVAS (Simulator) */}
        {/* =================================================================== */}
        <section id="demo" className="w-full my-8">
          <div className="text-center mb-6">
            <Badge
              variant="outline"
              className="rounded-full border-primary/20 bg-primary-soft text-primary font-semibold text-xs mb-2 px-3 py-1"
            >
              See How It Works
            </Badge>
            <h2 className="font-serif text-2xl sm:text-3xl font-bold text-ink">
              From Your Prompt to Students&apos; Phones
            </h2>
            <p className="text-xs sm:text-sm text-muted max-w-lg mx-auto mt-2">
              Select a sample prompt below to see how a quick instruction turns into an interactive mobile quiz on student devices:
            </p>
          </div>

          <InteractiveSimulator />
        </section>

        {/* =================================================================== */}
        {/* 3. THE DIFFERENCE (Contrast Section) */}
        {/* =================================================================== */}
        <ContrastSection />

        {/* =================================================================== */}
        {/* 4. CAPABILITIES (Bento Features) */}
        {/* =================================================================== */}
        <BentoFeatures />

        {/* =================================================================== */}
        {/* 5. HOW IT WORKS (3 Simple Steps) */}
        {/* =================================================================== */}
        <section id="how-it-works" className="w-full my-20 text-left">
          <div className="text-center mb-12">
            <Badge
              variant="outline"
              className="rounded-full border-primary/20 bg-primary-soft text-primary font-semibold text-xs mb-3 px-3 py-1"
            >
              How It Works
            </Badge>
            <h2 className="font-serif text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight text-ink">
              From Thought to Classroom in 3 Steps
            </h2>
            <p className="text-xs sm:text-sm text-muted max-w-xl mx-auto mt-3 leading-relaxed">
              No manual form builders. No copying links between tabs.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Step 1 */}
            <div className="p-7 rounded-3xl border border-border/80 bg-surface/90 shadow-2xs space-y-4">
              <div className="w-10 h-10 rounded-2xl bg-primary-soft text-primary font-bold text-sm flex items-center justify-center font-mono">
                <MessageSquare className="w-5 h-5" />
              </div>
              <h3 className="font-serif text-xl font-bold text-ink">
                01. Talk or Type
              </h3>
              <p className="text-xs sm:text-sm text-muted leading-relaxed">
                Speak or prompt your favorite AI (Claude, ChatGPT, Gemini, or Perplexity). Describe the quiz, revision notes, or homework assignment in plain words.
              </p>
            </div>

            {/* Step 2 */}
            <div className="p-7 rounded-3xl border border-border/80 bg-surface/90 shadow-2xs space-y-4">
              <div className="w-10 h-10 rounded-2xl bg-primary-soft text-primary font-bold text-sm flex items-center justify-center font-mono">
                <Zap className="w-5 h-5" />
              </div>
              <h3 className="font-serif text-xl font-bold text-ink">
                02. Classy Executes
              </h3>
              <p className="text-xs sm:text-sm text-muted leading-relaxed">
                Classy parses your request, generates the interactive timed quiz with encrypted answer keys, and pins revision notes to your batch stream instantly.
              </p>
            </div>

            {/* Step 3 */}
            <div className="p-7 rounded-3xl border border-border/80 bg-surface/90 shadow-2xs space-y-4">
              <div className="w-10 h-10 rounded-2xl bg-primary-soft text-primary font-bold text-sm flex items-center justify-center font-mono">
                <Smartphone className="w-5 h-5" />
              </div>
              <h3 className="font-serif text-xl font-bold text-ink">
                03. Students Learn on Mobile
              </h3>
              <p className="text-xs sm:text-sm text-muted leading-relaxed">
                Students open their clean phone feed via 1-tap invite link. Tests are auto-graded on submit, and progress is logged.
              </p>
            </div>
          </div>
        </section>

        {/* =================================================================== */}
        {/* 6. TRANSPARENT ECONOMICS (Zero Software Lock-in Disruption Matrix) */}
        {/* =================================================================== */}
        <section id="pricing" className="w-full my-20 text-left">
          <div className="text-center mb-12">
            <Badge
              variant="outline"
              className="rounded-full border-primary/20 bg-primary-soft text-primary font-semibold text-xs mb-3 px-3 py-1"
            >
              Zero Software Lock-in
            </Badge>
            <h2 className="font-serif text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight text-ink">
              ₹0 Forever. No Subscriptions, No Lock-in.
            </h2>
            <p className="text-xs sm:text-sm text-muted max-w-2xl mx-auto mt-3 leading-relaxed">
              Traditional course platforms charge ₹10,000 to ₹25,000 every single month just to host your classroom. Classy gives you unlimited classrooms, auto-grading, and direct AI sync with zero monthly charges.
            </p>
          </div>

          {/* 3-Column Disruption Comparison Matrix */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 max-w-5xl mx-auto items-stretch">
            {/* Column 1: Legacy LMS */}
            <div className="p-7 sm:p-8 rounded-3xl border border-border/80 bg-surface/80 shadow-2xs flex flex-col justify-between space-y-6">
              <div className="space-y-4">
                <div className="inline-flex px-3 py-1 rounded-full text-xs font-semibold bg-bg text-muted border border-border/60">
                  Legacy Course Platforms
                </div>
                <div>
                  <h3 className="font-serif text-2xl sm:text-3xl font-bold text-ink">$119 to $299</h3>
                  <p className="text-xs text-muted mt-1">₹10,000 to ₹25,000 / month fixed cost</p>
                </div>
                <div className="space-y-3 pt-2 text-xs text-muted border-t border-border/50">
                  <div className="flex items-start gap-2.5">
                    <span className="text-rose-500 font-bold shrink-0">✕</span>
                    <span><strong>AI Sync:</strong> Clunky chatbots, no direct MCP connection</span>
                  </div>
                  <div className="flex items-start gap-2.5">
                    <span className="text-rose-500 font-bold shrink-0">✕</span>
                    <span><strong>Quizzes:</strong> 40-click manual form builders</span>
                  </div>
                  <div className="flex items-start gap-2.5">
                    <span className="text-rose-500 font-bold shrink-0">✕</span>
                    <span><strong>Student Access:</strong> Heavy desktop portals</span>
                  </div>
                  <div className="flex items-start gap-2.5">
                    <span className="text-rose-500 font-bold shrink-0">✕</span>
                    <span><strong>Capacity:</strong> Strict batch &amp; student paywalls</span>
                  </div>
                  <div className="flex items-start gap-2.5">
                    <span className="text-rose-500 font-bold shrink-0">✕</span>
                    <span><strong>Setup:</strong> 3 to 5 days of painful configuration</span>
                  </div>
                </div>
              </div>

              <div className="p-3 rounded-xl bg-bg border border-border/60 text-[11px] text-muted text-center">
                High monthly overhead regardless of student count
              </div>
            </div>

            {/* Column 2: WhatsApp Tuitions */}
            <div className="p-7 sm:p-8 rounded-3xl border border-border/80 bg-surface/80 shadow-2xs flex flex-col justify-between space-y-6">
              <div className="space-y-4">
                <div className="inline-flex px-3 py-1 rounded-full text-xs font-semibold bg-bg text-muted border border-border/60">
                  Traditional WhatsApp Tuitions
                </div>
                <div>
                  <h3 className="font-serif text-2xl sm:text-3xl font-bold text-ink">₹0</h3>
                  <p className="text-xs text-muted mt-1">Free, but costs 8+ hours/week in manual chaos</p>
                </div>
                <div className="space-y-3 pt-2 text-xs text-muted border-t border-border/50">
                  <div className="flex items-start gap-2.5">
                    <span className="text-rose-500 font-bold shrink-0">✕</span>
                    <span><strong>AI Sync:</strong> None (manual copy-paste between apps)</span>
                  </div>
                  <div className="flex items-start gap-2.5">
                    <span className="text-rose-500 font-bold shrink-0">✕</span>
                    <span><strong>Quizzes:</strong> Pen &amp; paper or separate Google Forms</span>
                  </div>
                  <div className="flex items-start gap-2.5">
                    <span className="text-rose-500 font-bold shrink-0">✕</span>
                    <span><strong>Student Access:</strong> PDFs get buried under group chat noise</span>
                  </div>
                  <div className="flex items-start gap-2.5">
                    <span className="text-rose-500 font-bold shrink-0">✕</span>
                    <span><strong>Grading:</strong> Weekends lost manually scoring answer sheets</span>
                  </div>
                  <div className="flex items-start gap-2.5">
                    <span className="text-rose-500 font-bold shrink-0">✕</span>
                    <span><strong>Fee Collection:</strong> Awkward UPI screenshot chasing</span>
                  </div>
                </div>
              </div>

              <div className="p-3 rounded-xl bg-bg border border-border/60 text-[11px] text-muted text-center">
                Zero software bill, but heavy administrative burnout
              </div>
            </div>

            {/* Column 3: The Classy Platform (Highlighted) */}
            <div className="p-7 sm:p-8 rounded-3xl border-2 border-primary/50 bg-primary-soft/30 shadow-md flex flex-col justify-between space-y-6 relative overflow-hidden">
              <div className="absolute top-0 right-0 px-3.5 py-1 rounded-bl-xl bg-primary text-primary-foreground text-[10px] font-bold tracking-wider uppercase">
                Recommended
              </div>

              <div className="space-y-4">
                <div className="inline-flex px-3 py-1 rounded-full text-xs font-semibold bg-primary text-primary-foreground">
                  Classy Platform
                </div>
                <div>
                  <h3 className="font-serif text-3xl sm:text-4xl font-bold text-primary">₹0 Forever</h3>
                  <p className="text-xs text-ink/80 font-medium mt-1">Zero monthly subscriptions, zero software lock-in</p>
                </div>
                <div className="space-y-3 pt-2 text-xs text-ink/90 border-t border-primary/20">
                  <div className="flex items-start gap-2.5">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                    <span><strong>AI Sync:</strong> Direct sync with Claude, ChatGPT, Gemini, etc</span>
                  </div>
                  <div className="flex items-start gap-2.5">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                    <span><strong>Quizzes:</strong> Auto-generated with timers &amp; encrypted server keys</span>
                  </div>
                  <div className="flex items-start gap-2.5">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                    <span><strong>Student Access:</strong> Fast, distraction-free mobile web app</span>
                  </div>
                  <div className="flex items-start gap-2.5">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                    <span><strong>Capacity:</strong> Unlimited batches &amp; unlimited enrolled students</span>
                  </div>
                  <div className="flex items-start gap-2.5">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                    <span><strong>Setup:</strong> 30 seconds to launch and invite your students</span>
                  </div>
                </div>
              </div>

              <Link
                href="/tutor/register"
                className={buttonVariants({
                  className: "w-full bg-primary hover:bg-primary/90 text-primary-foreground rounded-xl text-xs font-semibold h-11 shadow-xs justify-center",
                })}
              >
                Start Teaching for Free
              </Link>
            </div>
          </div>
        </section>

        {/* =================================================================== */}
        {/* 7. FREQUENTLY ASKED QUESTIONS */}
        {/* =================================================================== */}
        <section id="faq" className="w-full my-20">
          <div className="text-center mb-12">
            <Badge
              variant="outline"
              className="rounded-full border-primary/20 bg-primary-soft text-primary font-semibold text-xs mb-3 px-3 py-1"
            >
              FAQ
            </Badge>
            <h2 className="font-serif text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight text-ink">
              Frequently Asked Questions
            </h2>
            <p className="text-xs sm:text-sm text-muted max-w-xl mx-auto mt-3 leading-relaxed">
              Clear answers about conversational dispatch, student access, tests, and payments.
            </p>
          </div>

          <FAQSection />
        </section>

        {/* =================================================================== */}
        {/* 8. FINAL CALL TO ACTION (Menler Style with High-Contrast Buttons) */}
        {/* =================================================================== */}
        <section className="w-full my-12 p-8 sm:p-12 rounded-3xl bg-linear-to-br from-primary via-primary/95 to-ink text-white text-center relative overflow-hidden shadow-lg">
          <div className="max-w-2xl mx-auto space-y-5 relative z-10">
            <h2 className="font-serif text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight text-white leading-tight">
              Talk to your AI. Let Classy run your class.
            </h2>
            <p className="text-white/80 text-xs sm:text-sm max-w-lg mx-auto leading-relaxed">
              Join educators and tutors who run their classrooms smoothly on Classy. Launch your first batch in under 30 seconds and invite your students today.
            </p>
            <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-3">
              <Link
                href="/tutor/register"
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 rounded-2xl bg-white !text-[#14161F] hover:bg-neutral-100 text-xs sm:text-sm font-bold h-12 px-8 shadow-md transition-all cursor-pointer"
              >
                <span className="!text-[#14161F] font-bold">Become a Tutor (Free)</span>
                <ArrowRight className="w-4 h-4 !text-[#14161F]" />
              </Link>

              <Link
                href="/student/login"
                className="w-full sm:w-auto inline-flex items-center justify-center rounded-2xl border border-white/40 hover:bg-white/10 text-white text-xs sm:text-sm font-semibold h-12 px-7 transition-all cursor-pointer"
              >
                <span>Student Portal</span>
              </Link>
            </div>
          </div>
        </section>
      </main>

      {/* =================================================================== */}
      {/* 9. MINIMALIST FOOTER */}
      {/* =================================================================== */}
      <footer className="w-full border-t border-border/80 bg-surface/50 py-10 text-xs text-muted">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-lg bg-primary text-primary-foreground flex items-center justify-center font-bold text-xs">
              <span className="font-serif">C</span>
            </div>
            <span className="font-serif font-bold text-base text-ink">{APP_NAME}</span>
            <span className="text-muted/60">•</span>
            <span>You talk to your AI. Classy runs the class.</span>
          </div>

          <div className="flex items-center gap-6">
            <a href="#how-it-works" className="hover:text-ink transition-colors">How It Works</a>
            <a href="#capabilities" className="hover:text-ink transition-colors">Features</a>
            <a href="#the-difference" className="hover:text-ink transition-colors">The Difference</a>
            <a href="#pricing" className="hover:text-ink transition-colors">Pricing</a>
            <a href="#faq" className="hover:text-ink transition-colors">FAQ</a>
            <Link href="/tutor/login" className="hover:text-ink transition-colors">Tutors</Link>
            <Link href="/student/login" className="hover:text-ink transition-colors">Students</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
