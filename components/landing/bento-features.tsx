import {
  Users,
  QrCode,
  HelpCircle,
  FileText,
  ClipboardList,
  CreditCard,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { PLATFORM_FEE_PERCENT } from "@/lib/config";

export function BentoFeatures() {
  const tutorKeepPercent = 100 - PLATFORM_FEE_PERCENT;

  const capabilities = [
    {
      icon: Users,
      tag: "Anyone Can Teach",
      title: "Launch Batches in 30 Seconds",
      description:
        "Whether you teach school syllabus, competitive entrance tests, coding, or spoken languages — anyone can create a batch and start teaching immediately.",
    },
    {
      icon: QrCode,
      tag: "Zero-Friction Invites",
      title: "1-Tap WhatsApp & Code Invites",
      description:
        "Invite your students with a clean 6-letter short code or direct WhatsApp link. Students open in their phone browser without downloading an app.",
    },
    {
      icon: HelpCircle,
      tag: "Assessment",
      title: "Interactive Timed Quizzes",
      description:
        "Set up multiple-choice tests with countdown timers. Answers are scored automatically with instant result breakdowns and step-by-step explanations.",
    },
    {
      icon: FileText,
      tag: "Study Material",
      title: "Clean Revision Notes & Drops",
      description:
        "Release structured study notes, formula cheat sheets, and summaries formatted in crisp Markdown. Students read offline on any phone without chat clutter.",
    },
    {
      icon: ClipboardList,
      tag: "Evaluation",
      title: "Homework Tasks & Grading",
      description:
        "Post problem sets with clear submission deadlines and maximum marks. Review student submissions and return private grades and constructive feedback.",
    },
    {
      icon: CreditCard,
      tag: "Earnings",
      title: "Built-In UPI & Card Monetization",
      description:
        `Monetize crash courses and revision batches effortlessly. Students pay securely via Razorpay UPI or cards; ${tutorKeepPercent}% is transferred directly to your bank account.`,
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
          Built specifically for independent tutors, private coaching teachers, and mentors.
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

              <div className="pt-2 border-t border-border/40 text-[11px] font-medium text-primary">
                Included in free educator account →
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}
