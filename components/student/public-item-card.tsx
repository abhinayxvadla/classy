"use client";

import React, { useState, useTransition } from "react";
import Link from "next/link";
import { toast } from "sonner";
import {
  FileText,
  HelpCircle,
  ClipboardList,
  Megaphone,
  Clock,
  CheckCircle2,
  UserPlus,
  Loader2,
  ArrowRight,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { requestJoinAction } from "@/app/actions/student";
import type { ItemType, RosterStatus } from "@/lib/database.types";

export interface PublicItemCardProps {
  id: string;
  type: ItemType;
  title: string;
  subject: string | null;
  grade: string | null;
  batchId: string | null;
  batchName?: string | null;
  tutorName?: string | null;
  initialStatus?: RosterStatus | null;
}

export function PublicItemCard({
  type,
  title,
  subject,
  grade,
  batchId,
  batchName,
  tutorName,
  initialStatus = null,
}: PublicItemCardProps) {
  const [isPending, startTransition] = useTransition();
  const [status, setStatus] = useState<RosterStatus | null>(initialStatus);

  const getItemIcon = () => {
    switch (type) {
      case "quiz":
        return <HelpCircle className="h-4 w-4 text-primary" />;
      case "notes":
        return <FileText className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />;
      case "assignment":
        return <ClipboardList className="h-4 w-4 text-indigo-600 dark:text-indigo-400" />;
      case "announcement":
        return <Megaphone className="h-4 w-4 text-accent" />;
    }
  };

  const getItemTypeLabel = () => {
    switch (type) {
      case "quiz":
        return "Quiz";
      case "notes":
        return "Notes";
      case "assignment":
        return "Assignment";
      case "announcement":
        return "Announcement";
    }
  };

  const handleRequestJoin = () => {
    if (!batchId) {
      toast.error("This item is not linked to a batch.");
      return;
    }

    startTransition(async () => {
      try {
        const res = await requestJoinAction(batchId);
        if (res.error) {
          toast.error(res.error);
        } else if (res.status) {
          setStatus(res.status);
          if (res.status === "joined") {
            toast.success("You are now enrolled in this batch!");
          } else {
            toast.info("Request sent! Your tutor will approve you soon.");
          }
        }
      } catch (err: unknown) {
        toast.error((err as Error)?.message || "Failed to request join.");
      }
    });
  };

  return (
    <Card className="p-4 sm:p-5 rounded-2xl border-border bg-surface shadow-xs flex flex-col justify-between space-y-4 hover:border-primary/40 transition-all">
      <div className="space-y-3">
        {/* Header row: type + subject + grade */}
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <div className="h-7 w-7 rounded-lg bg-bg flex items-center justify-center shrink-0 border border-border">
              {getItemIcon()}
            </div>
            <span className="text-xs font-semibold uppercase tracking-wider text-muted">
              {getItemTypeLabel()}
            </span>
          </div>

          <div className="flex items-center gap-1.5">
            {subject && (
              <Badge variant="outline" className="text-[10px] border-border text-ink">
                {subject}
              </Badge>
            )}
            {grade && (
              <Badge variant="outline" className="text-[10px] border-border text-muted">
                {grade}
              </Badge>
            )}
          </div>
        </div>

        {/* Title */}
        <h3 className="font-serif font-bold text-ink text-base sm:text-lg leading-snug line-clamp-2">
          {title}
        </h3>

        {/* Batch & Tutor Info */}
        {(batchName || tutorName) && (
          <div className="text-xs text-muted flex items-center gap-1.5 flex-wrap">
            {batchName && <span>Batch: <strong className="text-ink font-medium">{batchName}</strong></span>}
            {batchName && tutorName && <span>•</span>}
            {tutorName && <span>Tutor: {tutorName}</span>}
          </div>
        )}
      </div>

      {/* Action footer */}
      <div className="pt-3 border-t border-border flex items-center justify-between gap-2">
        <Badge className="bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 text-[10px] font-semibold border-emerald-500/20">
          Free Library
        </Badge>

        <div>
          {status === "joined" ? (
            batchId ? (
              <Link
                href={`/s/batches/${batchId}`}
                className="inline-flex items-center gap-1 text-xs font-semibold text-primary hover:underline"
              >
                <CheckCircle2 className="h-3.5 w-3.5 text-success" />
                <span>Enrolled • Open</span>
                <ArrowRight className="h-3 w-3" />
              </Link>
            ) : (
              <span className="inline-flex items-center gap-1 text-xs text-success font-medium">
                <CheckCircle2 className="h-3.5 w-3.5" /> Enrolled
              </span>
            )
          ) : status === "pending" ? (
            <Badge variant="outline" className="text-xs border-warning/40 text-warning gap-1 py-1">
              <Clock className="h-3 w-3" /> Waiting for approval
            </Badge>
          ) : batchId ? (
            <Button
              onClick={handleRequestJoin}
              disabled={isPending}
              variant="outline"
              size="sm"
              className="text-xs h-8 gap-1.5 border-primary/40 hover:bg-primary-soft text-primary font-medium"
            >
              {isPending ? (
                <>
                  <Loader2 className="h-3 w-3 animate-spin" />
                  <span>Requesting...</span>
                </>
              ) : (
                <>
                  <UserPlus className="h-3.5 w-3.5" />
                  <span>Request to join</span>
                </>
              )}
            </Button>
          ) : null}
        </div>
      </div>
    </Card>
  );
}
