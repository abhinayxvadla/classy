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
    question: "Do students need to install an app from the App Store or Play Store?",
    answer:
      "No downloads are required. Students open your batch link in any browser (Safari, Chrome) on mobile or laptop. They can tap 'Add to Home Screen' to use it as a standalone progressive web app with offline support.",
  },
  {
    question: "Which AI tools are supported?",
    answer:
      "Classy supports the 4 leading AI platforms: Claude (Claude Desktop & Claude Code CLI), ChatGPT (Web & Mobile via Custom GPT Actions), Google Gemini (AI Studio & Function Calling), and Perplexity (Custom Connectors). You can also manage your classroom directly through our web dashboard without connecting an AI tool.",
  },
  {
    question: "How does batch monetization and the platform fee work?",
    answer:
      `Classy is completely free for tutors to create unlimited free batches and share study material. If you set a price for a premium batch, students enroll via Razorpay UPI or cards. Classy retains a transparent ${PLATFORM_FEE_PERCENT}% platform fee to cover payment gateway charges and cloud infrastructure, and you receive ${100 - PLATFORM_FEE_PERCENT}% directly in your bank account.`,
  },
  {
    question: "Can students cheat or inspect quiz answer keys in the browser?",
    answer:
      "No. Correct answers and step-by-step explanations are evaluated on the server. They are never sent to the student's device until after their test attempt is finalized and locked.",
  },
  {
    question: "Can I manage multiple batches and subjects?",
    answer:
      "Yes. You can create unlimited distinct batches (e.g. 'Class 10 Physics', 'Class 12 Calculus', 'NEET Biology Crash Course') with separate student rosters, join codes, and course streams.",
  },
  {
    question: "Does Classy train on my questions or student data?",
    answer:
      "No. Classy does not bundle or train any internal AI models. Your prompts and coursework remain entirely your intellectual property.",
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
