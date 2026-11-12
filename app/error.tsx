"use client";

import { useEffect } from "react";
import Link from "next/link";
import { AlertTriangle, RotateCw, Home } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function ErrorBoundary({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("Runtime error caught:", error);
  }, [error]);

  return (
    <div className="min-h-screen bg-bg text-ink flex flex-col items-center justify-center p-6 text-center selection:bg-primary-soft selection:text-primary">
      <div className="w-16 h-16 rounded-2xl bg-destructive/10 text-destructive flex items-center justify-center mb-6 border border-destructive/20 shadow-xs">
        <AlertTriangle className="w-8 h-8" />
      </div>

      <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-surface border border-border text-destructive uppercase tracking-wider mb-3">
        Unexpected Error
      </div>

      <h1 className="font-serif text-3xl sm:text-4xl font-bold tracking-tight text-ink mb-3">
        Something went wrong
      </h1>

      <p className="text-muted text-sm sm:text-base max-w-md leading-relaxed mb-8">
        We encountered an unexpected error while loading this page. You can try reloading or navigate back to the home portal.
      </p>

      <div className="flex flex-col sm:flex-row items-center gap-3 w-full max-w-xs">
        <Button
          onClick={() => reset()}
          className="w-full rounded-xl bg-primary text-white font-semibold gap-2 shadow-xs"
        >
          <RotateCw className="w-4 h-4" />
          Try Again
        </Button>
        <Link href="/" className="w-full">
          <Button
            variant="outline"
            className="w-full rounded-xl border-border hover:bg-surface font-semibold gap-2"
          >
            <Home className="w-4 h-4" />
            Home
          </Button>
        </Link>
      </div>

      {process.env.NODE_ENV === "development" && error.message && (
        <div className="mt-8 p-4 rounded-xl bg-surface border border-border text-left max-w-lg w-full font-mono text-xs text-destructive overflow-auto">
          {error.message}
        </div>
      )}
    </div>
  );
}
