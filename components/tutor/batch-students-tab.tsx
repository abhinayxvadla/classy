"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import {
  Users,
  CheckCircle2,
  XCircle,
  Clock,
  Mail,
  Phone,
  Trash2,
  Lock,
  MoreVertical,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { AddStudentDialog } from "@/components/tutor/add-student-dialog";
import { ResetStudentPasswordDialog } from "@/components/tutor/reset-student-password-dialog";
import {
  updateRosterStatusAction,
  removeRosterStudentAction,
} from "@/app/actions/tutor";
import type { RosterStatus } from "@/lib/database.types";
import { format } from "date-fns";

export interface RosterMember {
  id: string;
  full_name: string;
  email: string | null;
  phone: string | null;
  status: RosterStatus;
  student_id: string | null;
  premium_until: string | null;
  joined_at: string | null;
  created_at: string;
}

interface BatchStudentsTabProps {
  batchId: string;
  roster: RosterMember[];
}

export function BatchStudentsTab({ batchId, roster }: BatchStudentsTabProps) {
  const router = useRouter();
  const [filterStatus, setFilterStatus] = React.useState<string>("all");

  const filtered = React.useMemo(() => {
    if (filterStatus === "all") return roster;
    return roster.filter((r) => r.status === filterStatus);
  }, [roster, filterStatus]);

  const handleUpdateStatus = async (rosterId: string, status: RosterStatus) => {
    try {
      const res = await updateRosterStatusAction(rosterId, status);
      if (res.error) toast.error(res.error);
      else {
        toast.success(`Student status updated to ${status}`);
        router.refresh();
      }
    } catch {
      toast.error("Failed to update status");
    }
  };

  const handleRemove = async (rosterId: string) => {
    try {
      const res = await removeRosterStudentAction(rosterId);
      if (res.error) toast.error(res.error);
      else {
        toast.success("Student removed from batch");
        router.refresh();
      }
    } catch {
      toast.error("Failed to remove student");
    }
  };

  const getStatusBadge = (status: RosterStatus) => {
    switch (status) {
      case "joined":
        return (
          <Badge variant="outline" className="text-emerald-700 dark:text-emerald-400 border-emerald-500/30 bg-emerald-500/10 text-[10px] font-semibold gap-1">
            <CheckCircle2 className="w-2.5 h-2.5" /> Joined
          </Badge>
        );
      case "pending":
        return (
          <Badge variant="outline" className="text-amber-700 dark:text-amber-400 border-amber-500/30 bg-amber-500/10 text-[10px] font-semibold gap-1">
            <Clock className="w-2.5 h-2.5" /> Pending Approval
          </Badge>
        );
      case "invited":
        return (
          <Badge variant="secondary" className="text-muted text-[10px]">
            Invited
          </Badge>
        );
      case "rejected":
        return (
          <Badge variant="outline" className="text-destructive border-destructive/30 bg-destructive/10 text-[10px]">
            <XCircle className="w-2.5 h-2.5 mr-1" /> Rejected
          </Badge>
        );
    }
  };

  const pendingCount = roster.filter((r) => r.status === "pending").length;

  return (
    <div className="space-y-4">
      {/* Top Bar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
        <div className="flex flex-wrap items-center gap-1.5 p-1 rounded-xl bg-surface border border-border">
          {[
            { label: "All Members", value: "all" },
            { label: "Joined", value: "joined" },
            {
              label: `Pending${pendingCount > 0 ? ` (${pendingCount})` : ""}`,
              value: "pending",
            },
            { label: "Invited", value: "invited" },
          ].map((tab) => (
            <button
              key={tab.value}
              onClick={() => setFilterStatus(tab.value)}
              className={`px-3 py-1 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                filterStatus === tab.value
                  ? "bg-primary text-primary-foreground shadow-xs"
                  : "text-muted hover:text-ink hover:bg-black/5 dark:hover:bg-white/5"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        <div className="flex items-center gap-2">
          <AddStudentDialog batchId={batchId} />
        </div>
      </div>

      {filtered.length === 0 ? (
        <div className="p-12 rounded-2xl border border-dashed border-border bg-surface/50 text-center space-y-3">
          <div className="w-12 h-12 rounded-2xl bg-primary-soft text-primary mx-auto flex items-center justify-center">
            <Users className="w-6 h-6" />
          </div>
          <h3 className="font-serif text-lg font-bold text-ink">
            No students found
          </h3>
          <p className="text-xs text-muted max-w-sm mx-auto">
            {roster.length === 0
              ? "Share your 6-character join code or invite students directly."
              : "No students in this view match your selected filter."}
          </p>
          {roster.length === 0 && (
            <div className="pt-2">
              <AddStudentDialog batchId={batchId} />
            </div>
          )}
        </div>
      ) : (
        <>
          {/* DESKTOP TABLE (>= 768px) */}
          <div className="hidden md:block rounded-2xl border border-border bg-surface overflow-hidden shadow-xs">
            <Table>
              <TableHeader className="bg-surface/50">
                <TableRow className="border-border">
                  <TableHead className="text-xs font-semibold">Student Name</TableHead>
                  <TableHead className="text-xs font-semibold">Contact Info</TableHead>
                  <TableHead className="text-xs font-semibold">Status</TableHead>
                  <TableHead className="text-xs font-semibold">Joined / Added</TableHead>
                  <TableHead className="text-xs font-semibold text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filtered.map((student) => {
                  const hasPremium =
                    student.premium_until && new Date(student.premium_until) > new Date();

                  return (
                    <TableRow key={student.id} className="border-border hover:bg-black/2 dark:hover:bg-white/2">
                      <TableCell className="py-3">
                        <div className="flex items-center gap-2">
                          <span className="font-semibold text-sm text-ink">
                            {student.full_name}
                          </span>
                          {hasPremium && (
                            <Badge variant="outline" className="text-[10px] text-accent border-accent/40 bg-accent/10">
                              <Lock className="w-2.5 h-2.5 mr-0.5" /> Premium
                            </Badge>
                          )}
                        </div>
                      </TableCell>

                      <TableCell className="py-3 text-xs text-muted">
                        <div className="flex flex-col gap-0.5">
                          {student.email && (
                            <span className="flex items-center gap-1.5">
                              <Mail className="w-3 h-3 opacity-70" />
                              {student.email}
                            </span>
                          )}
                          {student.phone && (
                            <span className="flex items-center gap-1.5">
                              <Phone className="w-3 h-3 opacity-70" />
                              {student.phone}
                            </span>
                          )}
                          {!student.email && !student.phone && (
                            <span className="italic opacity-60">No contact provided</span>
                          )}
                        </div>
                      </TableCell>

                      <TableCell className="py-3">
                        {getStatusBadge(student.status)}
                      </TableCell>

                      <TableCell className="py-3 text-xs text-muted">
                        {student.joined_at
                          ? format(new Date(student.joined_at), "MMM d, yyyy")
                          : format(new Date(student.created_at), "MMM d, yyyy")}
                      </TableCell>

                      <TableCell className="py-3 text-right">
                        <div className="flex items-center justify-end gap-2">
                          {/* Pending approvals buttons */}
                          {student.status === "pending" && (
                            <>
                              <Button
                                size="sm"
                                onClick={() => handleUpdateStatus(student.id, "joined")}
                                className="h-7 px-2.5 rounded-lg text-xs bg-emerald-600 hover:bg-emerald-700 text-white font-semibold"
                              >
                                Approve
                              </Button>
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => handleUpdateStatus(student.id, "rejected")}
                                className="h-7 px-2.5 rounded-lg text-xs text-destructive hover:bg-destructive/10"
                              >
                                Reject
                              </Button>
                            </>
                          )}

                          {/* Joined actions: Password reset */}
                          {student.status === "joined" && student.student_id && (
                            <ResetStudentPasswordDialog
                              studentId={student.student_id}
                              studentName={student.full_name}
                            />
                          )}

                          <DropdownMenu>
                            <DropdownMenuTrigger
                              className="p-1 rounded-md text-muted hover:text-ink hover:bg-black/5 dark:hover:bg-white/5 transition-colors cursor-pointer"
                              aria-label="Student actions"
                            >
                              <MoreVertical className="w-4 h-4" />
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end" className="w-44 rounded-xl p-1.5 shadow-lg border border-border">
                              {student.status !== "joined" && (
                                <DropdownMenuItem
                                  onClick={() => handleUpdateStatus(student.id, "joined")}
                                  className="rounded-lg cursor-pointer text-xs flex items-center gap-2"
                                >
                                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                                  <span>Mark as Joined</span>
                                </DropdownMenuItem>
                              )}
                              <DropdownMenuSeparator />
                              <DropdownMenuItem
                                onClick={() => handleRemove(student.id)}
                                className="rounded-lg cursor-pointer text-xs text-destructive focus:text-destructive flex items-center gap-2"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                                <span>Remove Student</span>
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </div>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </div>

          {/* MOBILE CARDS (< 768px) */}
          <div className="md:hidden space-y-3">
            {filtered.map((student) => {
              const hasPremium =
                student.premium_until && new Date(student.premium_until) > new Date();

              return (
                <div
                  key={student.id}
                  className="rounded-2xl border border-border bg-surface p-4 shadow-2xs space-y-3"
                >
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-semibold text-sm text-ink">
                          {student.full_name}
                        </span>
                        {hasPremium && (
                          <Badge variant="outline" className="text-[10px] text-accent border-accent/40 bg-accent/10">
                            <Lock className="w-2 h-2 mr-0.5" /> Premium
                          </Badge>
                        )}
                      </div>
                      <div className="text-xs text-muted space-y-0.5 mt-1">
                        {student.email && <div>{student.email}</div>}
                        {student.phone && <div>{student.phone}</div>}
                      </div>
                    </div>

                    <div>{getStatusBadge(student.status)}</div>
                  </div>

                  <div className="pt-2 border-t border-border flex items-center justify-between gap-2">
                    <span className="text-[11px] text-muted">
                      {student.joined_at
                        ? `Joined ${format(new Date(student.joined_at), "MMM d")}`
                        : `Added ${format(new Date(student.created_at), "MMM d")}`}
                    </span>

                    <div className="flex items-center gap-2">
                      {student.status === "pending" ? (
                        <>
                          <Button
                            size="sm"
                            onClick={() => handleUpdateStatus(student.id, "joined")}
                            className="h-7 px-2.5 rounded-lg text-xs bg-emerald-600 hover:bg-emerald-700 text-white font-semibold"
                          >
                            Approve
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleUpdateStatus(student.id, "rejected")}
                            className="h-7 px-2.5 rounded-lg text-xs text-destructive"
                          >
                            Reject
                          </Button>
                        </>
                      ) : (
                        <>
                          {student.status === "joined" && student.student_id && (
                            <ResetStudentPasswordDialog
                              studentId={student.student_id}
                              studentName={student.full_name}
                            />
                          )}
                          <button
                            onClick={() => handleRemove(student.id)}
                            className="text-xs text-destructive p-1 rounded-md hover:bg-destructive/10"
                            title="Remove student"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </>
      )}
    </div>
  );
}
