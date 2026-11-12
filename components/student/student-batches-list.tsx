"use client";

import * as React from "react";
import Link from "next/link";
import {
  Search,
  Users,
  Clock,
  ArrowRight,
  AlertCircle,
  Crown,
  BookOpen,
} from "lucide-react";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { buttonVariants } from "@/components/ui/button";

export interface MyBatchItem {
  id: string;
  name: string;
  subject: string | null;
  grade: string | null;
  description: string | null;
  join_code: string;
  premium_price_inr: number;
  status: "joined" | "pending";
  joined_at: string | null;
  tutor_name: string;
  has_premium: boolean;
  premium_until: string | null;
  student_count: number;
  item_count: number;
}

interface StudentBatchesListProps {
  batches: MyBatchItem[];
}

export function StudentBatchesList({ batches }: StudentBatchesListProps) {
  const [search, setSearch] = React.useState("");

  const filteredBatches = React.useMemo(() => {
    if (!search.trim()) return batches;
    const query = search.toLowerCase().trim();
    return batches.filter(
      (b) =>
        b.name.toLowerCase().includes(query) ||
        (b.subject && b.subject.toLowerCase().includes(query)) ||
        (b.tutor_name && b.tutor_name.toLowerCase().includes(query)) ||
        (b.grade && b.grade.toLowerCase().includes(query)) ||
        b.join_code.toLowerCase().includes(query)
    );
  }, [batches, search]);

  const joinedBatches = filteredBatches.filter((b) => b.status === "joined");
  const pendingBatches = filteredBatches.filter((b) => b.status === "pending");

  return (
    <div className="space-y-6">
      {/* Search Input */}
      {batches.length > 2 && (
        <div className="relative">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted pointer-events-none" />
          <Input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by batch name, subject, or tutor..."
            className="pl-10 h-11 bg-surface border-border rounded-xl text-sm"
          />
        </div>
      )}

      {/* Pending Batches */}
      {pendingBatches.length > 0 && (
        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <h2 className="font-serif text-lg font-bold text-ink">
              Pending Requests
            </h2>
            <Badge variant="outline" className="border-warning/50 text-warning text-xs">
              {pendingBatches.length}
            </Badge>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {pendingBatches.map((b) => (
              <Card
                key={b.id}
                className="p-5 rounded-2xl border-warning/30 bg-surface shadow-xs space-y-3"
              >
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <h3 className="font-serif font-bold text-ink text-base">
                      {b.name}
                    </h3>
                    <p className="text-xs text-muted mt-0.5">
                      Taught by {b.tutor_name}
                    </p>
                  </div>
                  <Badge className="bg-warning/15 text-warning border-transparent text-xs font-medium gap-1 py-1 shrink-0">
                    <Clock className="h-3 w-3" /> Waiting for approval
                  </Badge>
                </div>

                <div className="flex flex-wrap items-center gap-1.5 pt-1">
                  {b.subject && (
                    <Badge variant="outline" className="text-[10px] text-ink border-border">
                      {b.subject}
                    </Badge>
                  )}
                  {b.grade && (
                    <Badge variant="outline" className="text-[10px] text-muted border-border">
                      {b.grade}
                    </Badge>
                  )}
                </div>

                <div className="p-3 rounded-xl bg-bg border border-border/60 text-xs text-muted flex items-start gap-2">
                  <AlertCircle className="h-4 w-4 text-warning shrink-0 mt-0.5" />
                  <span>
                    Your join request has been sent to {b.tutor_name}. Content will unlock once your tutor approves you.
                  </span>
                </div>
              </Card>
            ))}
          </div>
        </div>
      )}

      {/* Enrolled Batches */}
      <div className="space-y-3">
        <h2 className="font-serif text-lg font-bold text-ink">
          Enrolled Batches ({joinedBatches.length})
        </h2>

        {joinedBatches.length === 0 ? (
          <Card className="p-8 text-center bg-surface border-border">
            <div className="h-12 w-12 rounded-2xl bg-primary-soft text-primary flex items-center justify-center mx-auto mb-3">
              <Users className="h-6 w-6" />
            </div>
            <h3 className="font-serif font-bold text-ink text-base">
              {search.trim() ? "No matching batches found" : "No enrolled batches yet"}
            </h3>
            <p className="text-xs text-muted max-w-sm mx-auto mt-1 mb-4">
              {search.trim()
                ? "Try searching for another keyword or clear your query."
                : "Enter your tutor's 6-character code above to join your batch."}
            </p>
            {search.trim() ? (
              <button
                type="button"
                onClick={() => setSearch("")}
                className={buttonVariants({ variant: "outline", size: "sm" })}
              >
                Clear Search
              </button>
            ) : (
              <Link
                href="/s/library"
                className={buttonVariants({
                  variant: "outline",
                  className: "text-xs font-semibold rounded-xl gap-1.5",
                })}
              >
                <BookOpen className="h-3.5 w-3.5" /> Browse Free Library
              </Link>
            )}
          </Card>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {joinedBatches.map((b) => (
              <Card
                key={b.id}
                className="p-5 rounded-2xl border-border bg-surface shadow-xs flex flex-col justify-between space-y-4 hover:border-primary/40 transition-all"
              >
                <div className="space-y-2">
                  <div className="flex items-center justify-between gap-2">
                    <div className="flex items-center gap-1.5">
                      <Badge className="bg-success/15 text-success border-transparent text-[10px] font-semibold">
                        Joined
                      </Badge>
                      {b.has_premium ? (
                        <Badge className="bg-accent/20 text-accent-dark border-transparent text-[10px] font-semibold gap-1">
                          <Crown className="h-3 w-3 text-accent" /> Premium
                        </Badge>
                      ) : b.premium_price_inr > 0 ? (
                        <Badge variant="outline" className="text-[10px] text-muted border-border">
                          ₹{b.premium_price_inr}
                        </Badge>
                      ) : null}
                    </div>

                    {b.subject && (
                      <Badge variant="outline" className="text-[10px] text-ink border-border">
                        {b.subject}
                      </Badge>
                    )}
                  </div>

                  <h3 className="font-serif font-bold text-ink text-base line-clamp-1">
                    {b.name}
                  </h3>

                  <p className="text-xs text-muted">
                    Tutor: <strong className="text-ink font-medium">{b.tutor_name}</strong>
                  </p>

                  {b.description && (
                    <p className="text-xs text-muted line-clamp-2 leading-relaxed">
                      {b.description}
                    </p>
                  )}
                </div>

                <div className="pt-3 border-t border-border flex items-center justify-between">
                  <span className="text-[11px] text-muted font-mono">
                    {b.item_count} {b.item_count === 1 ? "item" : "items"}
                  </span>
                  <Link
                    href={`/s/batches/${b.id}`}
                    className={buttonVariants({
                      size: "sm",
                      className: "text-xs rounded-xl font-semibold gap-1",
                    })}
                  >
                    <span>Open Batch</span>
                    <ArrowRight className="h-3 w-3" />
                  </Link>
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
