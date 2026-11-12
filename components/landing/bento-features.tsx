import {
  MessageSquare,
  Smartphone,
  Zap,
  FileText,
  QrCode,
  CreditCard,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";

export function BentoFeatures() {
  const capabilities = [
    {
      icon: MessageSquare,
      tag: "Conversational Ops",
      title: "Talk to Create & Dispatch",
      description:
        "Speak or prompt naturally to your favorite AI (Claude, ChatGPT, or Classy). Generate full quizzes, lecture recaps, and homework sets without filling out tedious form builders.",
    },
    {
      icon: Smartphone,
      tag: "Zero Friction",
      title: "Clean Student Mobile Hub",
      description:
        "Students join in seconds via a 1-tap browser link. No hefty App Store downloads or student logins required to start practicing.",
    },
    {
      icon: Zap,
      tag: "Automated",
      title: "Timed Quizzes & Instant Scoring",
      description:
        "Set custom countdown timers. Answers are evaluated securely on the server with step-by-step explanations unlocking the moment students submit.",
    },
    {
      icon: FileText,
      tag: "Study Materials",
      title: "Formula Drops & Study Decks",
      description:
        "Push structured Markdown notes, cheat sheets, and summaries straight to your students' pocket libraries, permanently organized and offline-ready.",
    },
    {
      icon: QrCode,
      tag: "Batch Roster",
      title: "1-Tap WhatsApp Batch Invites",
      description:
        "Launch a batch in 30 seconds. Share a direct 1-tap WhatsApp invite link to onboard an entire class without typing emails.",
    },
    {
      icon: CreditCard,
      tag: "Monetization",
      title: "Built-In UPI & Card Checkout",
      description:
        "Collect course and batch fees seamlessly through Razorpay UPI and cards. Payments settle directly into your bank account with zero manual spreadsheet tracking.",
    },
  ];

  return (
    <section id="capabilities" className="w-full my-20 text-left">
      <div className="text-center mb-12">
        <Badge
          variant="outline"
          className="rounded-full border-primary/20 bg-primary-soft text-primary font-semibold text-xs mb-3 px-3 py-1"
        >
          Classroom Superpowers
        </Badge>
        <h2 className="font-serif text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight text-ink">
          How Classy Runs The Class For You
        </h2>
        <p className="text-xs sm:text-sm text-muted max-w-xl mx-auto mt-3 leading-relaxed">
          The heavy lifting of running batches, creating tests, and managing student submissions happens on auto-pilot.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {capabilities.map((cap, idx) => {
          const Icon = cap.icon;
          return (
            <div
              key={idx}
              className="p-6 sm:p-7 rounded-3xl border border-border/80 bg-surface/90 shadow-2xs hover:border-primary/40 hover:shadow-xs transition-all flex flex-col justify-between space-y-4"
            >
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div className="w-10 h-10 rounded-2xl bg-primary-soft text-primary flex items-center justify-center font-bold">
                    <Icon className="w-5 h-5" />
                  </div>
                  <span className="px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-bg border border-border/60 text-muted">
                    {cap.tag}
                  </span>
                </div>

                <h3 className="font-serif text-lg font-bold text-ink">
                  {cap.title}
                </h3>

                <p className="text-xs sm:text-sm text-muted leading-relaxed">
                  {cap.description}
                </p>
              </div>

              <div className="pt-2 border-t border-border/50 text-[11px] text-primary font-medium flex items-center gap-1.5">
                <span>✓ Fully automated</span>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}
