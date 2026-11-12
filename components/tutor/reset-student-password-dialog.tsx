"use client";

import * as React from "react";
import { toast } from "sonner";
import { KeyRound, Copy, Check, Loader2, AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ResponsiveDialog } from "@/components/ui/responsive-dialog";
import { resetStudentPassword } from "@/app/actions/auth";

interface ResetStudentPasswordDialogProps {
  studentId: string;
  studentName: string;
}

export function ResetStudentPasswordDialog({
  studentId,
  studentName,
}: ResetStudentPasswordDialogProps) {
  const [open, setOpen] = React.useState(false);
  const [loading, setLoading] = React.useState(false);
  const [tempPassword, setTempPassword] = React.useState<string | null>(null);
  const [copied, setCopied] = React.useState(false);

  const handleReset = async () => {
    setLoading(true);
    try {
      const res = await resetStudentPassword(studentId);
      if (res.error) {
        toast.error(res.error);
        setLoading(false);
        return;
      }
      if (res.temporaryPassword) {
        setTempPassword(res.temporaryPassword);
        toast.success(`Temporary password generated for ${studentName}`);
      }
    } catch {
      toast.error("Failed to reset student password");
    } finally {
      setLoading(false);
    }
  };

  const handleCopy = async () => {
    if (!tempPassword) return;
    try {
      await navigator.clipboard.writeText(tempPassword);
      setCopied(true);
      toast.success("Temporary password copied to clipboard!");
      setTimeout(() => setCopied(false), 2000);
    } catch {
      toast.error("Failed to copy");
    }
  };

  const handleClose = () => {
    setOpen(false);
    setTempPassword(null);
  };

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="text-xs text-primary hover:underline font-medium inline-flex items-center gap-1 cursor-pointer"
      >
        <KeyRound className="w-3.5 h-3.5" />
        Reset Password
      </button>

      <ResponsiveDialog
        open={open}
        onOpenChange={handleClose}
        title={`Reset Password for ${studentName}`}
        description="Generate a temporary 10-character password. The student will be forced to choose their own new password upon login."
      >
        <div className="space-y-4 py-1">
          {!tempPassword ? (
            <div className="space-y-4">
              <div className="p-3.5 rounded-xl bg-amber-500/10 border border-amber-500/20 text-xs text-amber-700 dark:text-amber-400 flex items-start gap-2.5">
                <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5" />
                <span>
                  This will immediately replace the student&apos;s current password. They will be directed to change it on their next login.
                </span>
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <Button
                  variant="outline"
                  onClick={handleClose}
                  disabled={loading}
                  className="rounded-xl text-xs"
                >
                  Cancel
                </Button>
                <Button
                  onClick={handleReset}
                  disabled={loading}
                  className="rounded-xl bg-primary hover:bg-primary/90 text-primary-foreground text-xs font-semibold"
                >
                  {loading ? (
                    <>
                      <Loader2 className="w-3.5 h-3.5 animate-spin mr-1.5" />
                      Generating...
                    </>
                  ) : (
                    "Generate Temporary Password"
                  )}
                </Button>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="p-4 rounded-2xl bg-surface border border-border text-center space-y-2">
                <span className="text-xs uppercase font-semibold text-muted">
                  Temporary 10-Character Password
                </span>
                <div className="font-mono text-2xl font-bold tracking-wider text-ink bg-primary-soft/50 py-2 px-3 rounded-xl border border-primary/20 select-all">
                  {tempPassword}
                </div>
                <p className="text-[11px] text-muted">
                  Share this with {studentName}. It will only be shown once.
                </p>
              </div>

              <div className="flex items-center gap-2">
                <Button
                  onClick={handleCopy}
                  className="flex-1 rounded-xl text-xs font-semibold gap-1.5"
                >
                  {copied ? (
                    <>
                      <Check className="w-4 h-4 text-emerald-300" />
                      Copied!
                    </>
                  ) : (
                    <>
                      <Copy className="w-4 h-4" />
                      Copy Password
                    </>
                  )}
                </Button>
                <Button
                  variant="outline"
                  onClick={handleClose}
                  className="rounded-xl text-xs"
                >
                  Done
                </Button>
              </div>
            </div>
          )}
        </div>
      </ResponsiveDialog>
    </>
  );
}
