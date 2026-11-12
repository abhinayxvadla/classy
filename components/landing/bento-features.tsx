import {
  Bot,
  ShieldCheck,
  QrCode,
  CreditCard,
  Smartphone,
  Lock,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { PLATFORM_FEE_PERCENT } from "@/lib/config";

export function BentoFeatures() {
  const tutorKeepPercent = 100 - PLATFORM_FEE_PERCENT;

  return (
    <section id="features" className="w-full my-16 text-left">
      <div className="text-center mb-10">
        <Badge
          variant="outline"
          className="rounded-full border-primary/30 bg-primary-soft text-primary font-semibold text-xs mb-2"
        >
          Tutor Superpowers
        </Badge>
        <h2 className="font-serif text-3xl sm:text-4xl font-bold text-ink">
          Built for Teachers Who Value Their Time
        </h2>
        <p className="text-xs sm:text-sm text-muted max-w-lg mx-auto mt-2">
          Everything you need to run, scale, and monetize your teaching business without administrative burnout.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        {/* Card 1: Universal MCP Bridge (Span 2) */}
        <div className="md:col-span-2 p-6 sm:p-7 rounded-3xl border border-border bg-surface shadow-xs flex flex-col justify-between space-y-4">
          <div className="space-y-3">
            <div className="w-10 h-10 rounded-2xl bg-primary-soft text-primary flex items-center justify-center font-bold">
              <Bot className="w-5 h-5" />
            </div>
            <h3 className="font-serif text-xl sm:text-2xl font-bold text-ink">
              The Universal MCP Super-Bridge
            </h3>
            <p className="text-xs sm:text-sm text-muted leading-relaxed max-w-xl">
              Connect Claude Desktop, Cursor, ChatGPT Developer Mode, Perplexity, or Gemini using standard streamable HTTP. No cumbersome API keys or manual webhook configurations—one secure link connects your assistant to your active student batches.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2 pt-2">
            <span className="px-2.5 py-1 rounded-lg bg-bg border border-border font-mono text-[11px] text-muted">
              Claude Desktop
            </span>
            <span className="px-2.5 py-1 rounded-lg bg-bg border border-border font-mono text-[11px] text-muted">
              ChatGPT
            </span>
            <span className="px-2.5 py-1 rounded-lg bg-bg border border-border font-mono text-[11px] text-muted">
              Gemini
            </span>
            <span className="px-2.5 py-1 rounded-lg bg-bg border border-border font-mono text-[11px] text-muted">
              Cursor IDE
            </span>
            <span className="px-2.5 py-1 rounded-lg bg-bg border border-border font-mono text-[11px] text-muted">
              Perplexity
            </span>
          </div>
        </div>

        {/* Card 2: Tamper-Proof Evaluation */}
        <div className="p-6 sm:p-7 rounded-3xl border border-border bg-surface shadow-xs flex flex-col justify-between space-y-4">
          <div className="space-y-3">
            <div className="w-10 h-10 rounded-2xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center font-bold">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <h3 className="font-serif text-xl font-bold text-ink">
              Tamper-Proof Evaluation
            </h3>
            <p className="text-xs sm:text-sm text-muted leading-relaxed">
              Answer keys and explanations are stored server-side. Students can never inspect browser code or network packets to reveal answers before submission.
            </p>
          </div>

          <div className="text-[11px] font-mono text-emerald-600 dark:text-emerald-400 font-semibold">
            ✓ 12ms cryptographic evaluation
          </div>
        </div>

        {/* Card 3: Classroom Distribution */}
        <div className="p-6 sm:p-7 rounded-3xl border border-border bg-surface shadow-xs flex flex-col justify-between space-y-4">
          <div className="space-y-3">
            <div className="w-10 h-10 rounded-2xl bg-accent/20 text-accent flex items-center justify-center font-bold">
              <QrCode className="w-5 h-5" />
            </div>
            <h3 className="font-serif text-xl font-bold text-ink">
              Classroom & WhatsApp Ready
            </h3>
            <p className="text-xs sm:text-sm text-muted leading-relaxed">
              Every batch gets a memorable 6-character shortcode, a 1-tap WhatsApp broadcast link, and a large printable QR code for projector slides and blackboards.
            </p>
          </div>

          <div className="text-[11px] font-mono text-muted">
            Code: SCI10A · Instant Student Join
          </div>
        </div>

        {/* Card 4: Frictionless Batch Monetization */}
        <div className="p-6 sm:p-7 rounded-3xl border border-border bg-surface shadow-xs flex flex-col justify-between space-y-4">
          <div className="space-y-3">
            <div className="w-10 h-10 rounded-2xl bg-primary-soft text-primary flex items-center justify-center font-bold">
              <CreditCard className="w-5 h-5" />
            </div>
            <h3 className="font-serif text-xl font-bold text-ink">
              Batch Monetization
            </h3>
            <p className="text-xs sm:text-sm text-muted leading-relaxed">
              Set your monthly price per batch (₹199 to ₹4,999). Students pay via 1-tap UPI or cards. You keep {tutorKeepPercent}% net earnings; Classy takes {PLATFORM_FEE_PERCENT}% only on paid student fees.
            </p>
          </div>

          <div className="text-[11px] font-semibold text-primary">
            ₹0 upfront fee · Keep {tutorKeepPercent}% net
          </div>
        </div>

        {/* Card 5: Offline-First Mobile App */}
        <div className="p-6 sm:p-7 rounded-3xl border border-border bg-surface shadow-xs flex flex-col justify-between space-y-4">
          <div className="space-y-3">
            <div className="w-10 h-10 rounded-2xl bg-accent/20 text-accent flex items-center justify-center font-bold">
              <Smartphone className="w-5 h-5" />
            </div>
            <h3 className="font-serif text-xl font-bold text-ink">
              Offline-First Mobile App
            </h3>
            <p className="text-xs sm:text-sm text-muted leading-relaxed">
              Revision notes and study summaries opened once in the mobile app are cached for 30 days. Students can revise on buses, subways, or in spotty Wi-Fi zones.
            </p>
          </div>

          <div className="text-[11px] font-mono text-muted">
            Zero app-store friction · Works everywhere
          </div>
        </div>

        {/* Card 6: Zero AI In-App Guarantee (Full Width on 3-col) */}
        <div className="md:col-span-3 p-6 sm:p-7 rounded-3xl border border-primary/20 bg-primary/5 shadow-xs flex flex-col sm:flex-row items-center justify-between gap-6">
          <div className="space-y-2 max-w-2xl">
            <div className="inline-flex items-center gap-1.5 px-3 py-0.5 rounded-full bg-primary-soft text-primary text-xs font-semibold">
              <Lock className="w-3.5 h-3.5" /> Strict Educator Privacy
            </div>
            <h3 className="font-serif text-2xl font-bold text-ink">
              Zero AI in-app. Your teaching IP is 100% yours.
            </h3>
            <p className="text-xs sm:text-sm text-muted leading-relaxed">
              We never host LLMs inside our servers and we never train on your questions or student answers. You bring your own AI account; Classy simply provides the operational execution engine.
            </p>
          </div>

          <div className="shrink-0 p-4 rounded-2xl bg-surface border border-border text-center">
            <span className="font-mono text-xs text-muted block">Architecture Policy</span>
            <span className="font-serif font-bold text-primary text-lg">No Model Training</span>
          </div>
        </div>
      </div>
    </section>
  );
}
