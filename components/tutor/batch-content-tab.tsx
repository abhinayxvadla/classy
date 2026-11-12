"use client";

import * as React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import {
  FileText,
  HelpCircle,
  ClipboardList,
  Megaphone,
  Plus,
  MoreVertical,
  Edit,
  Copy,
  Trash2,
  Lock,
  Globe,
  Calendar,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button, buttonVariants } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { ResponsiveDialog } from "@/components/ui/responsive-dialog";
import {
  duplicateItemAction,
  deleteItemAction,
  toggleItemPublishedAction,
  toggleItemAccessAction,
  toggleItemVisibilityAction,
} from "@/app/actions/tutor";
import type { ItemType, ItemAccess, ItemVisibility } from "@/lib/database.types";
import { format } from "date-fns";

export interface BatchItemData {
  id: string;
  type: ItemType;
  title: string;
  access: ItemAccess;
  visibility: ItemVisibility;
  due_at: string | null;
  max_marks: number | null;
  published: boolean;
  created_at: string;
}

interface BatchContentTabProps {
  batchId: string;
  items: BatchItemData[];
}

export function BatchContentTab({ batchId, items }: BatchContentTabProps) {
  const router = useRouter();
  const [filterType, setFilterType] = React.useState<string>("all");
  const [deleteId, setDeleteId] = React.useState<string | null>(null);
  const [deleting, setDeleting] = React.useState(false);

  const filteredItems = React.useMemo(() => {
    if (filterType === "all") return items;
    return items.filter((i) => i.type === filterType);
  }, [items, filterType]);

  const handleTogglePublished = async (id: string, current: boolean) => {
    try {
      const res = await toggleItemPublishedAction(id, !current);
      if (res.error) toast.error(res.error);
      else {
        toast.success(current ? "Item unpublished" : "Item published");
        router.refresh();
      }
    } catch {
      toast.error("Failed to update status");
    }
  };

  const handleToggleAccess = async (id: string, current: ItemAccess) => {
    const nextAccess: ItemAccess = current === "free" ? "premium" : "free";
    try {
      const res = await toggleItemAccessAction(id, nextAccess);
      if (res.error) toast.error(res.error);
      else {
        toast.success(`Access changed to ${nextAccess}`);
        router.refresh();
      }
    } catch {
      toast.error("Failed to update access");
    }
  };

  const handleToggleVisibility = async (id: string, current: ItemVisibility, access: ItemAccess) => {
    if (access === "premium") {
      toast.error("Premium items can only be batch-visible");
      return;
    }
    const nextVis: ItemVisibility = current === "batch" ? "public" : "batch";
    try {
      const res = await toggleItemVisibilityAction(id, nextVis);
      if (res.error) toast.error(res.error);
      else {
        toast.success(`Visibility set to ${nextVis}`);
        router.refresh();
      }
    } catch {
      toast.error("Failed to update visibility");
    }
  };

  const handleDuplicate = async (id: string) => {
    try {
      const res = await duplicateItemAction(id);
      if (res.error) toast.error(res.error);
      else {
        toast.success("Item duplicated as draft");
        router.refresh();
      }
    } catch {
      toast.error("Failed to duplicate item");
    }
  };

  const handleDelete = async () => {
    if (!deleteId) return;
    setDeleting(true);
    try {
      const res = await deleteItemAction(deleteId);
      if (res.error) toast.error(res.error);
      else {
        toast.success("Item deleted");
        setDeleteId(null);
        router.refresh();
      }
    } catch {
      toast.error("Failed to delete item");
    } finally {
      setDeleting(false);
    }
  };

  const getItemIcon = (type: ItemType) => {
    switch (type) {
      case "quiz":
        return <HelpCircle className="w-4 h-4 text-primary" />;
      case "notes":
        return <FileText className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />;
      case "assignment":
        return <ClipboardList className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />;
      case "announcement":
        return <Megaphone className="w-4 h-4 text-accent" />;
    }
  };

  return (
    <div className="space-y-4">
      {/* Action and Filter Header */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
        {/* Type Filter Pills */}
        <div className="flex flex-wrap items-center gap-1.5 p-1 rounded-xl bg-surface border border-border">
          {[
            { label: "All Items", value: "all" },
            { label: "Notes", value: "notes" },
            { label: "Quizzes", value: "quiz" },
            { label: "Assignments", value: "assignment" },
            { label: "Announcements", value: "announcement" },
          ].map((tab) => (
            <button
              key={tab.value}
              onClick={() => setFilterType(tab.value)}
              className={`px-3 py-1 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                filterType === tab.value
                  ? "bg-primary text-primary-foreground shadow-xs"
                  : "text-muted hover:text-ink hover:bg-black/5 dark:hover:bg-white/5"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* New Item Menu */}
        <DropdownMenu>
          <DropdownMenuTrigger
            className="inline-flex items-center justify-center gap-1.5 px-4 py-2 rounded-xl text-xs font-semibold bg-primary hover:bg-primary/90 text-primary-foreground shadow-xs cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Create Item</span>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-48 rounded-2xl p-1.5 shadow-lg border border-border">
            <DropdownMenuItem
              onClick={() => router.push(`/t/items/new?batchId=${batchId}&type=notes`)}
              className="rounded-xl cursor-pointer text-xs flex items-center gap-2"
            >
              <FileText className="w-4 h-4 text-emerald-600" />
              <span>Study Notes</span>
            </DropdownMenuItem>
            <DropdownMenuItem
              onClick={() => router.push(`/t/items/new?batchId=${batchId}&type=quiz`)}
              className="rounded-xl cursor-pointer text-xs flex items-center gap-2"
            >
              <HelpCircle className="w-4 h-4 text-primary" />
              <span>Interactive Quiz</span>
            </DropdownMenuItem>
            <DropdownMenuItem
              onClick={() => router.push(`/t/items/new?batchId=${batchId}&type=assignment`)}
              className="rounded-xl cursor-pointer text-xs flex items-center gap-2"
            >
              <ClipboardList className="w-4 h-4 text-indigo-600" />
              <span>Assignment</span>
            </DropdownMenuItem>
            <DropdownMenuItem
              onClick={() => router.push(`/t/items/new?batchId=${batchId}&type=announcement`)}
              className="rounded-xl cursor-pointer text-xs flex items-center gap-2"
            >
              <Megaphone className="w-4 h-4 text-accent" />
              <span>Announcement</span>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      {/* Items List */}
      {filteredItems.length === 0 ? (
        <div className="p-12 rounded-2xl border border-dashed border-border bg-surface/50 text-center space-y-3">
          <div className="w-12 h-12 rounded-2xl bg-primary-soft text-primary mx-auto flex items-center justify-center">
            <FileText className="w-6 h-6" />
          </div>
          <h3 className="font-serif text-lg font-bold text-ink">
            No coursework in this batch
          </h3>
          <p className="text-xs text-muted max-w-sm mx-auto">
            Create notes, quizzes, or assignments manually, or connect your AI assistant to push content automatically.
          </p>
          <div className="pt-2 flex items-center justify-center gap-2">
            <Link
              href={`/t/items/new?batchId=${batchId}&type=notes`}
              className={buttonVariants({
                size: "sm",
                className: "rounded-xl text-xs font-semibold",
              })}
            >
              <Plus className="w-3.5 h-3.5 mr-1" /> Create Notes
            </Link>
            <Link
              href={`/t/items/new?batchId=${batchId}&type=quiz`}
              className={buttonVariants({
                size: "sm",
                variant: "outline",
                className: "rounded-xl text-xs font-semibold",
              })}
            >
              <Plus className="w-3.5 h-3.5 mr-1" /> Create Quiz
            </Link>
          </div>
        </div>
      ) : (
        <div className="space-y-2.5">
          {filteredItems.map((item) => (
            <div
              key={item.id}
              className="rounded-2xl border border-border bg-surface hover:border-primary/30 p-4 transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-2xs"
            >
              <div className="flex items-start gap-3 flex-1 min-w-0">
                <div className="w-9 h-9 rounded-xl bg-surface border border-border flex items-center justify-center shrink-0 mt-0.5">
                  {getItemIcon(item.type)}
                </div>

                <div className="space-y-1 min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <Link
                      href={`/t/items/${item.id}`}
                      className="font-serif text-base font-bold text-ink hover:text-primary transition-colors line-clamp-1"
                    >
                      {item.title}
                    </Link>

                    {/* Access Badge */}
                    {item.access === "premium" ? (
                      <Badge
                        variant="outline"
                        className="rounded-full text-[10px] font-semibold text-accent border-accent/40 bg-accent/10 flex items-center gap-1"
                      >
                        <Lock className="w-2.5 h-2.5" />
                        Premium
                      </Badge>
                    ) : (
                      <Badge variant="secondary" className="rounded-full text-[10px] text-muted">
                        Free
                      </Badge>
                    )}

                    {/* Visibility Badge */}
                    {item.visibility === "public" ? (
                      <Badge
                        variant="outline"
                        className="rounded-full text-[10px] text-emerald-700 dark:text-emerald-400 border-emerald-500/30 bg-emerald-500/10 flex items-center gap-1"
                      >
                        <Globe className="w-2.5 h-2.5" />
                        Public Library
                      </Badge>
                    ) : (
                      <Badge variant="outline" className="rounded-full text-[10px] text-muted border-dashed">
                        Batch only
                      </Badge>
                    )}
                  </div>

                  {/* Subtext info */}
                  <div className="flex flex-wrap items-center gap-3 text-xs text-muted">
                    <span className="capitalize font-medium text-ink/80">{item.type}</span>
                    {item.due_at && (
                      <span className="flex items-center gap-1 text-[11px]">
                        <Calendar className="w-3 h-3" />
                        Due {format(new Date(item.due_at), "MMM d, h:mm a")}
                      </span>
                    )}
                    {item.max_marks != null && (
                      <span className="text-[11px] font-medium">
                        {item.max_marks} marks
                      </span>
                    )}
                  </div>
                </div>
              </div>

              {/* Controls */}
              <div className="flex items-center justify-between sm:justify-end gap-3 pt-2 sm:pt-0 border-t sm:border-0 border-border">
                {/* Published Toggle */}
                <div className="flex items-center gap-2">
                  <span className="text-xs text-muted">
                    {item.published ? "Published" : "Draft"}
                  </span>
                  <Switch
                    checked={item.published}
                    onCheckedChange={() => handleTogglePublished(item.id, item.published)}
                    aria-label="Toggle publication status"
                  />
                </div>

                {/* Actions Dropdown */}
                <DropdownMenu>
                  <DropdownMenuTrigger
                    className="p-1.5 rounded-lg text-muted hover:text-ink hover:bg-black/5 dark:hover:bg-white/5 transition-colors cursor-pointer"
                    aria-label="Item actions"
                  >
                    <MoreVertical className="w-4 h-4" />
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-48 rounded-xl p-1.5 shadow-lg border border-border">
                    <DropdownMenuItem
                      onClick={() => router.push(`/t/items/${item.id}`)}
                      className="rounded-lg cursor-pointer text-xs flex items-center gap-2"
                    >
                      <Edit className="w-3.5 h-3.5" />
                      <span>Edit Content</span>
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      onClick={() => handleDuplicate(item.id)}
                      className="rounded-lg cursor-pointer text-xs flex items-center gap-2"
                    >
                      <Copy className="w-3.5 h-3.5" />
                      <span>Duplicate</span>
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      onClick={() => handleToggleAccess(item.id, item.access)}
                      className="rounded-lg cursor-pointer text-xs flex items-center gap-2"
                    >
                      <Lock className="w-3.5 h-3.5" />
                      <span>Make {item.access === "free" ? "Premium" : "Free"}</span>
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      onClick={() => handleToggleVisibility(item.id, item.visibility, item.access)}
                      disabled={item.access === "premium"}
                      className="rounded-lg cursor-pointer text-xs flex items-center gap-2"
                    >
                      <Globe className="w-3.5 h-3.5" />
                      <span>Make {item.visibility === "batch" ? "Public" : "Batch Only"}</span>
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem
                      onClick={() => setDeleteId(item.id)}
                      className="rounded-lg cursor-pointer text-xs text-destructive focus:text-destructive flex items-center gap-2"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                      <span>Delete Item</span>
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Delete Item Confirmation Dialog */}
      <ResponsiveDialog
        open={Boolean(deleteId)}
        onOpenChange={(open) => !open && setDeleteId(null)}
        title="Delete Content Item"
        description="Are you sure you want to delete this coursework item? Submissions or quiz attempts linked to it will also be removed."
      >
        <div className="flex items-center justify-end gap-2 pt-4">
          <Button
            variant="outline"
            onClick={() => setDeleteId(null)}
            disabled={deleting}
            className="rounded-xl text-xs"
          >
            Cancel
          </Button>
          <Button
            variant="destructive"
            onClick={handleDelete}
            disabled={deleting}
            className="rounded-xl text-xs font-semibold"
          >
            {deleting ? "Deleting..." : "Delete Item"}
          </Button>
        </div>
      </ResponsiveDialog>
    </div>
  );
}
