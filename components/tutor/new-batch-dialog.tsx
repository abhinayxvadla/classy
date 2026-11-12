"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { PlusCircle, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { ResponsiveDialog } from "@/components/ui/responsive-dialog";
import { createBatchAction } from "@/app/actions/tutor";
import { studentGrades, studentSubjects } from "@/lib/validators/auth";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface NewBatchDialogProps {
  triggerClassName?: string;
}

export function NewBatchDialog({ triggerClassName }: NewBatchDialogProps) {
  const router = useRouter();
  const [open, setOpen] = React.useState(false);
  const [name, setName] = React.useState("");
  const [subject, setSubject] = React.useState<string>(studentSubjects[0]);
  const [grade, setGrade] = React.useState<string>(studentGrades[4]);
  const [description, setDescription] = React.useState("");
  const [premiumPrice, setPremiumPrice] = React.useState<number>(0);
  const [loading, setLoading] = React.useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      toast.error("Please enter a batch name");
      return;
    }

    setLoading(true);
    try {
      const res = await createBatchAction({
        name,
        subject,
        grade,
        description,
        premium_price_inr: Number(premiumPrice) || 0,
      });

      if (res.error) {
        toast.error(res.error);
        setLoading(false);
        return;
      }

      toast.success("Batch created successfully!");
      setOpen(false);
      setName("");
      setDescription("");
      setPremiumPrice(0);
      if (res.batch?.id) {
        router.push(`/t/batches/${res.batch.id}`);
      } else {
        router.refresh();
      }
    } catch {
      toast.error("Failed to create batch");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Button
        onClick={() => setOpen(true)}
        className={triggerClassName || "rounded-xl font-semibold bg-primary hover:bg-primary/90 text-primary-foreground shadow-xs"}
      >
        <PlusCircle className="w-4 h-4 mr-2" />
        New Batch
      </Button>

      <ResponsiveDialog
        open={open}
        onOpenChange={setOpen}
        title="Create New Batch"
        description="Set up a new classroom with a 6-character join code and invite students."
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-1.5">
            <Label htmlFor="batch-name" className="text-xs font-semibold">
              Batch Name *
            </Label>
            <Input
              id="batch-name"
              required
              placeholder="e.g. Class 10 Board Champions"
              value={name}
              onChange={(e) => setName(e.target.value)}
              disabled={loading}
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
                disabled={loading}
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
                Target Grade
              </Label>
              <Select
                value={grade}
                onValueChange={(val) => {
                  if (val) setGrade(val);
                }}
                disabled={loading}
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
              Description <span className="text-muted font-normal">(optional)</span>
            </Label>
            <Textarea
              id="batch-description"
              placeholder="Weekly tests, formula sheets, live problem solving..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              disabled={loading}
              className="rounded-xl min-h-[80px]"
            />
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="batch-price" className="text-xs font-semibold">
              Monthly Premium Price (₹ INR)
            </Label>
            <Input
              id="batch-price"
              type="number"
              min={0}
              placeholder="0 for 100% free batch"
              value={premiumPrice || ""}
              onChange={(e) => setPremiumPrice(Number(e.target.value) || 0)}
              disabled={loading}
              className="rounded-xl"
            />
            <p className="text-[11px] text-muted">
              Leave 0 if this batch is completely free. Set a fee to gate premium quizzes and notes.
            </p>
          </div>

          <div className="pt-2 flex items-center justify-end gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => setOpen(false)}
              disabled={loading}
              className="rounded-xl"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={loading}
              className="rounded-xl bg-primary hover:bg-primary/90 text-primary-foreground font-semibold shadow-xs"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin mr-2" />
                  Creating...
                </>
              ) : (
                "Create Batch"
              )}
            </Button>
          </div>
        </form>
      </ResponsiveDialog>
    </>
  );
}
