"use client";

import { useState } from "react";
import { ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";
import { PLATFORM_FEE_PERCENT } from "@/lib/config";

interface FAQItem {
  question: string;
  answer: string;
}

const FAQS: FAQItem[] = [
  {
    question: "What does 'You talk to your AI. Classy runs the class' mean?",
    answer:
      "Instead of spending hours manually creating forms, setting timers, formatting PDFs, and copying links into WhatsApp, you simply tell your favorite AI (Claude, ChatGPT, Cursor, or Classy's built-in assistant) what you need (e.g., 'Draft a 15-minute quiz on Newton's Laws and push to Batch 10-A'). Classy automatically parses your request, turns it into an interactive mobile experience, notifies your students, and grades submissions automatically.",
  },
  {
    question: "Do my students need AI accounts or ChatGPT subscriptions?",
    answer:
      "No! Your students do not need any AI accounts, API keys, or subscriptions. They receive a clean, focused, distraction-free mobile classroom feed where they take timed quizzes, read revision notes, and submit homework with zero complexity.",
  },
  {
    question: "Which AI models or apps can I connect with Classy?",
    answer:
      "You can talk to Classy directly via the built-in web dashboard, or connect external AI desktop and coding tools (like Claude Desktop, Cursor, or any MCP-compatible agent) using your private Classy token found under your Tutor Account settings.",
  },
  {
    question: "Do students need to install an app from the Play Store or App Store?",
    answer:
      "No downloads are required. Students open your 1-tap batch invite link in any mobile browser (Chrome, Safari). They can also tap 'Add to Home Screen' to use it as a lightweight Progressive Web App (PWA) with instant offline caching.",
  },
  {
    question: "Can students view the correct answers or cheat before submitting?",
    answer:
      "No. All answer keys and step-by-step explanations are securely stored and validated on the server. They are never sent to the student's device until after their test attempt has been officially submitted and locked.",
  },
  {
    question: "Is Classy free to use for teachers?",
    answer:
      "Yes, 100% free for open classrooms. You can create unlimited batches, invite unlimited students, publish unlimited study notes, run timed practice quizzes, and assign homework with zero monthly subscription fees.",
  },
  {
    question: "Can I collect fees for my coaching batches or courses?",
    answer:
      `Yes! If you choose to set an enrollment fee for any batch, students can pay securely using Razorpay UPI, credit/debit cards, or netbanking. Classy retains a transparent ${PLATFORM_FEE_PERCENT}% platform fee to cover gateway charges and server hosting, and you receive ${100 - PLATFORM_FEE_PERCENT}% transferred directly to your bank account with automated receipts sent to parents.`,
  },
];

export function FAQSection() {
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  const toggle = (index: number) => {
    setOpenIndex(openIndex === index ? null : index);
  };

  return (
    <div className="space-y-3 w-full max-w-3xl mx-auto text-left">
      {FAQS.map((faq, index) => {
        const isOpen = openIndex === index;
        return (
          <div
            key={index}
            className="rounded-2xl border border-border/80 bg-surface/90 transition-all overflow-hidden shadow-2xs"
          >
            <button
              type="button"
              onClick={() => toggle(index)}
              className="w-full flex items-center justify-between p-5 text-left text-sm sm:text-base font-semibold text-ink hover:text-primary transition-colors cursor-pointer"
            >
              <span>{faq.question}</span>
              <ChevronDown
                className={cn(
                  "w-4 h-4 text-muted transition-transform duration-200 shrink-0 ml-4",
                  isOpen && "rotate-180 text-primary"
                )}
              />
            </button>

            {isOpen && (
              <div className="px-5 pb-5 text-xs sm:text-sm text-muted leading-relaxed border-t border-border/40 pt-3">
                {faq.answer}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
