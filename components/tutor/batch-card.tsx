"use client";

import * as React from "react";
import Link from "next/link";
import { toast } from "sonner";
import { Users, Copy, Check, ArrowRight, Clock } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button, buttonVariants } from "@/components/ui/button";
import { BatchShareDialog } from "@/components/tutor/batch-share-dialog";

interface BatchCardProps {
  id: string;
  name: string;
  subject?: string | null;
  grade?: string | null;
  joinCode: string;
  premiumPriceInr?: number;
  joinedCount?: number;
  pendingCount?: number;
  itemCount?: number;
}

export function BatchCard({
  id,
  name,
  subject,
  grade,
  joinCode,
  premiumPriceInr = 0,
  joinedCount = 0,
  pendingCount = 0,
  itemCount = 0,
}: BatchCardProps) {
  const [copied, setCopied] = React.useState(false);

  const handleCopyLink = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    try {
      const origin = typeof window !== "undefined" ? window.location.origin : "";
      const inviteUrl = `${origin}/join/${joinCode}`;
      await navigator.clipboard.writeText(inviteUrl);
      setCopied(true);
      toast.success("Invite link copied!");
      setTimeout(() => setCopied(false), 2000);
    } catch {
      toast.error("Failed to copy link");
    }
  };

  return (
    <div className="group rounded-2xl border border-border bg-surface hover:border-primary/40 hover:shadow-md transition-all p-5 sm:p-6 flex flex-col justify-between relative">
      <div>
        {/* Top Header: Chips & Pending Alert */}
        <div className="flex items-center justify-between gap-2 mb-3">
          <div className="flex flex-wrap items-center gap-1.5">
            {subject && (
              <Badge variant="secondary" className="rounded-full text-[11px] font-medium bg-primary-soft text-primary border-transparent">
                {subject}
              </Badge>
            )}
            {grade && (
              <Badge variant="outline" className="rounded-full text-[11px] font-medium text-muted">
                {grade}
              </Badge>
            )}
            {premiumPriceInr > 0 ? (
              <Badge variant="outline" className="rounded-full text-[11px] font-semibold text-accent border-accent/40 bg-accent/10">
                ₹{premiumPriceInr}/mo
              </Badge>
            ) : (
              <Badge variant="outline" className="rounded-full text-[11px] font-normal text-muted border-dashed">
                Free
              </Badge>
            )}
          </div>

          <div className="flex items-center gap-1">
            {pendingCount > 0 && (
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-500/15 text-amber-700 dark:text-amber-400 border border-amber-500/30 animate-pulse">
                <Clock className="w-2.5 h-2.5" />
                {pendingCount} Pending
              </span>
            )}
            <BatchShareDialog batchName={name} joinCode={joinCode} triggerVariant="icon" />
          </div>
        </div>

        {/* Batch Title */}
        <Link href={`/t/batches/${id}`} className="block focus:outline-hidden">
          <h3 className="font-serif text-xl font-bold tracking-tight text-ink group-hover:text-primary transition-colors line-clamp-1">
            {name}
          </h3>
        </Link>

        {/* Metrics Row */}
        <div className="flex items-center gap-4 mt-3 text-xs text-muted">
          <div className="flex items-center gap-1.5">
            <Users className="w-3.5 h-3.5 text-primary" />
            <span className="font-semibold text-ink">{joinedCount}</span>
            <span>student{joinedCount === 1 ? "" : "s"}</span>
          </div>
          <div className="h-3 w-px bg-border" />
          <div>
            <span className="font-semibold text-ink">{itemCount}</span>
            <span> item{itemCount === 1 ? "" : "s"}</span>
          </div>
        </div>
      </div>

      {/* Bottom Footer: Join Code & Link Copy */}
      <div className="pt-4 mt-4 border-t border-border flex items-center justify-between gap-2 text-xs">
        <div className="flex items-center gap-1.5">
          <span className="text-[11px] uppercase font-bold text-muted">Code:</span>
          <span className="font-mono font-bold text-primary tracking-wider px-2 py-0.5 rounded-md bg-primary-soft border border-primary/20">
            {joinCode}
          </span>
        </div>

        <div className="flex items-center gap-1.5">
          <Button
            size="sm"
            variant="ghost"
            onClick={handleCopyLink}
            className="h-8 px-2 rounded-lg text-xs text-muted hover:text-ink"
            title="Copy Invite Link"
          >
            {copied ? (
              <>
                <Check className="w-3.5 h-3.5 text-emerald-600 mr-1" />
                Copied
              </>
            ) : (
              <>
                <Copy className="w-3.5 h-3.5 mr-1" />
                Copy Link
              </>
            )}
          </Button>

          <Link
            href={`/t/batches/${id}`}
            className={buttonVariants({
              size: "sm",
              className: "h-8 px-3 rounded-lg text-xs font-semibold",
            })}
          >
            Open <ArrowRight className="w-3 h-3 ml-1" />
          </Link>
        </div>
      </div>
    </div>
  );
}
