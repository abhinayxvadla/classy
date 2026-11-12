"use client";

import * as React from "react";
import { toast } from "sonner";
import { UserPlus, Users, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ResponsiveDialog } from "@/components/ui/responsive-dialog";
import { addStudentToRosterAction, bulkAddStudentsAction } from "@/app/actions/tutor";

interface AddStudentDialogProps {
  batchId: string;
}

export function AddStudentDialog({ batchId }: AddStudentDialogProps) {
  const [open, setOpen] = React.useState(false);
  const [tab, setTab] = React.useState<"single" | "bulk">("single");

  // Single mode state
  const [fullName, setFullName] = React.useState("");
  const [email, setEmail] = React.useState("");
  const [phone, setPhone] = React.useState("");

  // Bulk mode state
  const [rawBulkText, setRawBulkText] = React.useState("");

  const [loading, setLoading] = React.useState(false);

  // Preview parsed bulk rows
  const parsedRows = React.useMemo(() => {
    if (!rawBulkText.trim()) return [];
    return rawBulkText
      .split("\n")
      .map((line) => line.trim())
      .filter((line) => line.length > 0)
      .map((line) => {
        const parts = line.split(",").map((p) => p.trim());
        return {
          name: parts[0] || "Unknown",
          email: parts[1] || "",
          phone: parts[2] || "",
        };
      });
  }, [rawBulkText]);

  const handleSingleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!fullName.trim()) {
      toast.error("Please enter student name");
      return;
    }

    setLoading(true);
    try {
      const res = await addStudentToRosterAction(batchId, {
        fullName,
        email: email || undefined,
        phone: phone || undefined,
      });

      if (res.error) {
        toast.error(res.error);
        setLoading(false);
        return;
      }

      toast.success("Student added to batch!");
      setFullName("");
      setEmail("");
      setPhone("");
      setOpen(false);
    } catch {
      toast.error("Failed to add student");
    } finally {
      setLoading(false);
    }
  };

  const handleBulkSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (parsedRows.length === 0) {
      toast.error("Please provide at least one student line");
      return;
    }

    setLoading(true);
    try {
      const res = await bulkAddStudentsAction(batchId, rawBulkText);
      if (res.error) {
        toast.error(res.error);
        setLoading(false);
        return;
      }

      toast.success(
        `Bulk add complete! Added ${res.added ?? 0} students${
          res.skipped ? `, ${res.skipped} skipped (already present)` : ""
        }.`
      );
      setRawBulkText("");
      setOpen(false);
    } catch {
      toast.error("Failed to process bulk import");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Button
        onClick={() => setOpen(true)}
        className="rounded-xl text-xs font-semibold gap-1.5"
      >
        <UserPlus className="w-4 h-4" />
        Add Students
      </Button>

      <ResponsiveDialog
        open={open}
        onOpenChange={setOpen}
        title="Add Students to Batch"
        description="Add a single student or import multiple students at once via CSV or list."
      >
        <Tabs
          value={tab}
          onValueChange={(v) => setTab(v as "single" | "bulk")}
          className="w-full"
        >
          <TabsList className="grid w-full grid-cols-2 rounded-xl mb-4">
            <TabsTrigger value="single" className="rounded-lg text-xs font-semibold">
              <UserPlus className="w-3.5 h-3.5 mr-1.5" />
              Single Student
            </TabsTrigger>
            <TabsTrigger value="bulk" className="rounded-lg text-xs font-semibold">
              <Users className="w-3.5 h-3.5 mr-1.5" />
              Bulk Add / CSV
            </TabsTrigger>
          </TabsList>

          {/* Single Student Form */}
          <TabsContent value="single">
            <form onSubmit={handleSingleSubmit} className="space-y-4">
              <div className="space-y-1.5">
                <Label htmlFor="single-name" className="text-xs font-semibold">
                  Full Name *
                </Label>
                <Input
                  id="single-name"
                  required
                  placeholder="e.g. Diya Sharma"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  disabled={loading}
                  className="rounded-xl"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <Label htmlFor="single-email" className="text-xs font-semibold">
                    Email <span className="text-muted font-normal">(optional)</span>
                  </Label>
                  <Input
                    id="single-email"
                    type="email"
                    placeholder="diya@gmail.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    disabled={loading}
                    className="rounded-xl"
                  />
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="single-phone" className="text-xs font-semibold">
                    Mobile Phone <span className="text-muted font-normal">(optional)</span>
                  </Label>
                  <Input
                    id="single-phone"
                    type="tel"
                    placeholder="+91 98765 43210"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    disabled={loading}
                    className="rounded-xl"
                  />
                </div>
              </div>

              <p className="text-[11px] text-muted">
                If the student already has a Classy account with this email/phone, they will be automatically joined.
              </p>

              <div className="flex items-center justify-end gap-2 pt-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setOpen(false)}
                  disabled={loading}
                  className="rounded-xl text-xs"
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  disabled={loading}
                  className="rounded-xl text-xs font-semibold bg-primary hover:bg-primary/90 text-primary-foreground shadow-xs"
                >
                  {loading ? (
                    <>
                      <Loader2 className="w-3.5 h-3.5 animate-spin mr-1.5" />
                      Adding...
                    </>
                  ) : (
                    "Add Student"
                  )}
                </Button>
              </div>
            </form>
          </TabsContent>

          {/* Bulk Import Form */}
          <TabsContent value="bulk">
            <form onSubmit={handleBulkSubmit} className="space-y-4">
              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <Label htmlFor="bulk-text" className="text-xs font-semibold">
                    Paste Entries (One per line)
                  </Label>
                  <span className="text-[11px] text-muted">
                    Format: Name, email, phone
                  </span>
                </div>
                <Textarea
                  id="bulk-text"
                  required
                  placeholder={`Rohan Verma, rohan@gmail.com, +919876543210\nAnanya Sen, ananya@gmail.com\nVikram Singh, , 9876512340`}
                  value={rawBulkText}
                  onChange={(e) => setRawBulkText(e.target.value)}
                  disabled={loading}
                  className="rounded-xl min-h-[140px] font-mono text-xs"
                />
              </div>

              {/* Preview Box */}
              {parsedRows.length > 0 && (
                <div className="rounded-xl border border-border bg-surface/60 p-3 space-y-2">
                  <div className="flex items-center justify-between text-xs font-semibold text-ink">
                    <span>Parsed Preview</span>
                    <span className="text-primary font-bold">
                      {parsedRows.length} entries
                    </span>
                  </div>
                  <div className="max-h-36 overflow-y-auto space-y-1 text-xs">
                    {parsedRows.slice(0, 5).map((row, idx) => (
                      <div
                        key={idx}
                        className="flex items-center justify-between py-0.5 border-b border-border/50 last:border-0 text-muted"
                      >
                        <span className="font-medium text-ink truncate max-w-[140px]">
                          {row.name}
                        </span>
                        <span className="text-[11px] truncate max-w-[120px]">
                          {row.email || row.phone || "No contact"}
                        </span>
                      </div>
                    ))}
                    {parsedRows.length > 5 && (
                      <p className="text-[11px] text-muted pt-1 text-center italic">
                        ...and {parsedRows.length - 5} more entries
                      </p>
                    )}
                  </div>
                </div>
              )}

              <p className="text-[11px] text-muted">
                Duplicates by email or phone will be skipped automatically.
              </p>

              <div className="flex items-center justify-end gap-2 pt-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setOpen(false)}
                  disabled={loading}
                  className="rounded-xl text-xs"
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  disabled={loading || parsedRows.length === 0}
                  className="rounded-xl text-xs font-semibold bg-primary hover:bg-primary/90 text-primary-foreground shadow-xs"
                >
                  {loading ? (
                    <>
                      <Loader2 className="w-3.5 h-3.5 animate-spin mr-1.5" />
                      Importing...
                    </>
                  ) : (
                    `Import ${parsedRows.length} Students`
                  )}
                </Button>
              </div>
            </form>
          </TabsContent>
        </Tabs>
      </ResponsiveDialog>
    </>
  );
}
