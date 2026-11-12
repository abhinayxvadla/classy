"use client";

import React, { useState, useRef, useTransition } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { ArrowRight, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { joinBatchByCodeAction } from "@/app/actions/student";
import { cn } from "@/lib/utils";

interface SegmentedJoinCodeInputProps {
  onSuccess?: (batchId: string, status: "joined" | "pending") => void;
  autoFocus?: boolean;
  className?: string;
  buttonText?: string;
  redirectOnJoin?: boolean;
}

export function SegmentedJoinCodeInput({
  onSuccess,
  autoFocus = false,
  className,
  buttonText = "Join Batch",
  redirectOnJoin = true,
}: SegmentedJoinCodeInputProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [digits, setDigits] = useState<string[]>(["", "", "", "", "", ""]);
  const inputRefs = useRef<Array<HTMLInputElement | null>>([]);

  const cleanChar = (char: string) => {
    return char.toUpperCase().replace(/[^A-Z0-9]/g, "");
  };

  const handleSlotChange = (index: number, value: string) => {
    const cleaned = cleanChar(value);
    if (!cleaned) {
      const next = [...digits];
      next[index] = "";
      setDigits(next);
      return;
    }

    // Single character input
    const char = cleaned.slice(-1);
    const next = [...digits];
    next[index] = char;
    setDigits(next);

    // Auto-advance to next slot
    if (index < 5) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleKeyDown = (
    index: number,
    e: React.KeyboardEvent<HTMLInputElement>
  ) => {
    if (e.key === "Backspace") {
      if (!digits[index] && index > 0) {
        inputRefs.current[index - 1]?.focus();
      }
    } else if (e.key === "ArrowLeft" && index > 0) {
      e.preventDefault();
      inputRefs.current[index - 1]?.focus();
    } else if (e.key === "ArrowRight" && index < 5) {
      e.preventDefault();
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handlePaste = (e: React.ClipboardEvent<HTMLInputElement>) => {
    e.preventDefault();
    const raw = e.clipboardData.getData("text").trim().toUpperCase();

    // Extract 6 alphanumeric chars from text or url (e.g. /join/7K2M9X)
    const match = raw.match(/[A-Z0-9]{6}/);
    if (match) {
      const chars = match[0].split("");
      setDigits(chars);
      inputRefs.current[5]?.focus();
    } else {
      // Just take up to 6 valid characters
      const filtered = raw.replace(/[^A-Z0-9]/g, "").slice(0, 6);
      if (filtered.length > 0) {
        const next = ["", "", "", "", "", ""];
        for (let i = 0; i < filtered.length; i++) {
          next[i] = filtered[i];
        }
        setDigits(next);
        const focusIdx = Math.min(filtered.length, 5);
        inputRefs.current[focusIdx]?.focus();
      }
    }
  };

  const fullCode = digits.join("");
  const isComplete = fullCode.length === 6;

  const handleSubmit = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!isComplete) {
      toast.error("Please enter a 6-character join code.");
      return;
    }

    startTransition(async () => {
      try {
        const res = await joinBatchByCodeAction(fullCode);
        if (res.error) {
          toast.error(res.error);
        } else if (res.batchId) {
          if (res.status === "joined") {
            toast.success("Joined batch successfully!");
            if (onSuccess) {
              onSuccess(res.batchId, "joined");
            }
            if (redirectOnJoin) {
              router.push(`/s/batches/${res.batchId}`);
              router.refresh();
            }
          } else if (res.status === "pending") {
            toast.info("Request sent! Your tutor will approve you soon.");
            if (onSuccess) {
              onSuccess(res.batchId, "pending");
            }
            router.refresh();
          }
        }
      } catch (err: unknown) {
        toast.error((err as Error)?.message || "Failed to join batch.");
      }
    });
  };

  return (
    <form
      onSubmit={handleSubmit}
      className={cn(
        "flex flex-col sm:flex-row items-center gap-3 w-full",
        className
      )}
    >
      {/* 6 Segmented Boxes */}
      <div className="flex items-center gap-1.5 sm:gap-2 justify-center">
        {digits.map((digit, index) => (
          <input
            key={index}
            ref={(el) => {
              inputRefs.current[index] = el;
            }}
            type="text"
            inputMode="text"
            autoCapitalize="characters"
            autoComplete="one-time-code"
            maxLength={1}
            value={digit}
            autoFocus={autoFocus && index === 0}
            onChange={(e) => handleSlotChange(index, e.target.value)}
            onKeyDown={(e) => handleKeyDown(index, e)}
            onPaste={handlePaste}
            className={cn(
              "w-10 h-12 sm:w-11 sm:h-12 rounded-xl text-center text-lg sm:text-xl font-mono font-bold uppercase",
              "border bg-surface text-ink transition-all outline-hidden select-all shadow-xs",
              digit
                ? "border-primary bg-primary-soft/30 text-primary ring-2 ring-primary/20"
                : "border-border hover:border-primary/50 focus:border-primary focus:ring-2 focus:ring-primary/20"
            )}
          />
        ))}
      </div>

      {/* Submit Button */}
      <Button
        type="submit"
        disabled={!isComplete || isPending}
        className="w-full sm:w-auto h-12 px-6 rounded-xl font-semibold bg-primary hover:bg-primary/90 text-primary-foreground shadow-xs gap-2 shrink-0 text-sm"
      >
        {isPending ? (
          <>
            <Loader2 className="h-4 w-4 animate-spin" />
            <span>Joining...</span>
          </>
        ) : (
          <>
            <span>{buttonText}</span>
            <ArrowRight className="h-4 w-4" />
          </>
        )}
      </Button>
    </form>
  );
}
