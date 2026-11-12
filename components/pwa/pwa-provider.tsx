"use client";

import React, { createContext, useContext, useEffect, useState } from "react";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Share, PlusSquare, Smartphone, Download, X } from "lucide-react";
import { APP_NAME } from "@/lib/config";

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed"; platform: string }>;
}

interface PWAContextType {
  isInstallable: boolean;
  isInstalled: boolean;
  isIOS: boolean;
  promptInstall: () => Promise<void>;
  showIOSPrompt: boolean;
  setShowIOSPrompt: (show: boolean) => void;
}

const PWAContext = createContext<PWAContextType>({
  isInstallable: false,
  isInstalled: false,
  isIOS: false,
  promptInstall: async () => {},
  showIOSPrompt: false,
  setShowIOSPrompt: () => {},
});

export function usePWA() {
  return useContext(PWAContext);
}

export function PWAProvider({ children }: { children: React.ReactNode }) {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [isInstalled, setIsInstalled] = useState(false);
  const [isIOS, setIsIOS] = useState(false);
  const [showIOSPrompt, setShowIOSPrompt] = useState(false);

  useEffect(() => {
    // Register Service Worker in production
    if (typeof window !== "undefined" && "serviceWorker" in navigator) {
      if (process.env.NODE_ENV === "production") {
        window.addEventListener("load", () => {
          navigator.serviceWorker
            .register("/sw.js")
            .then((reg) => {
              console.log("[PWA] Service Worker registered:", reg.scope);
            })
            .catch((err) => {
              console.warn("[PWA] Service Worker registration failed:", err);
            });
        });
      }
    }

    // Check if app is already running in standalone mode
    if (typeof window !== "undefined") {
      const isStandalone =
        window.matchMedia("(display-mode: standalone)").matches ||
        (window.navigator as unknown as { standalone?: boolean }).standalone === true;
      setIsInstalled(isStandalone);

      // Detect iOS device
      const userAgent = window.navigator.userAgent.toLowerCase();
      const isApple = /iphone|ipad|ipod/.test(userAgent) && !(window as unknown as { MSStream?: unknown }).MSStream;
      setIsIOS(isApple && !isStandalone);
    }

    // Capture beforeinstallprompt on Android/Chromium/Desktop
    const handleBeforeInstall = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
    };

    const handleAppInstalled = () => {
      setIsInstalled(true);
      setDeferredPrompt(null);
    };

    window.addEventListener("beforeinstallprompt", handleBeforeInstall);
    window.addEventListener("appinstalled", handleAppInstalled);

    return () => {
      window.removeEventListener("beforeinstallprompt", handleBeforeInstall);
      window.removeEventListener("appinstalled", handleAppInstalled);
    };
  }, []);

  const promptInstall = async () => {
    if (isIOS) {
      setShowIOSPrompt(true);
      return;
    }

    if (deferredPrompt) {
      try {
        await deferredPrompt.prompt();
        const choice = await deferredPrompt.userChoice;
        if (choice.outcome === "accepted") {
          setIsInstalled(true);
        }
        setDeferredPrompt(null);
      } catch (err) {
        console.error("Install prompt error:", err);
      }
    } else {
      setShowIOSPrompt(true);
    }
  };

  return (
    <PWAContext.Provider
      value={{
        isInstallable: !!deferredPrompt || isIOS,
        isInstalled,
        isIOS,
        promptInstall,
        showIOSPrompt,
        setShowIOSPrompt,
      }}
    >
      {children}

      {/* iOS Add to Home Screen Bottom Sheet */}
      <Sheet open={showIOSPrompt} onOpenChange={setShowIOSPrompt}>
        <SheetContent side="bottom" className="rounded-t-3xl max-w-lg mx-auto p-6 bg-surface border-border">
          <SheetHeader className="text-left pb-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-2xl bg-primary text-primary-foreground flex items-center justify-center font-serif text-2xl font-bold shadow-xs">
                  C
                </div>
                <div>
                  <SheetTitle className="font-serif text-xl font-bold text-ink">
                    Install {APP_NAME}
                  </SheetTitle>
                  <SheetDescription className="text-xs text-muted">
                    Install on your iPhone or iPad for offline access
                  </SheetDescription>
                </div>
              </div>
            </div>
          </SheetHeader>

          <div className="space-y-4 py-2">
            <div className="flex items-start gap-3.5 p-3 rounded-2xl bg-bg border border-border">
              <div className="w-8 h-8 rounded-xl bg-primary-soft text-primary flex items-center justify-center shrink-0 mt-0.5">
                <Share className="w-4 h-4" />
              </div>
              <div className="text-xs sm:text-sm text-ink leading-relaxed">
                <span className="font-semibold text-primary">1.</span> In Safari, tap the <span className="font-semibold text-ink">Share</span> icon in the toolbar below.
              </div>
            </div>

            <div className="flex items-start gap-3.5 p-3 rounded-2xl bg-bg border border-border">
              <div className="w-8 h-8 rounded-xl bg-primary-soft text-primary flex items-center justify-center shrink-0 mt-0.5">
                <PlusSquare className="w-4 h-4" />
              </div>
              <div className="text-xs sm:text-sm text-ink leading-relaxed">
                <span className="font-semibold text-primary">2.</span> Scroll down and tap <span className="font-semibold text-ink">&ldquo;Add to Home Screen&rdquo;</span>.
              </div>
            </div>

            <div className="flex items-start gap-3.5 p-3 rounded-2xl bg-bg border border-border">
              <div className="w-8 h-8 rounded-xl bg-primary-soft text-primary flex items-center justify-center shrink-0 mt-0.5">
                <Smartphone className="w-4 h-4" />
              </div>
              <div className="text-xs sm:text-sm text-ink leading-relaxed">
                <span className="font-semibold text-primary">3.</span> Tap <span className="font-semibold text-ink">&ldquo;Add&rdquo;</span> in the top-right corner to finish.
              </div>
            </div>
          </div>

          <div className="pt-4">
            <Button
              onClick={() => setShowIOSPrompt(false)}
              className="w-full rounded-xl bg-primary text-primary-foreground font-semibold py-2.5"
            >
              Got it
            </Button>
          </div>
        </SheetContent>
      </Sheet>
    </PWAContext.Provider>
  );
}
