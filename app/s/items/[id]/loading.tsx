import { Skeleton } from "@/components/ui/skeleton";

export default function ItemViewLoading() {
  return (
    <div className="min-h-screen bg-bg text-ink flex flex-col justify-between">
      <main className="flex-1 w-full max-w-4xl mx-auto px-4 sm:px-6 pt-24 md:pt-[104px] pb-[calc(96px+env(safe-area-inset-bottom))] space-y-6 animate-in fade-in duration-300">
        <Skeleton className="h-6 w-28 rounded-md" />

        <div className="p-6 sm:p-8 rounded-3xl bg-surface border border-border space-y-6">
          <div className="space-y-3">
            <div className="flex gap-2">
              <Skeleton className="h-6 w-20 rounded-full" />
              <Skeleton className="h-6 w-20 rounded-full" />
            </div>
            <Skeleton className="h-10 w-3/4 rounded-xl" />
            <Skeleton className="h-4 w-48 rounded-md" />
          </div>

          <div className="space-y-3 pt-4 border-t border-border">
            <Skeleton className="h-4 w-full rounded-md" />
            <Skeleton className="h-4 w-full rounded-md" />
            <Skeleton className="h-4 w-4/5 rounded-md" />
            <Skeleton className="h-28 w-full rounded-2xl" />
            <Skeleton className="h-4 w-2/3 rounded-md" />
          </div>
        </div>
      </main>
    </div>
  );
}
