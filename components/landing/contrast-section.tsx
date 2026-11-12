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
          Why Educators Are Moving to Classy
        </h2>
        <p className="text-xs sm:text-sm text-muted max-w-xl mx-auto mt-3 leading-relaxed">
          The contrast between juggling 5 disconnected tools and running a streamlined, modern classroom.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-stretch">
        {/* Card 1: The Old Way (Fragmented Tools) */}
        <div className="p-7 sm:p-8 rounded-3xl border border-border/80 bg-surface/60 shadow-2xs flex flex-col justify-between space-y-6">
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-muted/10 text-muted text-xs font-semibold">
                The Fragmented Setup
              </span>
              <span className="text-xs text-muted flex items-center gap-1">
                <Clock className="w-3.5 h-3.5" /> 6+ hours / week lost
              </span>
            </div>

            <h3 className="font-serif text-2xl font-bold text-ink">
              Juggling 5 Disparate Apps
            </h3>
            <p className="text-xs sm:text-sm text-muted leading-relaxed">
              Educators spend more time on manual logistics than actual teaching:
            </p>

            <ul className="space-y-3.5 text-xs sm:text-sm text-ink/90 pt-1">
              <li className="flex items-start gap-3">
                <span className="text-rose-500 font-bold shrink-0 mt-0.5">✕</span>
                <span><strong>Google Forms:</strong> Manually copy-pasting questions and radio options one-by-one.</span>
              </li>
              <li className="flex items-start gap-3">
                <span className="text-rose-500 font-bold shrink-0 mt-0.5">✕</span>
                <span><strong>WhatsApp Groups:</strong> PDF study materials get lost in family and group message clutter.</span>
              </li>
              <li className="flex items-start gap-3">
                <span className="text-rose-500 font-bold shrink-0 mt-0.5">✕</span>
                <span><strong>Payment Chasing:</strong> Verifying UPI and bank transfer screenshots across multiple chat threads.</span>
              </li>
              <li className="flex items-start gap-3">
                <span className="text-rose-500 font-bold shrink-0 mt-0.5">✕</span>
                <span><strong>Manual Grading:</strong> Spending weekends checking test answers and recording marks on spreadsheets.</span>
              </li>
            </ul>
          </div>

          <div className="pt-3 border-t border-border/60 text-xs text-muted">
            Result: Administrative fatigue and lost student engagement.
          </div>
        </div>

        {/* Card 2: The Classy Way (Streamlined Classroom) */}
        <div className="p-7 sm:p-8 rounded-3xl border-2 border-primary/40 bg-primary-soft/30 shadow-xs flex flex-col justify-between space-y-6">
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-primary text-primary-foreground text-xs font-semibold">
                The Classy Way
              </span>
              <span className="text-xs text-primary font-medium">
                Under 15 seconds per task
              </span>
            </div>

            <h3 className="font-serif text-2xl font-bold text-ink">
              One Unified Teaching Hub
            </h3>
            <p className="text-xs sm:text-sm text-muted leading-relaxed">
              Instruct your assistant or dashboard, and your classroom updates automatically:
            </p>

            <ul className="space-y-3.5 text-xs sm:text-sm text-ink/90 pt-1">
              <li className="flex items-start gap-3">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                <span><strong>One-Command Publishing:</strong> Draft quizzes or notes in Claude, ChatGPT, or web — published in 1 click.</span>
              </li>
              <li className="flex items-start gap-3">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                <span><strong>Dedicated Mobile Portal:</strong> Students access their batch stream, study notes, and tests in one quiet app.</span>
              </li>
              <li className="flex items-start gap-3">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                <span><strong>Instant Auto-Scoring:</strong> Quizzes are graded automatically with explanations released immediately.</span>
              </li>
              <li className="flex items-start gap-3">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                <span><strong>Built-In Payouts:</strong> Students enroll and pay via Razorpay; 85% is transferred directly to your bank.</span>
              </li>
            </ul>
          </div>

          <div className="pt-3 border-t border-primary/20 text-xs text-primary font-semibold">
            Result: More time teaching, zero administrative friction.
          </div>
        </div>
      </div>
    </section>
  );
}
