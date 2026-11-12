import { CheckCircle2, Clock, Sparkles } from "lucide-react";
import { Badge } from "@/components/ui/badge";

export function ContrastSection() {
  return (
    <section id="the-difference" className="w-full my-20 text-left">
      <div className="text-center mb-12">
        <Badge
          variant="outline"
          className="rounded-full border-primary/20 bg-primary-soft text-primary font-semibold text-xs mb-3 px-3 py-1"
        >
          Why Tutors Switch
        </Badge>
        <h2 className="font-serif text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight text-ink">
          The 5-App Teaching Headache vs. Teaching on Classy
        </h2>
        <p className="text-xs sm:text-sm text-muted max-w-xl mx-auto mt-3 leading-relaxed">
          Educators love brainstorming with AI. But running the actual class usually turns into an administrative chore. Here is how Classy fixes it:
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-stretch">
        {/* Card 1: The Fragmented Headache */}
        <div className="p-7 sm:p-8 rounded-3xl border border-border/80 bg-surface/60 shadow-2xs flex flex-col justify-between space-y-6">
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-rose-500/10 text-rose-700 dark:text-rose-300 text-xs font-semibold">
                The Fragmented Workflow
              </span>
              <span className="text-xs text-muted flex items-center gap-1">
                <Clock className="w-3.5 h-3.5" /> 8+ hours / week lost
              </span>
            </div>

            <h3 className="font-serif text-2xl font-bold text-ink">
              The 5-App Teaching Maze
            </h3>
            <p className="text-xs sm:text-sm text-muted leading-relaxed">
              You get great ideas from ChatGPT or Claude, but deploying them to students requires endless manual labor:
            </p>

            <ul className="space-y-3.5 text-xs sm:text-sm text-ink/90 pt-1">
              <li className="flex items-start gap-3">
                <span className="w-5 h-5 rounded-full bg-rose-500/10 text-rose-600 flex items-center justify-center shrink-0 mt-0.5 font-bold text-xs">✕</span>
                <span><strong>Copy-pasting into Form Builders:</strong> Re-typing questions, setting up options, radio buttons, and scoring rules one-by-one in Google Forms.</span>
              </li>
              <li className="flex items-start gap-3">
                <span className="w-5 h-5 rounded-full bg-rose-500/10 text-rose-600 flex items-center justify-center shrink-0 mt-0.5 font-bold text-xs">✕</span>
                <span><strong>Lost PDFs in WhatsApp Noise:</strong> Crucial lecture notes, test links, and formula cheat sheets vanish under group chat banter.</span>
              </li>
              <li className="flex items-start gap-3">
                <span className="w-5 h-5 rounded-full bg-rose-500/10 text-rose-600 flex items-center justify-center shrink-0 mt-0.5 font-bold text-xs">✕</span>
                <span><strong>Weekend Test Grading:</strong> Spending Sunday checking answer sheets, tallying scores, and manually calculating percentage ranks.</span>
              </li>
              <li className="flex items-start gap-3">
                <span className="w-5 h-5 rounded-full bg-rose-500/10 text-rose-600 flex items-center justify-center shrink-0 mt-0.5 font-bold text-xs">✕</span>
                <span><strong>Awkward Fee Chasing:</strong> Matching payment screenshots across WhatsApp threads, reminding parents, and updating paper registers.</span>
              </li>
            </ul>
          </div>

          <div className="pt-3 border-t border-border/60 text-xs text-muted">
            The Result: You spend more time being an administrative assistant than an educator.
          </div>
        </div>

        {/* Card 2: The Classy System */}
        <div className="p-7 sm:p-8 rounded-3xl border-2 border-primary/40 bg-primary-soft/30 shadow-xs flex flex-col justify-between space-y-6">
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-primary text-primary-foreground text-xs font-semibold">
                The Classy Way
              </span>
              <span className="text-xs text-primary font-medium flex items-center gap-1">
                <Sparkles className="w-3.5 h-3.5" /> You Talk, Classy Delivers
              </span>
            </div>

            <h3 className="font-serif text-2xl font-bold text-ink">
              One Unified Teaching Hub
            </h3>
            <p className="text-xs sm:text-sm text-muted leading-relaxed">
              Speak or type to your AI, and Classy immediately handles the classroom execution end-to-end:
            </p>

            <ul className="space-y-3.5 text-xs sm:text-sm text-ink/90 pt-1">
              <li className="flex items-start gap-3">
                <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
                <span><strong>Direct Publishing:</strong> Just prompt your quiz, homework, or revision notes. Classy formats and publishes it in under a second.</span>
              </li>
              <li className="flex items-start gap-3">
                <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
                <span><strong>Clean Mobile Feed for Students:</strong> Delivered to your students&apos; phones instantly with countdown timers, formula sheets, and no chat noise.</span>
              </li>
              <li className="flex items-start gap-3">
                <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
                <span><strong>Automatic Server Grading:</strong> Answer keys are securely graded the second students submit. Students see explanations; you see batch analytics.</span>
              </li>
              <li className="flex items-start gap-3">
                <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
                <span><strong>Built-In UPI &amp; Bank Payouts:</strong> Set course fees with one click. Parents pay directly via UPI; payouts settle straight to your bank account.</span>
              </li>
            </ul>
          </div>

          <div className="pt-3 border-t border-primary/20 text-xs text-primary font-medium">
            The Result: You focus 100% on teaching. Classy takes care of the classroom logistics.
          </div>
        </div>
      </div>
    </section>
  );
}
