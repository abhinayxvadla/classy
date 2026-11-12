"use client";

import { useState, useEffect } from "react";
import { usePWA } from "./pwa-provider";
import { Button } from "@/components/ui/button";
import { Download, X } from "lucide-react";
import { APP_NAME } from "@/lib/config";

export function InstallBanner() {
  const { isInstalled, promptInstall } = usePWA();
  const [dismissed, setDismissed] = useState(true);

  useEffect(() => {
    if (typeof window !== "undefined") {
      const isDismissed = localStorage.getItem("classy_install_banner_dismissed") === "true";
      setDismissed(isDismissed);
    }
  }, []);

  if (isInstalled || dismissed) return null;

  const handleDismiss = () => {
    setDismissed(true);
    if (typeof window !== "undefined") {
      localStorage.setItem("classy_install_banner_dismissed", "true");
    }
  };

  return (
    <div className="w-full mb-6 p-3.5 sm:p-4 rounded-2xl bg-primary/10 border border-primary/20 flex items-center justify-between gap-3 animate-in fade-in slide-in-from-top-2 duration-300">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl bg-primary text-primary-foreground flex items-center justify-center font-serif text-lg font-bold shrink-0 shadow-xs">
          C
        </div>
        <div className="text-left">
          <h4 className="text-xs sm:text-sm font-semibold text-ink">
            Install {APP_NAME} Web App
          </h4>
          <p className="text-[11px] sm:text-xs text-muted leading-tight">
            Read opened notes offline and launch directly from your home screen.
          </p>
        </div>
      </div>

      <div className="flex items-center gap-2 shrink-0">
        <Button
          size="sm"
          onClick={() => promptInstall()}
          className="rounded-xl bg-primary text-primary-foreground hover:bg-primary/90 text-xs font-semibold px-3 py-1.5 shadow-xs flex items-center gap-1.5"
        >
          <Download className="w-3.5 h-3.5" />
          Install
        </Button>
        <button
          onClick={handleDismiss}
          className="p-1.5 rounded-lg text-muted hover:text-ink hover:bg-surface/50 transition-colors"
          aria-label="Dismiss install banner"
        >
          <X className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}
