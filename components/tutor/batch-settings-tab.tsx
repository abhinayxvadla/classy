"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import {
  RefreshCw,
  Trash2,
  Loader2,
  Save,
  IndianRupee,
  CheckCircle2,
  Clock,
  XCircle,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { ResponsiveDialog } from "@/components/ui/responsive-dialog";
import { PLATFORM_FEE_PERCENT } from "@/lib/config";
import {
  updateBatchAction,
  regenerateJoinCodeAction,
  deleteBatchAction,
} from "@/app/actions/tutor";
import { studentGrades, studentSubjects } from "@/lib/validators/auth";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export interface BatchSettingsData {
  id: string;
  name: string;
  subject: string | null;
  grade: string | null;
  description: string | null;
  joinCode: string;
  premiumPriceInr: number;
}

export interface BatchPaymentItem {
  id: string;
  amountInr: number;
  commissionInr: number;
  status: "created" | "paid" | "failed";
  createdAt: string;
  paymentId: string | null;
  studentName: string;
  studentEmail: string;
}

interface BatchSettingsTabProps {
  batch: BatchSettingsData;
  payments?: BatchPaymentItem[];
}

export function BatchSettingsTab({ batch, payments = [] }: BatchSettingsTabProps) {
  const router = useRouter();

  const [name, setName] = React.useState(batch.name);
  const [subject, setSubject] = React.useState(batch.subject || studentSubjects[0]);
  const [grade, setGrade] = React.useState(batch.grade || studentGrades[4]);
  const [description, setDescription] = React.useState(batch.description || "");
  const [premiumPrice, setPremiumPrice] = React.useState(batch.premiumPriceInr);

  const [saving, setSaving] = React.useState(false);

  // Compute batch earnings
  const paidPayments = payments.filter((p) => p.status === "paid");
  const grossEarnings = paidPayments.reduce((acc, p) => acc + p.amountInr, 0);
  const platformFee = paidPayments.reduce(
    (acc, p) =>
      acc + (p.commissionInr || Math.round((p.amountInr * PLATFORM_FEE_PERCENT) / 100)),
    0
  );
  const netEarnings = grossEarnings - platformFee;

  // Regenerate Code Modal State
  const [regenOpen, setRegenOpen] = React.useState(false);
  const [regenerating, setRegenerating] = React.useState(false);

  // Delete Modal State
  const [deleteOpen, setDeleteOpen] = React.useState(false);
  const [confirmName, setConfirmName] = React.useState("");
  const [deleting, setDeleting] = React.useState(false);

  const handleSaveDetails = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      toast.error("Batch name cannot be empty");
      return;
    }

    setSaving(true);
    try {
      const res = await updateBatchAction(batch.id, {
        name,
        subject,
        grade,
        description,
        premium_price_inr: Number(premiumPrice) || 0,
      });

      if (res.error) toast.error(res.error);
      else {
        toast.success("Batch settings updated successfully!");
        router.refresh();
      }
    } catch {
      toast.error("Failed to update settings");
    } finally {
      setSaving(false);
    }
  };

  const handleRegenerateCode = async () => {
    setRegenerating(true);
    try {
      const res = await regenerateJoinCodeAction(batch.id);
      if (res.error) toast.error(res.error);
      else {
        toast.success(`New join code generated: ${res.newCode}`);
        setRegenOpen(false);
        router.refresh();
      }
    } catch {
      toast.error("Failed to regenerate code");
    } finally {
      setRegenerating(false);
    }
  };

  const handleDeleteBatch = async () => {
    if (confirmName.trim() !== batch.name.trim()) {
      toast.error("Batch name does not match");
      return;
    }

    setDeleting(true);
    try {
      const res = await deleteBatchAction(batch.id);
      if (res.error) toast.error(res.error);
      else {
        toast.success("Batch deleted");
        router.push("/t/batches");
      }
    } catch {
      toast.error("Failed to delete batch");
    } finally {
      setDeleting(false);
    }
  };

  return (
    <div className="space-y-8 max-w-3xl">
      {/* General Settings Card */}
      <form onSubmit={handleSaveDetails} className="p-6 rounded-2xl border border-border bg-surface shadow-xs space-y-4">
        <div>
          <h3 className="font-serif text-lg font-bold text-ink">
            General Information
          </h3>
          <p className="text-xs text-muted">
            Update your batch name, subject, and class level.
          </p>
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="batch-name" className="text-xs font-semibold">
            Batch Name *
          </Label>
          <Input
            id="batch-name"
            required
            value={name}
            onChange={(e) => setName(e.target.value)}
            disabled={saving}
            className="rounded-xl"
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div className="space-y-1.5">
            <Label htmlFor="batch-subject" className="text-xs font-semibold">
              Subject
            </Label>
            <Select
              value={subject}
              onValueChange={(val) => {
                if (val) setSubject(val);
              }}
              disabled={saving}
            >
              <SelectTrigger id="batch-subject" className="rounded-xl text-xs sm:text-sm">
                <SelectValue placeholder="Select subject" />
              </SelectTrigger>
              <SelectContent className="rounded-xl">
                {studentSubjects.map((s) => (
                  <SelectItem key={s} value={s} className="text-xs sm:text-sm">
                    {s}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="batch-grade" className="text-xs font-semibold">
              Grade / Class
            </Label>
            <Select
              value={grade}
              onValueChange={(val) => {
                if (val) setGrade(val);
              }}
              disabled={saving}
            >
              <SelectTrigger id="batch-grade" className="rounded-xl text-xs sm:text-sm">
                <SelectValue placeholder="Select grade" />
              </SelectTrigger>
              <SelectContent className="rounded-xl">
                {studentGrades.map((g) => (
                  <SelectItem key={g} value={g} className="text-xs sm:text-sm">
                    {g}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="batch-description" className="text-xs font-semibold">
            Description
          </Label>
          <Textarea
            id="batch-description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            disabled={saving}
            className="rounded-xl min-h-[80px]"
          />
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="batch-price" className="text-xs font-semibold">
            Monthly Premium Fee (₹ INR)
          </Label>
          <Input
            id="batch-price"
            type="number"
            min={0}
            value={premiumPrice}
            onChange={(e) => setPremiumPrice(Number(e.target.value) || 0)}
            disabled={saving}
            className="rounded-xl"
          />
          <p className="text-[11px] text-muted">
            Set to 0 for a free batch. Students pay this monthly fee to unlock premium items.
          </p>
        </div>

        <div className="pt-2 flex justify-end">
          <Button
            type="submit"
            disabled={saving}
            className="rounded-xl text-xs font-semibold bg-primary hover:bg-primary/90 text-primary-foreground shadow-xs gap-1.5"
          >
            {saving ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Save className="w-3.5 h-3.5" />}
            Save Changes
          </Button>
        </div>
      </form>

      {/* Batch Premium Earnings Card & Payments List */}
      <div className="p-6 rounded-2xl border border-border bg-surface shadow-xs space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-4 border-b border-border">
          <div>
            <h3 className="font-serif text-lg font-bold text-ink flex items-center gap-2">
              <IndianRupee className="h-5 w-5 text-accent" />
              <span>Batch Earnings & Premium Payments</span>
            </h3>
            <p className="text-xs text-muted">
              Monthly unlock fees collected from students enrolled in this batch.
            </p>
          </div>

          <Badge variant="outline" className="self-start sm:self-auto text-xs border-border">
            {payments.length} {payments.length === 1 ? "Payment" : "Payments"}
          </Badge>
        </div>

        {/* 3-Part Earnings Breakdown: Gross, Classy Fee 15%, Net */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div className="p-4 rounded-xl bg-bg border border-border space-y-1">
            <span className="text-[11px] font-semibold text-muted uppercase tracking-wider block">
              Gross Earnings
            </span>
            <span className="font-serif text-2xl font-bold text-ink">
              ₹{grossEarnings.toLocaleString("en-IN")}
            </span>
            <span className="text-[10px] text-muted block">Total student unlocks</span>
          </div>

          <div className="p-4 rounded-xl bg-bg border border-border space-y-1">
            <span className="text-[11px] font-semibold text-muted uppercase tracking-wider block">
              Classy Fee ({PLATFORM_FEE_PERCENT}%)
            </span>
            <span className="font-serif text-2xl font-bold text-muted">
              -₹{platformFee.toLocaleString("en-IN")}
            </span>
            <span className="text-[10px] text-muted block">Platform & hosting share</span>
          </div>

          <div className="p-4 rounded-xl bg-primary-soft/60 border border-primary/20 space-y-1">
            <span className="text-[11px] font-semibold text-primary uppercase tracking-wider block">
              Net Earnings
            </span>
            <span className="font-serif text-2xl font-bold text-accent">
              ₹{netEarnings.toLocaleString("en-IN")}
            </span>
            <span className="text-[10px] text-muted block">Your payout share</span>
          </div>
        </div>

        {/* Payments List */}
        <div className="space-y-3 pt-2">
          <h4 className="font-serif font-bold text-ink text-sm">
            Payment History
          </h4>

          {payments.length === 0 ? (
            <div className="p-6 rounded-xl bg-bg border border-dashed border-border text-center">
              <p className="text-xs text-muted">
                No payments recorded for this batch yet. When students unlock premium, transaction details will appear here.
              </p>
            </div>
          ) : (
            <div className="space-y-2">
              {payments.map((p) => {
                const isPaid = p.status === "paid";
                const isCreated = p.status === "created";

                return (
                  <div
                    key={p.id}
                    className="p-3.5 rounded-xl border border-border bg-bg/50 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs"
                  >
                    <div className="space-y-0.5">
                      <div className="flex items-center gap-2">
                        <strong className="text-ink font-semibold">
                          {p.studentName}
                        </strong>
                        {isPaid ? (
                          <Badge className="bg-success/15 text-success border-transparent text-[10px] font-semibold gap-1">
                            <CheckCircle2 className="h-3 w-3" /> Paid
                          </Badge>
                        ) : isCreated ? (
                          <Badge className="bg-warning/15 text-warning border-transparent text-[10px] font-medium gap-1">
                            <Clock className="h-3 w-3" /> Initiated
                          </Badge>
                        ) : (
                          <Badge className="bg-destructive/15 text-destructive border-transparent text-[10px] font-medium gap-1">
                            <XCircle className="h-3 w-3" /> Failed
                          </Badge>
                        )}
                      </div>

                      {p.studentEmail && (
                        <span className="text-muted text-[11px] block">
                          {p.studentEmail}
                        </span>
                      )}
                    </div>

                    <div className="flex items-center justify-between sm:justify-end gap-4">
                      <div className="text-right">
                        <span className="font-semibold text-ink text-sm">
                          ₹{p.amountInr}
                        </span>
                        <span className="text-[10px] text-muted block">
                          Net: ₹{p.amountInr - p.commissionInr}
                        </span>
                      </div>

                      <span className="text-[11px] text-muted shrink-0">
                        {new Date(p.createdAt).toLocaleDateString(undefined, {
                          month: "short",
                          day: "numeric",
                          year: "numeric",
                        })}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* Join Code Regenerate Card */}
      <div className="p-6 rounded-2xl border border-border bg-surface shadow-xs space-y-3">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h3 className="font-serif text-lg font-bold text-ink">
              Regenerate Join Code
            </h3>
            <p className="text-xs text-muted">
              Current code is <span className="font-mono font-bold text-primary">{batch.joinCode}</span>.
              Regenerating will invalidate the old code. Existing joined students stay joined.
            </p>
          </div>

          <Button
            variant="outline"
            onClick={() => setRegenOpen(true)}
            className="rounded-xl text-xs font-semibold shrink-0 gap-1.5"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            Regenerate Code
          </Button>
        </div>
      </div>

      {/* Delete Batch Danger Zone */}
      <div className="p-6 rounded-2xl border border-destructive/30 bg-destructive/5 shadow-xs space-y-3">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h3 className="font-serif text-lg font-bold text-destructive">
              Delete This Batch
            </h3>
            <p className="text-xs text-muted">
              Permanently delete this batch along with its roster, coursework items, and submissions.
            </p>
          </div>

          <Button
            variant="destructive"
            onClick={() => setDeleteOpen(true)}
            className="rounded-xl text-xs font-semibold shrink-0 gap-1.5"
          >
            <Trash2 className="w-3.5 h-3.5" />
            Delete Batch
          </Button>
        </div>
      </div>

      {/* Regenerate Confirmation Dialog */}
      <ResponsiveDialog
        open={regenOpen}
        onOpenChange={setRegenOpen}
        title="Regenerate 6-Character Join Code?"
        description="The current invite link and code will no longer work for new students. All currently joined students will retain their access."
      >
        <div className="flex items-center justify-end gap-2 pt-4">
          <Button
            variant="outline"
            onClick={() => setRegenOpen(false)}
            disabled={regenerating}
            className="rounded-xl text-xs"
          >
            Cancel
          </Button>
          <Button
            onClick={handleRegenerateCode}
            disabled={regenerating}
            className="rounded-xl text-xs font-semibold bg-primary hover:bg-primary/90 text-primary-foreground"
          >
            {regenerating ? "Generating..." : "Yes, Generate New Code"}
          </Button>
        </div>
      </ResponsiveDialog>

      {/* Delete Confirmation Dialog */}
      <ResponsiveDialog
        open={deleteOpen}
        onOpenChange={setDeleteOpen}
        title="Delete Batch Permanently"
        description={`This action cannot be undone. To confirm, please type the batch name "${batch.name}" below:`}
      >
        <div className="space-y-4 pt-2">
          <Input
            placeholder={batch.name}
            value={confirmName}
            onChange={(e) => setConfirmName(e.target.value)}
            disabled={deleting}
            className="rounded-xl text-xs"
          />

          <div className="flex items-center justify-end gap-2">
            <Button
              variant="outline"
              onClick={() => setDeleteOpen(false)}
              disabled={deleting}
              className="rounded-xl text-xs"
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={handleDeleteBatch}
              disabled={deleting || confirmName.trim() !== batch.name.trim()}
              className="rounded-xl text-xs font-semibold"
            >
              {deleting ? "Deleting..." : "Permanently Delete Batch"}
            </Button>
          </div>
        </div>
      </ResponsiveDialog>
    </div>
  );
}
