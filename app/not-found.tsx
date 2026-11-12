import Link from "next/link";
import { Compass, Home } from "lucide-react";
import { Button } from "@/components/ui/button";
import { FloatingNav } from "@/components/nav/floating-nav";

export default function NotFound() {
  return (
    <div className="min-h-screen bg-bg text-ink flex flex-col justify-between selection:bg-primary-soft selection:text-primary">
      <FloatingNav role="public" />

      <main className="flex-1 max-w-lg w-full mx-auto px-4 flex flex-col items-center justify-center text-center pt-24 pb-[calc(96px+env(safe-area-inset-bottom))]">
        <div className="w-16 h-16 rounded-2xl bg-primary-soft text-primary flex items-center justify-center mb-6 border border-primary/20 shadow-xs">
          <Compass className="w-8 h-8 animate-pulse" />
        </div>

        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-surface border border-border text-muted uppercase tracking-wider mb-3">
          404 Page Not Found
        </div>

        <h1 className="font-serif text-3xl sm:text-4xl font-bold tracking-tight text-ink mb-3">
          Lost in the classroom?
        </h1>

        <p className="text-muted text-sm sm:text-base leading-relaxed mb-8">
          The page or batch resource you were looking for doesn&apos;t exist, has been moved, or is restricted.
        </p>

        <div className="flex flex-col sm:flex-row items-center gap-3 w-full max-w-xs">
          <Link href="/" className="w-full">
            <Button className="w-full rounded-xl bg-primary text-white font-semibold gap-2 shadow-xs">
              <Home className="w-4 h-4" />
              Return Home
            </Button>
          </Link>
        </div>
      </main>

      <footer className="w-full border-t border-border/80 bg-surface/50 py-4 text-center text-xs text-muted">
        Classy • The AI-native classroom
      </footer>
    </div>
  );
}
