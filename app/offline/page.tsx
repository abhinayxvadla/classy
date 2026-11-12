"use client";

import Link from "next/link";
import { WifiOff, BookOpen, RotateCw } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function OfflinePage() {
  return (
    <div className="min-h-screen bg-bg text-ink flex flex-col items-center justify-center p-6 text-center selection:bg-primary-soft selection:text-primary">
      <div className="w-16 h-16 rounded-2xl bg-amber-500/10 text-amber-600 dark:text-amber-400 flex items-center justify-center mb-6 border border-amber-500/20 shadow-xs">
        <WifiOff className="w-8 h-8" />
      </div>

      <h1 className="text-3xl sm:text-4xl font-serif font-bold tracking-tight text-ink mb-3">
        You are currently offline
      </h1>

      <p className="text-muted text-sm sm:text-base max-w-md leading-relaxed mb-8">
        No internet connection detected. Previously opened notes and cached course materials remain accessible on your device.
      </p>

      <div className="flex flex-col sm:flex-row items-center gap-3 w-full max-w-xs">
        <Button
          onClick={() => {
            if (typeof window !== "undefined") window.location.reload();
          }}
          className="w-full rounded-xl bg-primary text-primary-foreground hover:bg-primary/90 font-semibold gap-2 shadow-xs"
        >
          <RotateCw className="w-4 h-4" />
          Retry Connection
        </Button>
        <Link href="/s/batches" className="w-full">
          <Button
            variant="outline"
            className="w-full rounded-xl border-border hover:bg-surface font-semibold gap-2"
          >
            <BookOpen className="w-4 h-4" />
            Cached Batches
          </Button>
        </Link>
      </div>
    </div>
  );
}
