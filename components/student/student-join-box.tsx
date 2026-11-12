"use client";

import React from "react";
import { KeyRound } from "lucide-react";
import { Card } from "@/components/ui/card";
import { SegmentedJoinCodeInput } from "@/components/student/segmented-join-code-input";

interface StudentJoinBoxProps {
  onJoined?: (batchId: string) => void;
}

export function StudentJoinBox({ onJoined }: StudentJoinBoxProps) {
  return (
    <Card className="p-5 sm:p-6 rounded-2xl border-border bg-surface shadow-xs">
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-5">
        <div className="space-y-1.5 max-w-md">
          <div className="flex items-center gap-2">
            <div className="h-8 w-8 rounded-lg bg-primary-soft text-primary flex items-center justify-center shrink-0">
              <KeyRound className="h-4 w-4" />
            </div>
            <h2 className="font-serif text-lg font-bold text-ink">
              Join a Tutor&apos;s Batch
            </h2>
          </div>
          <p className="text-xs sm:text-sm text-muted leading-relaxed">
            Have a 6-character code from your tutor or classroom? Enter or paste it below to join.
          </p>
        </div>

        <div className="w-full lg:w-auto">
          <SegmentedJoinCodeInput
            onSuccess={(batchId, status) => {
              if (status === "joined" && onJoined) {
                onJoined(batchId);
              }
            }}
          />
        </div>
      </div>
    </Card>
  );
}
