import { CheckCircle2, Clock } from "lucide-react";
import { Badge } from "@/components/ui/badge";

export function ContrastSection() {
  return (
    <section id="the-difference" className="w-full my-20 text-left">
      <div className="text-center mb-12">
        <Badge
          variant="outline"
          className="rounded-full border-primary/20 bg-primary-soft text-primary font-semibold text-xs mb-3 px-3 py-1"
        >
          The Difference
        </Badge>
        <h2 className="font-serif text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight text-ink">
          Why Independent Tutors Choose Classy
        </h2>
        <p className="text-xs sm:text-sm text-muted max-w-xl mx-auto mt-3 leading-relaxed">
          Running classes shouldn&apos;t mean drowning in 5 disconnected apps and manual administrative chaos.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-stretch">
        {/* Card 1: The Fragmented Headache */}
        <div className="p-7 sm:p-8 rounded-3xl border border-border/80 bg-surface/60 shadow-2xs flex flex-col justify-between space-y-6">
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-rose-500/10 text-rose-700 dark:text-rose-300 text-xs font-semibold">
                The Disorganized Setup
              </span>
              <span className="text-xs text-muted flex items-center gap-1">
                <Clock className="w-3.5 h-3.5" /> 6+ hours / week wasted
              </span>
            </div>

            <h3 className="font-serif text-2xl font-bold text-ink">
              The 5-App Teaching Headache
            </h3>
            <p className="text-xs sm:text-sm text-muted leading-relaxed">
              Most independent educators spend more time managing tools than actually teaching:
            </p>

            <ul className="space-y-3.5 text-xs sm:text-sm text-ink/90 pt-1">
              <li className="flex items-start gap-3">
                <span className="w-5 h-5 rounded-full bg-rose-500/10 text-rose-600 flex items-center justify-center shrink-0 mt-0.5 font-bold text-xs">✕</span>
                <span><strong>Lost PDFs in WhatsApp:</strong> Critical study notes and formula sheets get buried in family messages and class chat noise.</span>
              </li>
              <li className="flex items-start gap-3">
                <span className="w-5 h-5 rounded-full bg-rose-500/10 text-rose-600 flex items-center justify-center shrink-0 mt-0.5 font-bold text-xs">✕</span>
                <span><strong>Tedious Google Forms:</strong> Manually typing 20 questions, copying radio choices, and setting answer keys one-by-one.</span>
              </li>
              <li className="flex items-start gap-3">
                <span className="w-5 h-5 rounded-full bg-rose-500/10 text-rose-600 flex items-center justify-center shrink-0 mt-0.5 font-bold text-xs">✕</span>
                <span><strong>Weekend Test Grading:</strong> Spending hours grading student sheets, calculating percentage scores, and emailing results.</span>
              </li>
              <li className="flex items-start gap-3">
                <span className="w-5 h-5 rounded-full bg-rose-500/10 text-rose-600 flex items-center justify-center shrink-0 mt-0.5 font-bold text-xs">✕</span>
                <span><strong>Chasing Fees on UPI:</strong> Manually matching payment screenshots across multiple chat threads and keeping paper registers.</span>
              </li>
            </ul>
          </div>

          <div className="pt-3 border-t border-border/60 text-xs text-muted">
            Result: Administrative fatigue, scattered resources, and disengaged students.
          </div>
        </div>

        {/* Card 2: The Classy Hub */}
        <div className="p-7 sm:p-8 rounded-3xl border-2 border-primary/40 bg-primary-soft/30 shadow-xs flex flex-col justify-between space-y-6">
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-primary text-primary-foreground text-xs font-semibold">
                The Classy Way
              </span>
              <span className="text-xs text-primary font-medium">
                Under 30 seconds to launch
              </span>
            </div>

            <h3 className="font-serif text-2xl font-bold text-ink">
              One Dedicated Classroom Hub
            </h3>
            <p className="text-xs sm:text-sm text-muted leading-relaxed">
              Everything in one serene space where you teach and your students thrive:
            </p>

            <ul className="space-y-3.5 text-xs sm:text-sm text-ink/90 pt-1">
              <li className="flex items-start gap-3">
                <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
                <span><strong>Instant Batch Creation:</strong> Anyone can create a classroom in 30 seconds and invite students with a short code or WhatsApp link.</span>
              </li>
              <li className="flex items-start gap-3">
                <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
                <span><strong>Organized Study Stream:</strong> Lecture notes, formulas, and revision materials stay permanently organized and searchable.</span>
              </li>
              <li className="flex items-start gap-3">
                <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
                <span><strong>Automated Timed Tests:</strong> Set countdown timers; students take tests on mobile and receive instant marks and step explanations.</span>
              </li>
              <li className="flex items-start gap-3">
                <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
                <span><strong>Direct Payouts &amp; Monetization:</strong> Collect optional batch fees with Razorpay; 85% is transferred directly to your bank account.</span>
              </li>
            </ul>
          </div>

          <div className="pt-3 border-t border-primary/20 text-xs text-primary font-semibold">
            Result: Spend 100% of your energy teaching, inspire your students, and grow your batches.
          </div>
        </div>
      </div>
    </section>
  );
}
