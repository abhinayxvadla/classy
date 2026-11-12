import { Bot, ArrowRight, Smartphone, Sparkles, CheckCircle2, ShieldCheck, Zap } from "lucide-react";
import { Badge } from "@/components/ui/badge";

export function FlowVisual() {
  return (
    <div className="w-full my-12 p-6 sm:p-8 rounded-3xl bg-linear-to-b from-surface via-surface/90 to-surface/40 border border-border shadow-md">
      <div className="text-center mb-8">
        <Badge variant="outline" className="rounded-full border-primary/30 bg-primary-soft text-primary font-semibold text-xs mb-2">
          Architecture in Action
        </Badge>
        <h3 className="font-serif text-2xl sm:text-3xl font-bold text-ink">
          From Prompt to Student in Seconds
        </h3>
        <p className="text-xs sm:text-sm text-muted max-w-lg mx-auto mt-1">
          No copy-pasting, no clumsy form builders. Your AI speaks directly to your classroom.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-center relative">
        {/* Step 1: Your AI */}
        <div className="p-5 rounded-2xl bg-bg border border-border shadow-xs space-y-3 relative">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-xl bg-primary-soft text-primary flex items-center justify-center font-bold text-xs">
                <Bot className="w-4 h-4" />
              </div>
              <span className="font-semibold text-xs text-ink">Your AI Assistant</span>
            </div>
            <span className="text-[11px] font-mono text-muted">Claude / GPT</span>
          </div>

          <div className="p-3 rounded-xl bg-surface border border-border/80 text-xs text-ink/90 font-mono space-y-1.5 leading-relaxed">
            <p className="text-muted text-[11px] font-sans">You prompt:</p>
            <p className="text-ink font-semibold">&ldquo;Write a 5-question quiz on Plant Physiology for Class 10.&rdquo;</p>
            <div className="pt-2 border-t border-border/60 flex items-center gap-1.5 text-accent text-[11px]">
              <Zap className="w-3.5 h-3.5 animate-pulse" />
              <span>Calling Classy MCP tool...</span>
            </div>
          </div>
        </div>

        {/* Step 2: Classy Hub */}
        <div className="p-5 rounded-2xl bg-primary/5 border border-primary/20 shadow-xs space-y-3 relative">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-xl bg-primary text-primary-foreground flex items-center justify-center font-serif font-bold text-sm shadow-xs">
                C
              </div>
              <span className="font-semibold text-xs text-ink">Classy MCP Engine</span>
            </div>
            <Badge className="bg-primary-soft text-primary border-transparent text-[10px]">
              Zero AI In-App
            </Badge>
          </div>

          <div className="space-y-2 text-xs">
            <div className="flex items-center gap-2 p-2 rounded-lg bg-surface border border-border/60 text-ink">
              <ShieldCheck className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
              <span>Answer keys encrypted & protected</span>
            </div>
            <div className="flex items-center gap-2 p-2 rounded-lg bg-surface border border-border/60 text-ink">
              <Sparkles className="w-4 h-4 text-accent shrink-0" />
              <span>Assigned directly to Batch A roster</span>
            </div>
          </div>
        </div>

        {/* Step 3: Student Phone */}
        <div className="p-5 rounded-2xl bg-bg border border-border shadow-xs space-y-3 relative">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-xl bg-accent/20 text-accent flex items-center justify-center font-bold text-xs">
                <Smartphone className="w-4 h-4" />
              </div>
              <span className="font-semibold text-xs text-ink">Student Experience</span>
            </div>
            <span className="text-[11px] font-mono text-muted">PWA App</span>
          </div>

          <div className="p-3 rounded-xl bg-surface border border-border/80 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-serif font-bold text-ink">Plant Physiology Quiz</span>
              <span className="text-[10px] text-muted">5 Qs · 15m</span>
            </div>
            <div className="flex items-center justify-between pt-2 border-t border-border/60 text-xs">
              <span className="text-muted text-[11px]">Instant evaluation:</span>
              <span className="font-bold text-emerald-600 dark:text-emerald-400 flex items-center gap-1 text-xs">
                <CheckCircle2 className="w-3.5 h-3.5" /> 5/5 (100%)
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
