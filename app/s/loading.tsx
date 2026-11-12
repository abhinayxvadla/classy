import { Skeleton } from "@/components/ui/skeleton";

export default function StudentLoading() {
  return (
    <div className="min-h-screen bg-bg text-ink flex flex-col justify-between">
      <main className="flex-1 w-full max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 pt-24 md:pt-[104px] pb-[calc(96px+env(safe-area-inset-bottom))] space-y-8 animate-in fade-in duration-300">
        {/* Welcome Banner Skeleton */}
        <div className="h-44 sm:h-48 rounded-3xl bg-surface border border-border/80 p-6 flex flex-col justify-between">
          <Skeleton className="h-6 w-36 rounded-full" />
          <div className="space-y-2">
            <Skeleton className="h-10 w-56 rounded-xl" />
            <Skeleton className="h-4 w-96 max-w-full rounded-md" />
          </div>
        </div>

        {/* Join Box Skeleton */}
        <div className="p-4 rounded-3xl bg-surface border border-border flex flex-col sm:flex-row gap-3">
          <Skeleton className="h-12 flex-1 rounded-2xl" />
          <Skeleton className="h-12 w-32 rounded-2xl" />
        </div>

        {/* Batches Grid Skeleton */}
        <div className="space-y-4">
          <Skeleton className="h-7 w-32 rounded-lg" />
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="p-5 rounded-2xl bg-surface border border-border space-y-3">
                <Skeleton className="h-5 w-40 rounded-md" />
                <Skeleton className="h-4 w-28 rounded-md" />
                <div className="pt-3 border-t border-border flex justify-between">
                  <Skeleton className="h-4 w-20 rounded-md" />
                  <Skeleton className="h-4 w-16 rounded-md" />
                </div>
              </div>
            ))}
          </div>
        </div>
      </main>
    </div>
  );
}
