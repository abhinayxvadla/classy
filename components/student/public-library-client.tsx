"use client";

import * as React from "react";
import Link from "next/link";
import { toast } from "sonner";
import {
  Search,
  BookOpen,
  HelpCircle,
  FileText,
  ClipboardList,
  Megaphone,
  UserPlus,
  Clock,
  CheckCircle2,
  ArrowRight,
  Loader2,
} from "lucide-react";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { Button, buttonVariants } from "@/components/ui/button";
import { requestJoinAction } from "@/app/actions/student";
import type { ItemType, RosterStatus } from "@/lib/database.types";

export interface PublicLibraryItem {
  id: string;
  batch_id: string | null;
  batch_name: string | null;
  tutor_name: string;
  type: ItemType;
  title: string;
  body: Record<string, unknown> | null;
  access: "free" | "premium";
  visibility: "batch" | "public";
  grade: string | null;
  subject: string | null;
  due_at: string | null;
  max_marks: number | null;
  created_at: string;
  is_member: boolean;
  roster_status?: RosterStatus | null;
}

interface PublicLibraryClientProps {
  items: PublicLibraryItem[];
  userGrade?: string | null;
}

export function PublicLibraryClient({ items, userGrade }: PublicLibraryClientProps) {
  const [search, setSearch] = React.useState("");
  const [selectedSubject, setSelectedSubject] = React.useState<string>("All");
  const [joiningBatchId, setJoiningBatchId] = React.useState<string | null>(null);
  const [membershipState, setMembershipState] = React.useState<Record<string, RosterStatus>>({});

  // Compute all available subjects for filter chips
  const subjects = React.useMemo(() => {
    const set = new Set<string>();
    items.forEach((item) => {
      if (item.subject) set.add(item.subject);
    });
    return ["All", ...Array.from(set).sort()];
  }, [items]);

  // Filter items by search & subject
  const filteredItems = React.useMemo(() => {
    return items.filter((item) => {
      const matchesSubject =
        selectedSubject === "All" || item.subject === selectedSubject;
      if (!matchesSubject) return false;

      if (!search.trim()) return true;
      const q = search.toLowerCase().trim();
      return (
        item.title.toLowerCase().includes(q) ||
        (item.subject && item.subject.toLowerCase().includes(q)) ||
        item.tutor_name.toLowerCase().includes(q) ||
        (item.batch_name && item.batch_name.toLowerCase().includes(q)) ||
        (item.grade && item.grade.toLowerCase().includes(q))
      );
    });
  }, [items, selectedSubject, search]);

  const handleRequestJoin = async (batchId: string) => {
    setJoiningBatchId(batchId);
    try {
      const res = await requestJoinAction(batchId);
      if (res.error) {
        toast.error(res.error);
      } else if (res.status) {
        setMembershipState((prev) => ({ ...prev, [batchId]: res.status! }));
        if (res.status === "joined") {
          toast.success("Joined batch successfully!");
        } else {
          toast.info("Request sent! Your tutor will approve you soon.");
        }
      }
    } catch {
      toast.error("Failed to request to join.");
    } finally {
      setJoiningBatchId(null);
    }
  };

  const getItemIcon = (type: ItemType) => {
    switch (type) {
      case "quiz":
        return <HelpCircle className="h-4 w-4 text-primary" />;
      case "notes":
        return <FileText className="h-4 w-4 text-ink" />;
      case "assignment":
        return <ClipboardList className="h-4 w-4 text-accent" />;
      case "announcement":
        return <Megaphone className="h-4 w-4 text-warning" />;
    }
  };

  return (
    <div className="space-y-6">
      {/* Search Input and optional Grade badge */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted pointer-events-none" />
          <Input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by title, subject, grade, or tutor..."
            className="pl-10 h-11 bg-surface border-border rounded-xl text-sm"
          />
        </div>
        {userGrade && (
          <Badge variant="outline" className="self-start sm:self-center text-xs py-1.5 px-3 border-border text-muted shrink-0">
            Filtered for {userGrade}
          </Badge>
        )}
      </div>

      {/* Subject Filter Chips */}
      {subjects.length > 1 && (
        <div className="flex items-center gap-2 overflow-x-auto pb-1 no-scrollbar">
          {subjects.map((sub) => (
            <button
              key={sub}
              type="button"
              onClick={() => setSelectedSubject(sub)}
              className={`px-3.5 py-1.5 rounded-full text-xs font-semibold transition-all shrink-0 cursor-pointer ${
                selectedSubject === sub
                  ? "bg-primary text-white shadow-2xs"
                  : "bg-surface text-muted hover:text-ink border border-border"
              }`}
            >
              {sub}
            </button>
          ))}
        </div>
      )}

      {/* Grid of Public Free Items */}
      {filteredItems.length === 0 ? (
        <Card className="p-10 text-center bg-surface border-border rounded-2xl space-y-3">
          <div className="h-12 w-12 rounded-2xl bg-primary-soft text-primary mx-auto flex items-center justify-center">
            <BookOpen className="h-6 w-6" />
          </div>
          <h3 className="font-serif text-lg font-bold text-ink">
            No materials found
          </h3>
          <p className="text-xs text-muted max-w-sm mx-auto">
            {search.trim() || selectedSubject !== "All"
              ? "Try adjusting your search query or subject filter."
              : "No free public materials have been published yet."}
          </p>
          {(search.trim() || selectedSubject !== "All") && (
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => {
                setSearch("");
                setSelectedSubject("All");
              }}
              className="rounded-xl text-xs"
            >
              Reset Filters
            </Button>
          )}
        </Card>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredItems.map((item) => {
            const currentStatus =
              (item.batch_id && membershipState[item.batch_id]) ||
              item.roster_status ||
              (item.is_member ? "joined" : null);

            const isJoiningThis = joiningBatchId === item.batch_id;

            return (
              <Card
                key={item.id}
                className="p-5 rounded-2xl border-border bg-surface shadow-xs flex flex-col justify-between space-y-4 hover:border-primary/40 transition-all"
              >
                <div className="space-y-3">
                  <div className="flex items-center justify-between gap-2">
                    <div className="flex items-center gap-1.5">
                      <span className="p-1.5 rounded-lg bg-bg border border-border">
                        {getItemIcon(item.type)}
                      </span>
                      <span className="text-[11px] font-semibold text-muted uppercase tracking-wider">
                        {item.type}
                      </span>
                    </div>

                    <div className="flex items-center gap-1">
                      {item.subject && (
                        <Badge variant="outline" className="text-[10px] text-ink border-border">
                          {item.subject}
                        </Badge>
                      )}
                      {item.grade && (
                        <Badge variant="outline" className="text-[10px] text-muted border-border">
                          {item.grade}
                        </Badge>
                      )}
                    </div>
                  </div>

                  <div>
                    <h3 className="font-serif font-bold text-ink text-base line-clamp-2 leading-snug">
                      {item.title}
                    </h3>
                    <p className="text-xs text-muted mt-1">
                      By <strong className="text-ink font-medium">{item.tutor_name}</strong>
                      {item.batch_name ? ` • ${item.batch_name}` : ""}
                    </p>
                  </div>
                </div>

                <div className="pt-3 border-t border-border flex flex-col gap-2">
                  <div className="flex items-center justify-between gap-2">
                    <Badge variant="outline" className="text-[10px] text-success border-success/30 bg-success/5 font-semibold">
                      Free Access
                    </Badge>

                    <Link
                      href={`/s/items/${item.id}`}
                      className={buttonVariants({
                        size: "sm",
                        className: "rounded-xl text-xs font-semibold gap-1",
                      })}
                    >
                      <span>
                        {item.type === "quiz"
                          ? "Take Quiz"
                          : item.type === "notes"
                          ? "Read Notes"
                          : "View"}
                      </span>
                      <ArrowRight className="h-3 w-3" />
                    </Link>
                  </div>

                  {/* "Request to join this batch" CTA */}
                  {item.batch_id && (
                    <div className="pt-1">
                      {currentStatus === "joined" ? (
                        <Badge className="w-full justify-center bg-success/15 text-success border-transparent text-[11px] font-medium py-1 gap-1">
                          <CheckCircle2 className="h-3 w-3" /> Enrolled in Batch
                        </Badge>
                      ) : currentStatus === "pending" ? (
                        <Badge className="w-full justify-center bg-warning/15 text-warning border-transparent text-[11px] font-medium py-1 gap-1">
                          <Clock className="h-3 w-3" /> Join Request Pending
                        </Badge>
                      ) : (
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          disabled={isJoiningThis}
                          onClick={() => handleRequestJoin(item.batch_id!)}
                          className="w-full rounded-xl text-xs font-semibold gap-1.5 hover:bg-primary-soft hover:text-primary hover:border-primary/40"
                        >
                          {isJoiningThis ? (
                            <>
                              <Loader2 className="h-3 w-3 animate-spin" />
                              <span>Sending Request...</span>
                            </>
                          ) : (
                            <>
                              <UserPlus className="h-3 w-3" />
                              <span>Request to Join Batch</span>
                            </>
                          )}
                        </Button>
                      )}
                    </div>
                  )}
                </div>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
