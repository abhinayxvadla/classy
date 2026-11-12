import { XCircle, CheckCircle2, Clock, Sparkles } from "lucide-react";
import { Badge } from "@/components/ui/badge";

export function ContrastSection() {
  return (
    <section id="the-difference" className="w-full my-16 text-left">
      <div className="text-center mb-10">
        <Badge
          variant="outline"
          className="rounded-full border-primary/30 bg-primary-soft text-primary font-semibold text-xs mb-2"
        >
          The Difference
        </Badge>
        <h2 className="font-serif text-3xl sm:text-4xl font-bold text-ink">
          The 6-App Chaos vs. The Classy Loop
        </h2>
        <p className="text-xs sm:text-sm text-muted max-w-lg mx-auto mt-2">
          Why modern educators are retiring clumsy form builders and fragmented chat threads.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-stretch">
        {/* Card 1: The Old Way (6-App Chaos) */}
        <div className="p-6 sm:p-7 rounded-3xl border border-rose-500/20 bg-rose-500/5 shadow-xs flex flex-col justify-between space-y-6">
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-rose-500/10 text-rose-700 dark:text-rose-400 text-xs font-semibold">
                <XCircle className="w-3.5 h-3.5" /> The Old Way
              </span>
              <span className="text-xs font-mono text-muted flex items-center gap-1">
                <Clock className="w-3.5 h-3.5" /> ~6 hours / week lost
              </span>
            </div>

            <h3 className="font-serif text-2xl font-bold text-ink">
              The 6-App Administration Trap
            </h3>
            <p className="text-xs sm:text-sm text-muted leading-relaxed">
              You already use AI to draft great questions. Then the friction begins:
            </p>

            <ul className="space-y-3 text-xs sm:text-sm text-ink/90 pt-1">
              <li className="flex items-start gap-2.5">
                <span className="text-rose-500 font-bold shrink-0 mt-0.5">✕</span>
                <span><strong>Google Forms:</strong> Copy-pasting 20 questions & 80 options one by one, manually setting radio buttons.</span>
              </li>
              <li className="flex items-start gap-2.5">
                <span className="text-rose-500 font-bold shrink-0 mt-0.5">✕</span>
                <span><strong>WhatsApp / Telegram:</strong> Dumping PDF links that get buried under 300 family & student messages.</span>
              </li>
              <li className="flex items-start gap-2.5">
                <span className="text-rose-500 font-bold shrink-0 mt-0.5">✕</span>
                <span><strong>GPay / PhonePe:</strong> Chasing parents for transaction screenshots to track monthly tuition fees.</span>
              </li>
              <li className="flex items-start gap-2.5">
                <span className="text-rose-500 font-bold shrink-0 mt-0.5">✕</span>
                <span><strong>Pen & Paper:</strong> Spending entire Sunday afternoons manually correcting homework submissions.</span>
              </li>
            </ul>
          </div>

          <div className="p-3 rounded-2xl bg-surface/80 border border-border/60 text-xs text-muted flex items-center justify-between">
            <span>Result:</span>
            <span className="font-semibold text-rose-600 dark:text-rose-400">Exhausting, manual, repetitive</span>
          </div>
        </div>

        {/* Card 2: The Classy Way (The Loop) */}
        <div className="p-6 sm:p-7 rounded-3xl border border-emerald-500/30 bg-emerald-500/5 shadow-xs flex flex-col justify-between space-y-6 relative overflow-hidden">
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 text-xs font-semibold">
                <Sparkles className="w-3.5 h-3.5" /> The Classy Loop
              </span>
              <span className="text-xs font-mono text-emerald-600 dark:text-emerald-400 font-bold flex items-center gap-1">
                ⚡ 30 seconds
              </span>
            </div>

            <h3 className="font-serif text-2xl font-bold text-ink">
              One Command to a Live Classroom
            </h3>
            <p className="text-xs sm:text-sm text-muted leading-relaxed">
              Your AI handles the thinking. Classy handles the entire delivery pipeline:
            </p>

            <ul className="space-y-3 text-xs sm:text-sm text-ink/90 pt-1">
              <li className="flex items-start gap-2.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5" />
                <span><strong>Instant Tool Call:</strong> Prompts turn directly into published coursework with 0 copy-pasting.</span>
              </li>
              <li className="flex items-start gap-2.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5" />
                <span><strong>Clean Mobile App:</strong> Delivered straight to students&apos; phones with timed questions and progress bars.</span>
              </li>
              <li className="flex items-start gap-2.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5" />
                <span><strong>Integrated UPI Checkout:</strong> Students unlock premium batches in 1 tap; automatic payout bookkeeping.</span>
              </li>
              <li className="flex items-start gap-2.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5" />
                <span><strong>12ms Server Grading:</strong> Tests evaluate automatically against encrypted answer keys the moment students submit.</span>
              </li>
            </ul>
          </div>

          <div className="p-3 rounded-2xl bg-surface/80 border border-emerald-500/20 text-xs text-muted flex items-center justify-between">
            <span>Result:</span>
            <span className="font-semibold text-emerald-600 dark:text-emerald-400">Effortless, structured, on autopilot</span>
          </div>
        </div>
      </div>
    </section>
  );
}
