import Link from "next/link";
import { GraduationCap, Sparkles } from "lucide-react";
import { APP_NAME } from "@/lib/config";
import { ThemeToggle } from "@/components/theme-toggle";

export function AuthLogoPill() {
  return (
    <header className="fixed top-4 left-1/2 -translate-x-1/2 z-50 flex items-center gap-3 px-4 py-2 rounded-full bg-surface/85 dark:bg-surface/85 backdrop-blur-md border border-border shadow-sm">
      <Link
        href="/"
        className="flex items-center gap-2 text-ink hover:opacity-85 transition-opacity"
        aria-label={`${APP_NAME} home`}
      >
        <div className="w-7 h-7 rounded-full bg-primary text-primary-foreground flex items-center justify-center shadow-xs">
          <GraduationCap className="w-4 h-4" />
        </div>
        <span className="font-serif font-bold text-base tracking-tight text-ink">
          {APP_NAME}
        </span>
        <span className="inline-flex items-center gap-0.5 px-2 py-0.5 rounded-full text-[10px] font-medium bg-primary-soft text-primary">
          <Sparkles className="w-2.5 h-2.5" />
          Beta
        </span>
      </Link>
      <div className="h-4 w-px bg-border mx-1" />
      <ThemeToggle />
    </header>
  );
}
