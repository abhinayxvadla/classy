import { redirect } from "next/navigation";
import Link from "next/link";
import { ArrowRight, CheckCircle2, Sparkles, MessageSquare, Smartphone, Zap } from "lucide-react";
import { buttonVariants } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { FloatingNav } from "@/components/nav/floating-nav";
import { InteractiveSimulator } from "@/components/landing/simulator";
import { ContrastSection } from "@/components/landing/contrast-section";
import { BentoFeatures } from "@/components/landing/bento-features";
import { FAQSection } from "@/components/landing/faq-section";
import { APP_NAME, PLATFORM_FEE_PERCENT } from "@/lib/config";
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
      {/* Sticky Top Navigation */}
      <FloatingNav role="public" />

      {/* Main Page Content */}
      <main className="flex-1 max-w-6xl w-full mx-auto px-4 sm:px-6 lg:px-8 pt-12 md:pt-16 pb-20 flex flex-col items-center text-center">
        {/* =================================================================== */}
        {/* 1. HERO SECTION (Editorial Serif, Menler Style) */}
        {/* =================================================================== */}
        <section className="max-w-4xl mx-auto flex flex-col items-center pt-6 pb-10">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-primary-soft text-primary text-xs font-semibold tracking-wide uppercase mb-6 border border-primary/20 shadow-2xs">
            <Sparkles className="w-3.5 h-3.5 text-primary" />
            <span>The Operating System for Modern Educators</span>
          </div>

          <h1 className="text-4xl sm:text-6xl lg:text-7xl font-serif font-bold tracking-tight text-ink leading-[1.08] mb-6">
            You talk to your AI. <br className="hidden sm:inline" />
            <span className="text-primary font-bold">Classy</span> runs the class.
          </h1>

          <p className="text-sm sm:text-base md:text-lg text-muted max-w-2xl leading-relaxed mb-8">
            Create timed quizzes, push study decks, and assign homework just by talking to Claude, ChatGPT, or your AI companion. Classy delivers it to your students&apos; phones, grades submissions, and tracks attendance automatically.
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
              <p className="font-serif text-xl sm:text-2xl font-bold text-ink">{tutorKeepPercent}%</p>
              <p className="text-xs text-muted">Direct tutor payout</p>
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
              Live Hand-Off Simulator
            </Badge>
            <h2 className="font-serif text-2xl sm:text-3xl font-bold text-ink">
              Watch Conversational Classroom Execution
            </h2>
            <p className="text-xs sm:text-sm text-muted max-w-lg mx-auto mt-2">
              Select a tutor prompt below to see how speech or text transforms into a live mobile classroom experience for students:
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
                Speak or prompt your favorite AI (Claude, ChatGPT, or Classy&apos;s assistant). Describe the quiz, revision notes, or homework assignment in plain words.
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
        {/* 6. TRANSPARENT ECONOMICS (Pricing) */}
        {/* =================================================================== */}
        <section id="pricing" className="w-full my-20 text-left">
          <div className="text-center mb-12">
            <Badge
              variant="outline"
              className="rounded-full border-primary/20 bg-primary-soft text-primary font-semibold text-xs mb-3 px-3 py-1"
            >
              Economics
            </Badge>
            <h2 className="font-serif text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight text-ink">
              Transparent, Educator-First Pricing
            </h2>
            <p className="text-xs sm:text-sm text-muted max-w-xl mx-auto mt-3 leading-relaxed">
              We only succeed when you succeed. Zero monthly fees, zero hidden charges.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-4xl mx-auto">
            {/* Free Tier */}
            <div className="p-8 rounded-3xl border border-border/80 bg-surface/90 shadow-2xs flex flex-col justify-between space-y-6">
              <div className="space-y-4">
                <div className="inline-flex px-3 py-1 rounded-full text-xs font-semibold bg-bg text-muted border border-border/60">
                  Free Classrooms
                </div>
                <div>
                  <h3 className="font-serif text-3xl font-bold text-ink">₹0</h3>
                  <p className="text-xs text-muted mt-1">100% free forever for open batches</p>
                </div>
                <ul className="space-y-3 text-xs sm:text-sm text-ink/90 pt-2">
                  <li className="flex items-center gap-2.5">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                    <span>Unlimited batches &amp; enrolled students</span>
                  </li>
                  <li className="flex items-center gap-2.5">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                    <span>Timed interactive quizzes with auto-scoring</span>
                  </li>
                  <li className="flex items-center gap-2.5">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                    <span>Study notes, formula drops, &amp; homework</span>
                  </li>
                  <li className="flex items-center gap-2.5">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                    <span>Connect Claude, ChatGPT, or Cursor via MCP</span>
                  </li>
                </ul>
              </div>

              <Link
                href="/tutor/register"
                className={buttonVariants({
                  variant: "outline",
                  className: "w-full rounded-xl text-xs font-semibold h-11 border-border hover:bg-bg",
                })}
              >
                Become a Tutor (Free)
              </Link>
            </div>

            {/* Paid Batches Tier */}
            <div className="p-8 rounded-3xl border-2 border-primary/40 bg-primary-soft/30 shadow-xs flex flex-col justify-between space-y-6">
              <div className="space-y-4">
                <div className="inline-flex px-3 py-1 rounded-full text-xs font-semibold bg-primary text-primary-foreground">
                  Monetized Batches
                </div>
                <div>
                  <div className="flex items-baseline gap-1.5">
                    <h3 className="font-serif text-3xl font-bold text-ink">{PLATFORM_FEE_PERCENT}%</h3>
                    <span className="text-xs text-muted">platform fee on paid enrollments</span>
                  </div>
                  <p className="text-xs text-primary font-medium mt-1">
                    You keep {tutorKeepPercent}% of every rupee collected
                  </p>
                </div>
                <ul className="space-y-3 text-xs sm:text-sm text-ink/90 pt-2">
                  <li className="flex items-center gap-2.5">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                    <span>Set custom enrollment fees per batch</span>
                  </li>
                  <li className="flex items-center gap-2.5">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                    <span>Instant UPI &amp; card checkout via Razorpay</span>
                  </li>
                  <li className="flex items-center gap-2.5">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                    <span>Direct bank account settlements</span>
                  </li>
                  <li className="flex items-center gap-2.5">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                    <span>Automated payment receipts for parents</span>
                  </li>
                </ul>
              </div>

              <Link
                href="/tutor/register"
                className={buttonVariants({
                  className: "w-full bg-primary hover:bg-primary/90 text-primary-foreground rounded-xl text-xs font-semibold h-11 shadow-xs",
                })}
              >
                Start Teaching &amp; Monetizing
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
        {/* 8. FINAL CALL TO ACTION (Menler Style) */}
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
                className={buttonVariants({
                  size: "lg",
                  className: "w-full sm:w-auto bg-white text-ink hover:bg-white/90 text-xs sm:text-sm font-bold h-12 px-8 rounded-2xl shadow-sm gap-2",
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
                  className: "w-full sm:w-auto text-white border-white/30 hover:bg-white/10 text-xs sm:text-sm font-semibold h-12 px-6 rounded-2xl",
                })}
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
            <a href="#capabilities" className="hover:text-ink transition-colors">Superpowers</a>
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
