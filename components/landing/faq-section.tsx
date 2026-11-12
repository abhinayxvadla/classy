"use client";

import { useState } from "react";
import { ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";

interface FAQItem {
  question: string;
  answer: string;
}

const FAQS: FAQItem[] = [
  {
    question: "Does Classy contain its own AI or train on my data?",
    answer:
      "No. Classy has zero AI inside the application. We never bundle LLMs, we never send your data to external model training pipelines, and we never touch your prompts. Your AI remains completely inside your own Claude, ChatGPT, Gemini, or Perplexity client. Classy only exposes an authenticated MCP server that receives the structured coursework you ask your assistant to create.",
  },
  {
    question: "How do students join my batches?",
    answer:
      "Each batch has a unique 6-character join code (e.g. 'SCI10A'), an invite link (/join/CODE), a 1-click WhatsApp share button, and a scannable classroom QR code. Students can enter the code on the student portal or click your link to join instantly.",
  },
  {
    question: "How does quiz grading work?",
    answer:
      "When your AI pushes a quiz to Classy, the correct answer keys and explanations are stored securely on our server and never exposed to the student client. When a student submits their attempt, Classy automatically grades it against the fixed answer key in milliseconds and publishes the verified score.",
  },
  {
    question: "How does batch monetization and pricing work?",
    answer:
      "Classy is 100% free for tutors to create unlimited batches and free coursework. When you choose to set a monthly premium fee for a batch, students unlock it via seamless Razorpay checkout (UPI, cards, netbanking). Classy deducts a modest 15% platform fee and you keep 85% net earnings.",
  },
  {
    question: "Can students access their coursework offline?",
    answer:
      "Yes. Classy is built as a progressive web application (PWA). Opened study notes and revision materials are automatically cached in the background so students can review them without an active internet connection.",
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
              className="w-full p-4 sm:p-5 flex items-center justify-between text-left font-serif font-bold text-base sm:text-lg text-ink hover:text-primary transition-colors gap-4"
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
