"use client";

import * as React from "react";
import Link from "next/link";
import { ArrowLeft, Megaphone, Calendar } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";

interface AnnouncementViewerProps {
  title: string;
  message: string;
  batchId: string | null;
  batchName?: string;
  tutorName?: string;
  createdAt: string;
}

export function AnnouncementViewer({
  title,
  message,
  batchId,
  batchName,
  tutorName,
  createdAt,
}: AnnouncementViewerProps) {
  return (
    <div className="w-full max-w-2xl mx-auto space-y-6 pb-20">
      <div className="flex items-center justify-between text-sm text-muted">
        {batchId ? (
          <Link
            href={`/s/batches/${batchId}`}
            className="hover:text-ink transition-colors flex items-center gap-1 font-medium"
          >
            <ArrowLeft className="h-4 w-4" />
            <span>{batchName || "Batch Feed"}</span>
          </Link>
        ) : (
          <Link
            href="/s/library"
            className="hover:text-ink transition-colors flex items-center gap-1 font-medium"
          >
            <ArrowLeft className="h-4 w-4" />
            <span>Public Library</span>
          </Link>
        )}
      </div>

      <Card className="rounded-3xl border-border bg-surface shadow-xs p-6 sm:p-8 space-y-5">
        <div className="flex items-center gap-2">
          <Badge className="bg-warning/15 text-warning border-transparent text-xs font-semibold gap-1">
            <Megaphone className="h-3 w-3" /> Announcement
          </Badge>
          <span className="text-xs text-muted flex items-center gap-1">
            <Calendar className="h-3 w-3" />
            {new Date(createdAt).toLocaleDateString(undefined, {
              month: "short",
              day: "numeric",
              year: "numeric",
            })}
          </span>
        </div>

        <h1 className="font-serif text-2xl sm:text-3xl font-bold text-ink">
          {title}
        </h1>

        {tutorName && (
          <p className="text-xs text-muted">
            Posted by <strong className="text-ink font-medium">{tutorName}</strong>
          </p>
        )}

        <div className="p-5 rounded-2xl bg-bg border border-border text-ink/90 text-sm sm:text-base leading-relaxed whitespace-pre-wrap">
          {message}
        </div>
      </Card>
    </div>
  );
}
