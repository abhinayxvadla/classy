"use client";

import * as React from "react";
import { Drawer } from "vaul";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { cn } from "@/lib/utils";

interface ResponsiveDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  description?: string;
  children: React.ReactNode;
  className?: string;
}

export function ResponsiveDialog({
  open,
  onOpenChange,
  title,
  description,
  children,
  className,
}: ResponsiveDialogProps) {
  const [isDesktop, setIsDesktop] = React.useState(true);

  React.useEffect(() => {
    const checkIsDesktop = () => setIsDesktop(window.innerWidth >= 768);
    checkIsDesktop();
    window.addEventListener("resize", checkIsDesktop);
    return () => window.removeEventListener("resize", checkIsDesktop);
  }, []);

  if (isDesktop) {
    return (
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent
          className={cn(
            "sm:max-w-lg rounded-2xl bg-surface border border-border shadow-lg p-6",
            className
          )}
        >
          <DialogHeader>
            <DialogTitle className="font-serif text-xl font-bold text-ink">
              {title}
            </DialogTitle>
            {description && (
              <DialogDescription className="text-xs text-muted">
                {description}
              </DialogDescription>
            )}
          </DialogHeader>
          <div className="mt-2">{children}</div>
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Drawer.Root open={open} onOpenChange={onOpenChange}>
      <Drawer.Portal>
        <Drawer.Overlay className="fixed inset-0 bg-black/40 backdrop-blur-xs z-50" />
        <Drawer.Content
          className={cn(
            "fixed inset-x-0 bottom-0 z-50 flex flex-col rounded-t-[24px] bg-surface border-t border-border p-4 max-h-[90vh] overflow-y-auto",
            className
          )}
        >
          <div className="mx-auto mb-4 h-1.5 w-12 rounded-full bg-muted/30" />
          <div className="mb-4">
            <Drawer.Title className="font-serif text-xl font-bold text-ink">
              {title}
            </Drawer.Title>
            {description && (
              <Drawer.Description className="text-xs text-muted mt-1">
                {description}
              </Drawer.Description>
            )}
          </div>
          <div className="pb-6">{children}</div>
        </Drawer.Content>
      </Drawer.Portal>
    </Drawer.Root>
  );
}
