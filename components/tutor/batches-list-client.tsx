"use client";

import * as React from "react";
import { Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import { BatchCard } from "@/components/tutor/batch-card";
import { NewBatchDialog } from "@/components/tutor/new-batch-dialog";

export interface BatchListItem {
  id: string;
  name: string;
  subject: string | null;
  grade: string | null;
  joinCode: string;
  premiumPriceInr: number;
  joinedCount: number;
  pendingCount: number;
  itemCount: number;
}

interface BatchesListClientProps {
  batches: BatchListItem[];
}

export function BatchesListClient({ batches }: BatchesListClientProps) {
  const [search, setSearch] = React.useState("");

  const filtered = React.useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return batches;
    return batches.filter(
      (b) =>
        b.name.toLowerCase().includes(q) ||
        b.subject?.toLowerCase().includes(q) ||
        b.grade?.toLowerCase().includes(q) ||
        b.joinCode.toLowerCase().includes(q)
    );
  }, [batches, search]);

  return (
    <div className="space-y-6">
      {/* Search and Action Bar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
        <div className="relative flex-1 max-w-md">
          <Search className="w-4 h-4 text-muted absolute left-3.5 top-1/2 -translate-y-1/2" />
          <Input
            placeholder="Search batches by name, subject, or grade..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9 rounded-xl bg-surface"
          />
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <NewBatchDialog />
        </div>
      </div>

      {/* Grid of Batches */}
      {filtered.length === 0 ? (
        <div className="p-12 rounded-2xl border border-dashed border-border bg-surface/50 text-center space-y-2">
          <p className="font-serif text-lg font-bold text-ink">
            {batches.length === 0 ? "No batches yet" : "No matching batches found"}
          </p>
          <p className="text-xs text-muted max-w-md mx-auto">
            {batches.length === 0
              ? "Create your first batch to start adding students and sharing materials."
              : `No batches match your query "${search}". Try searching for another name or subject.`}
          </p>
          {batches.length === 0 && (
            <div className="pt-2">
              <NewBatchDialog />
            </div>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filtered.map((b) => (
            <BatchCard
              key={b.id}
              id={b.id}
              name={b.name}
              subject={b.subject}
              grade={b.grade}
              joinCode={b.joinCode}
              premiumPriceInr={b.premiumPriceInr}
              joinedCount={b.joinedCount}
              pendingCount={b.pendingCount}
              itemCount={b.itemCount}
            />
          ))}
        </div>
      )}
    </div>
  );
}
