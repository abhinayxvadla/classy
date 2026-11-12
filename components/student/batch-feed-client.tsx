"use client";

import * as React from "react";
import Link from "next/link";
import {
  HelpCircle,
  FileText,
  BookOpen,
  Megaphone,
  Lock,
  Calendar,
  CheckCircle2,
  Clock,
  ArrowRight,
  Pin,
  Sparkles,
} from "lucide-react";
import { formatDistanceToNow, isPast } from "date-fns";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { buttonVariants } from "@/components/ui/button";
import { UnlockPremiumDialog } from "@/components/student/unlock-premium-dialog";
import type { ItemType } from "@/lib/database.types";

export interface StudentFeedItem {
  id: string;
  batch_id: string;
  type: ItemType;
  title: string;
  access: "free" | "premium";
  visibility: "batch" | "public";
  grade: string | null;
  subject: string | null;
  due_at: string | null;
  max_marks: number | null;
  created_at: string;
  locked: boolean;
  body: Record<string, unknown> | null;
  my_attempt: {
    id: string;
    score: number | null;
    total: number | null;
    submitted_at: string;
  } | null;
  my_submission: {
    id: string;
    status: "submitted" | "graded" | "released";
    submitted_at: string;
    marks: number | null;
    feedback: string | null;
  } | null;
}

interface BatchFeedClientProps {
  batchId: string;
  batchName: string;
  tutorName: string;
  subject: string | null;
  grade: string | null;
  hasPremium: boolean;
  premiumPriceInr: number;
  items: StudentFeedItem[];
}

type FilterType = "all" | "quiz" | "notes" | "assignment";

export function BatchFeedClient({
  batchId,
  batchName,
  tutorName,
  subject,
  grade,
  hasPremium,
  premiumPriceInr,
  items,
}: BatchFeedClientProps) {
  const [filter, setFilter] = React.useState<FilterType>("all");
  const [showUnlockModal, setShowUnlockModal] = React.useState(false);

  const premiumItemsCount = React.useMemo(() => {
    return items.filter((i) => i.access === "premium").length;
  }, [items]);

  // Find latest announcement to pin at top
  const announcements = items.filter((i) => i.type === "announcement");
  const latestAnnouncement = announcements.length > 0 ? announcements[0] : null;

  // Filter items (excluding the pinned announcement if we're showing all or notices, or keeping in feed)
  const filteredItems = React.useMemo(() => {
    return items.filter((item) => {
      if (filter === "all") return true;
      return item.type === filter;
    });
  }, [items, filter]);

  const getItemStatusBadge = (item: StudentFeedItem) => {
    if (item.locked) {
      return (
        <Badge className="bg-accent/20 text-accent-dark border-transparent text-[11px] font-semibold gap-1">
          <Lock className="h-3 w-3 text-accent" /> Premium Locked
        </Badge>
      );
    }

    if (item.type === "quiz") {
      if (item.my_attempt) {
        return (
          <Badge className="bg-success/15 text-success border-transparent text-[11px] font-medium gap-1">
            <CheckCircle2 className="h-3 w-3" /> Score {item.my_attempt.score}/{item.my_attempt.total}
          </Badge>
        );
      }
      return (
        <Badge variant="outline" className="text-[11px] text-muted border-border">
          Not started
        </Badge>
      );
    }

    if (item.type === "assignment") {
      if (item.my_submission) {
        if (item.my_submission.status === "released") {
          return (
            <Badge className="bg-success/15 text-success border-transparent text-[11px] font-medium gap-1">
              <CheckCircle2 className="h-3 w-3" /> Graded {item.my_submission.marks ?? "?"}/{item.max_marks ?? "?"}
            </Badge>
          );
        }
        if (item.my_submission.status === "graded") {
          return (
            <Badge className="bg-primary-soft text-primary border-transparent text-[11px] font-medium">
              Graded (Pending Release)
            </Badge>
          );
        }
        return (
          <Badge className="bg-primary-soft text-primary border-transparent text-[11px] font-medium gap-1">
            <Clock className="h-3 w-3" /> Submitted
          </Badge>
        );
      }
      return (
        <Badge variant="outline" className="text-[11px] text-muted border-border">
          Not started
        </Badge>
      );
    }

    if (item.type === "notes") {
      return (
        <Badge variant="outline" className="text-[11px] text-muted border-border">
          Notes
        </Badge>
      );
    }

    return null;
  };

  const getItemIcon = (type: ItemType) => {
    switch (type) {
      case "quiz":
        return <HelpCircle className="h-5 w-5 text-primary" />;
      case "notes":
        return <BookOpen className="h-5 w-5 text-ink" />;
      case "assignment":
        return <FileText className="h-5 w-5 text-accent" />;
      case "announcement":
        return <Megaphone className="h-5 w-5 text-warning" />;
    }
  };

  return (
    <div className="space-y-6">
      {/* Batch Header */}
      <section className="p-6 sm:p-8 rounded-3xl bg-surface border border-border shadow-xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="space-y-1.5">
            <div className="flex flex-wrap items-center gap-2">
              {subject && (
                <Badge variant="outline" className="text-xs text-ink border-border">
                  {subject}
                </Badge>
              )}
              {grade && (
                <Badge variant="outline" className="text-xs text-muted border-border">
                  {grade}
                </Badge>
              )}
              {hasPremium ? (
                <Badge className="bg-accent/20 text-accent-dark border-transparent text-xs font-semibold gap-1">
                  <Sparkles className="h-3 w-3 text-accent" /> Premium Member
                </Badge>
              ) : premiumPriceInr > 0 ? (
                <Badge variant="outline" className="text-xs text-muted border-border">
                  ₹{premiumPriceInr} Premium Available
                </Badge>
              ) : null}
            </div>

            <h1 className="font-serif text-2xl sm:text-3xl lg:text-4xl font-bold tracking-tight text-ink">
              {batchName}
            </h1>

            <p className="text-sm text-muted">
              Taught by <strong className="text-ink font-medium">{tutorName}</strong>
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2 self-start sm:self-auto">
            {premiumPriceInr > 0 && !hasPremium && (
              <button
                type="button"
                onClick={() => setShowUnlockModal(true)}
                className="px-3.5 py-1.5 rounded-xl bg-accent text-ink hover:bg-accent/90 text-xs font-semibold gap-1.5 inline-flex items-center shadow-2xs transition-all cursor-pointer"
              >
                <Lock className="h-3.5 w-3.5 text-ink" />
                <span>Unlock Premium (₹{premiumPriceInr}/mo)</span>
              </button>
            )}

            <Link
              href="/s/batches"
              className={buttonVariants({
                variant: "outline",
                size: "sm",
                className: "rounded-xl text-xs gap-1.5",
              })}
            >
              ← Back to Batches
            </Link>
          </div>
        </div>
      </section>

      {/* Pinned Latest Announcement */}
      {latestAnnouncement && (
        <Card className="rounded-2xl border-primary/30 bg-primary-soft/40 shadow-xs overflow-hidden">
          <CardContent className="p-5 space-y-2">
            <div className="flex items-center justify-between gap-2">
              <div className="flex items-center gap-1.5 text-primary text-xs font-semibold">
                <Pin className="h-3.5 w-3.5 fill-primary" />
                <span>Pinned Announcement</span>
              </div>
              <span className="text-[11px] text-muted">
                {formatDistanceToNow(new Date(latestAnnouncement.created_at), {
                  addSuffix: true,
                })}
              </span>
            </div>

            <h3 className="font-serif font-bold text-ink text-base">
              {latestAnnouncement.title}
            </h3>

            <p className="text-sm text-ink/80 leading-relaxed whitespace-pre-wrap">
              {typeof latestAnnouncement.body?.message === "string"
                ? latestAnnouncement.body.message
                : typeof latestAnnouncement.body?.content === "string"
                ? latestAnnouncement.body.content
                : "Announcement from tutor"}
            </p>
          </CardContent>
        </Card>
      )}

      {/* Filter Chips: All · Quizzes · Notes · Assignments */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 no-scrollbar">
        {[
          { id: "all", label: "All Items" },
          { id: "quiz", label: "Quizzes" },
          { id: "notes", label: "Notes" },
          { id: "assignment", label: "Assignments" },
        ].map((tab) => (
          <button
            key={tab.id}
            type="button"
            onClick={() => setFilter(tab.id as FilterType)}
            className={`px-4 py-2 rounded-xl text-xs font-semibold transition-all shrink-0 cursor-pointer ${
              filter === tab.id
                ? "bg-ink text-bg shadow-xs"
                : "bg-surface text-muted hover:text-ink border border-border"
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Feed Items List */}
      {filteredItems.length === 0 ? (
        <Card className="p-8 text-center bg-surface border-border rounded-2xl">
          <div className="h-12 w-12 rounded-2xl bg-primary-soft text-primary flex items-center justify-center mx-auto mb-3">
            <BookOpen className="h-6 w-6" />
          </div>
          <h3 className="font-serif font-bold text-ink text-base">
            No items in this filter
          </h3>
          <p className="text-xs text-muted max-w-sm mx-auto mt-1">
            Check back later as your tutor publishes new quizzes and study materials.
          </p>
        </Card>
      ) : (
        <div className="space-y-3">
          {filteredItems.map((item) => {
            const dueDate = item.due_at ? new Date(item.due_at) : null;
            const past = dueDate ? isPast(dueDate) : false;

            return (
              <Card
                key={item.id}
                className={`p-5 rounded-2xl border transition-all ${
                  item.locked
                    ? "bg-surface/60 border-accent/30"
                    : "bg-surface border-border hover:border-primary/40 shadow-2xs hover:shadow-xs"
                }`}
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div className="flex items-start gap-3.5">
                    <div className="h-10 w-10 rounded-xl bg-bg border border-border flex items-center justify-center shrink-0 mt-0.5">
                      {getItemIcon(item.type)}
                    </div>

                    <div className="space-y-1.5">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="text-[11px] font-semibold text-muted uppercase tracking-wider">
                          {item.type}
                        </span>

                        {dueDate && (
                          <Badge
                            className={`text-[10px] font-medium gap-1 ${
                              past
                                ? "bg-destructive/15 text-destructive border-transparent"
                                : "bg-bg text-muted border-border"
                            }`}
                          >
                            <Calendar className="h-3 w-3" />
                            {past ? "Overdue: " : "Due: "}
                            {dueDate.toLocaleDateString(undefined, {
                              month: "short",
                              day: "numeric",
                            })}
                          </Badge>
                        )}

                        {getItemStatusBadge(item)}
                      </div>

                      <h3 className="font-serif font-bold text-ink text-base">
                        {item.title}
                      </h3>

                      {item.max_marks != null && (
                        <p className="text-xs text-muted">
                          Max Marks: {item.max_marks}
                        </p>
                      )}
                    </div>
                  </div>

                  <div className="self-end sm:self-center shrink-0">
                    {item.locked ? (
                      <button
                        type="button"
                        onClick={() => setShowUnlockModal(true)}
                        className="rounded-xl bg-accent text-ink hover:bg-accent/90 font-semibold text-xs gap-1.5 shadow-xs px-3.5 py-2 inline-flex items-center cursor-pointer transition-all"
                      >
                        <Lock className="h-3.5 w-3.5 text-ink" />
                        <span>Unlock Premium</span>
                      </button>
                    ) : (
                      <Link
                        href={`/s/items/${item.id}`}
                        className={buttonVariants({
                          size: "sm",
                          className: "rounded-xl font-semibold text-xs gap-1",
                        })}
                      >
                        <span>
                          {item.type === "quiz"
                            ? item.my_attempt
                              ? "View Results"
                              : "Start Quiz"
                            : item.type === "assignment"
                            ? item.my_submission
                              ? "View Submission"
                              : "Submit Work"
                            : "Open"}
                        </span>
                        <ArrowRight className="h-3.5 w-3.5" />
                      </Link>
                    )}
                  </div>
                </div>
              </Card>
            );
          })}
        </div>
      )}

      {/* Unlock Premium Bottom Sheet / Dialog */}
      <UnlockPremiumDialog
        open={showUnlockModal}
        onOpenChange={setShowUnlockModal}
        batchId={batchId}
        batchName={batchName}
        priceInr={premiumPriceInr}
        premiumItemsCount={premiumItemsCount}
      />
    </div>
  );
}
