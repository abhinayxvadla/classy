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
    question: "How is Classy different from just copying questions from ChatGPT?",
    answer:
      "A raw ChatGPT conversation or PDF is static, easy to leak, impossible to time, and requires manual grading. Classy turns your AI prompt directly into an interactive classroom on your students' phones—complete with countdown timers, server-encrypted answer keys, instant 12ms grading, and automated scoreboards.",
  },
  {
    question: "Do I need a special or paid AI subscription?",
    answer:
      "No. Classy works with both free and paid AI tiers. You can connect Claude Desktop, ChatGPT, Google Gemini, Perplexity, or Cursor using our standard MCP endpoint.",
  },
  {
    question: "Do students need to download anything from the App Store or Play Store?",
    answer:
      "No app store downloads or updates needed. Students simply open your batch link in any browser (Safari, Chrome) and tap 'Add to Home Screen' to get the full, distraction-free mobile app experience with offline revision support.",
  },
  {
    question: "Can students cheat by inspecting browser code or HTML?",
    answer:
      "Never. Correct answers and step-by-step explanations are securely isolated on our backend and are never sent to the student client until after their test attempt has been submitted and permanently locked.",
  },
  {
    question: `How does batch pricing and the ${PLATFORM_FEE_PERCENT}% platform fee work?`,
    answer:
      `Classy is completely free for tutors to create unlimited batches and publish free coursework. If you choose to monetize a batch with a monthly fee (e.g. ₹499/month), students pay via 1-tap UPI or cards. Classy retains a modest ${PLATFORM_FEE_PERCENT}% platform fee to cover server infrastructure and payment processing, and you keep ${100 - PLATFORM_FEE_PERCENT}% net earnings.`,
  },
  {
    question: "Does Classy train on my questions or student data?",
    answer:
      "Zero. Classy has no internal AI models and will never train on your teaching IP. Your prompts remain between you and your AI provider; Classy only acts as the authenticated delivery bridge for your classroom.",
  },
];

export function FAQSection() {
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  const toggle = (index: number) => {
    setOpenIndex(openIndex === index ? null : index);
  };

  return (
    <div className="space-y-3 w-full max-w-3xl mx-auto">
      {FAQS.map((faq, index) => {
        const isOpen = openIndex === index;
        return (
          <div
            key={index}
            className="rounded-2xl border border-border bg-surface transition-all overflow-hidden"
          >
            <button
              onClick={() => toggle(index)}
              className="w-full p-4 sm:p-5 flex items-center justify-between text-left font-serif font-bold text-base sm:text-lg text-ink hover:text-primary transition-colors gap-4 cursor-pointer"
              aria-expanded={isOpen}
            >
              <span>{faq.question}</span>
              <ChevronDown
                className={cn(
                  "w-5 h-5 text-muted shrink-0 transition-transform duration-200",
                  isOpen && "transform rotate-180 text-primary"
                )}
              />
            </button>
            {isOpen && (
              <div className="px-4 sm:px-5 pb-5 text-xs sm:text-sm text-muted leading-relaxed border-t border-border/40 pt-3">
                {faq.answer}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
