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
    question: "Who can become a tutor on Classy?",
    answer:
      "Anyone! Whether you are a school teacher, private tutor, college student mentoring juniors, test-prep coach, coding mentor, or hobby instructor — you can sign up for free in 30 seconds, create your batch, and invite students immediately.",
  },
  {
    question: "How do my students join my classroom?",
    answer:
      "Every batch you create generates a unique 6-letter join code and a 1-tap WhatsApp invite link. Share it with your students via WhatsApp, Telegram, or email. They open the link and join your classroom instantly.",
  },
  {
    question: "Do students need to install an app from the Play Store or App Store?",
    answer:
      "No downloads are required. Students open your batch link directly in any mobile or desktop browser (Chrome, Safari). They can also tap 'Add to Home Screen' to use it as a standalone, lightweight app with zero storage overhead.",
  },
  {
    question: "Is Classy free to use for teachers?",
    answer:
      "Yes, 100% free. You can create unlimited batches, invite unlimited students, publish unlimited study notes, run timed practice quizzes, and collect homework with zero monthly subscription fees.",
  },
  {
    question: "Can I collect fees for my batches or courses?",
    answer:
      `Yes! If you choose to set an enrollment fee for any batch, students can pay securely using Razorpay UPI, credit/debit cards, or netbanking. Classy retains a transparent ${PLATFORM_FEE_PERCENT}% platform fee to cover payment gateway charges and cloud servers, and you receive ${100 - PLATFORM_FEE_PERCENT}% transferred directly to your bank account.`,
  },
  {
    question: "Can students cheat or view quiz answer keys in the browser?",
    answer:
      "No. Correct answers and step-by-step explanations are securely evaluated on the server. They are never sent to the student's device until after their test attempt is submitted and locked.",
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
