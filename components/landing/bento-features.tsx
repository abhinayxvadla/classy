import {
  HelpCircle,
  FileText,
  ClipboardList,
  QrCode,
  CreditCard,
  Bot,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { PLATFORM_FEE_PERCENT } from "@/lib/config";

export function BentoFeatures() {
  const tutorKeepPercent = 100 - PLATFORM_FEE_PERCENT;

  const capabilities = [
    {
      icon: HelpCircle,
      tag: "Assessment",
      title: "Interactive Timed Quizzes",
      description:
        "Publish multiple-choice assessments with countdown timers and server-encrypted answer keys. Students receive instant scores and step-by-step explanations.",
    },
    {
      icon: FileText,
      tag: "Coursework",
      title: "Markdown Lecture Drops",
      description:
        "Release clean revision notes, formula sheets, and study materials formatted in rich Markdown. Students can read offline on mobile without clutter.",
    },
    {
      icon: ClipboardList,
      tag: "Evaluation",
      title: "Homework & Assignment Grading",
      description:
        "Assign problem sets with explicit deadlines and maximum marks. Review submissions and return constructive feedback privately in seconds.",
    },
    {
      icon: QrCode,
      tag: "Onboarding",
      title: "WhatsApp-Ready Join Links",
      description:
        "Generate a 6-character short code or 1-tap invite link for each batch. Pre-roster students via spreadsheet or approve them as they arrive.",
    },
    {
      icon: CreditCard,
      tag: "Monetization",
      title: "Built-In Razorpay Payouts",
      description:
        `Monetize specialized crash courses and revision batches effortlessly. Students pay securely via UPI or cards; ${tutorKeepPercent}% is transferred directly to your bank account.`,
    },
    {
      icon: Bot,
      tag: "Integration",
      title: "Universal Assistant Support",
      description:
        "Control your entire classroom from Claude Desktop, Claude Code, ChatGPT, Gemini, or Perplexity. One personal endpoint links all your workflows.",
    },
  ];

  return (
    <section id="capabilities" className="w-full my-20 text-left">
      <div className="text-center mb-12">
        <Badge
          variant="outline"
          className="rounded-full border-primary/20 bg-primary-soft text-primary font-semibold text-xs mb-3 px-3 py-1"
        >
          Capabilities
        </Badge>
        <h2 className="font-serif text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight text-ink">
          Everything You Need to Run Your Classes
        </h2>
        <p className="text-xs sm:text-sm text-muted max-w-xl mx-auto mt-3 leading-relaxed">
          Designed specifically for independent educators, coaching tutors, and test-prep instructors.
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

                <h3 className="font-serif text-xl font-bold text-ink">
                  {cap.title}
                </h3>

                <p className="text-xs sm:text-sm text-muted leading-relaxed">
                  {cap.description}
                </p>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}
