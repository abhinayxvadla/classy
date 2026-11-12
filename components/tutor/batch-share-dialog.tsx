"use client";

import * as React from "react";
import { QRCodeSVG } from "qrcode.react";
import { toast } from "sonner";
import { QrCode, Copy, Check, MessageCircle, ExternalLink } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ResponsiveDialog } from "@/components/ui/responsive-dialog";
import { APP_NAME } from "@/lib/config";

interface BatchShareDialogProps {
  batchName: string;
  joinCode: string;
  triggerVariant?: "button" | "icon";
}

export function BatchShareDialog({
  batchName,
  joinCode,
  triggerVariant = "button",
}: BatchShareDialogProps) {
  const [open, setOpen] = React.useState(false);
  const [copied, setCopied] = React.useState(false);

  const inviteUrl =
    typeof window !== "undefined"
      ? `${window.location.origin}/join/${joinCode}`
      : `/join/${joinCode}`;

  const whatsappMessage = `Join my batch "${batchName}" on ${APP_NAME}!\n\nUse join code: ${joinCode}\nOr click here: ${inviteUrl}`;
  const whatsappUrl = `https://wa.me/?text=${encodeURIComponent(whatsappMessage)}`;

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(inviteUrl);
      setCopied(true);
      toast.success("Invite link copied to clipboard!");
      setTimeout(() => setCopied(false), 2000);
    } catch {
      toast.error("Failed to copy link");
    }
  };

  return (
    <>
      {triggerVariant === "button" ? (
        <Button
          variant="outline"
          onClick={() => setOpen(true)}
          className="rounded-xl text-xs font-semibold gap-1.5"
        >
          <QrCode className="w-4 h-4 text-primary" />
          <span>Show QR & Share</span>
        </Button>
      ) : (
        <button
          onClick={() => setOpen(true)}
          className="p-1.5 rounded-lg text-muted hover:text-ink hover:bg-black/5 dark:hover:bg-white/5 transition-colors"
          title="Classroom QR & Invite Link"
          aria-label="Classroom QR Code"
        >
          <QrCode className="w-4 h-4" />
        </button>
      )}

      <ResponsiveDialog
        open={open}
        onOpenChange={setOpen}
        title={`Invite to ${batchName}`}
        description="Share the 6-character code or display the QR code for students to scan in class."
      >
        <div className="flex flex-col items-center text-center space-y-4 py-2">
          {/* QR Code Canvas */}
          <div className="p-4 bg-white rounded-2xl border border-border shadow-xs">
            <QRCodeSVG
              value={inviteUrl}
              size={200}
              level="H"
              includeMargin={false}
              className="w-48 h-48 sm:w-56 sm:h-56"
            />
          </div>

          {/* Join Code Highlight */}
          <div className="space-y-1">
            <span className="text-xs uppercase font-semibold text-muted tracking-wider">
              6-Character Join Code
            </span>
            <div className="font-mono text-3xl font-extrabold tracking-widest text-primary bg-primary-soft/60 px-4 py-1.5 rounded-xl border border-primary/20">
              {joinCode}
            </div>
          </div>

          {/* URL Bar & Copy */}
          <div className="w-full flex items-center gap-2 p-1.5 rounded-xl bg-surface border border-border">
            <input
              type="text"
              readOnly
              value={inviteUrl}
              className="flex-1 bg-transparent px-2 text-xs font-mono text-muted select-all focus:outline-hidden truncate"
            />
            <Button
              size="sm"
              onClick={handleCopy}
              className="rounded-lg text-xs font-semibold shrink-0 gap-1"
            >
              {copied ? (
                <>
                  <Check className="w-3.5 h-3.5 text-emerald-300" />
                  Copied
                </>
              ) : (
                <>
                  <Copy className="w-3.5 h-3.5" />
                  Copy Link
                </>
              )}
            </Button>
          </div>

          {/* Share on WhatsApp */}
          <a
            href={whatsappUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="w-full flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-xs shadow-xs transition-colors"
          >
            <MessageCircle className="w-4 h-4" />
            Share with Students on WhatsApp
            <ExternalLink className="w-3.5 h-3.5 opacity-80" />
          </a>
        </div>
      </ResponsiveDialog>
    </>
  );
}
