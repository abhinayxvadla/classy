"use client";

import { usePWA } from "./pwa-provider";
import { Button } from "@/components/ui/button";
import { Download } from "lucide-react";
import { cn } from "@/lib/utils";

interface InstallButtonProps {
  variant?: "default" | "outline" | "secondary" | "ghost";
  className?: string;
  size?: "default" | "sm" | "lg";
}

export function InstallButton({
  variant = "outline",
  className,
  size = "sm",
}: InstallButtonProps) {
  const { isInstalled, promptInstall } = usePWA();

  if (isInstalled) return null;

  return (
    <Button
      variant={variant}
      size={size}
      onClick={() => promptInstall()}
      className={cn("rounded-xl gap-2 font-medium", className)}
    >
      <Download className="w-4 h-4 text-primary" />
      Install App
    </Button>
  );
}
