import { Skeleton } from "@/components/ui/skeleton";

export default function TutorLoading() {
  return (
    <div className="min-h-screen bg-bg text-ink flex flex-col justify-between">
      <main className="flex-1 w-full max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 pt-24 md:pt-[104px] pb-[calc(96px+env(safe-area-inset-bottom))] space-y-8 animate-in fade-in duration-300">
        {/* Banner Skeleton */}
        <div className="h-44 sm:h-48 rounded-3xl bg-surface border border-border/80 p-6 flex flex-col justify-between">
          <Skeleton className="h-6 w-32 rounded-full" />
          <div className="space-y-2">
            <Skeleton className="h-10 w-64 rounded-xl" />
            <Skeleton className="h-4 w-96 max-w-full rounded-md" />
          </div>
        </div>

        {/* Stat Cards Skeleton (5 cards) */}
        <div className="grid grid-cols-2 lg:grid-cols-5 gap-3 sm:gap-4">
          {[1, 2, 3, 4, 5].map((i) => (
            <div key={i} className="p-4 rounded-2xl bg-surface border border-border space-y-3">
              <Skeleton className="h-4 w-20 rounded-md" />
              <Skeleton className="h-8 w-14 rounded-lg" />
            </div>
          ))}
        </div>

        {/* Batches Header Skeleton */}
        <div className="flex items-center justify-between pt-2">
          <Skeleton className="h-8 w-36 rounded-xl" />
          <Skeleton className="h-10 w-28 rounded-xl" />
        </div>

        {/* Batches Grid Skeleton */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="p-5 rounded-2xl bg-surface border border-border space-y-4">
              <div className="flex justify-between items-start">
                <Skeleton className="h-5 w-40 rounded-md" />
                <Skeleton className="h-5 w-16 rounded-full" />
              </div>
              <Skeleton className="h-4 w-48 rounded-md" />
              <div className="pt-2 border-t border-border flex justify-between items-center">
                <Skeleton className="h-6 w-20 rounded-md" />
                <Skeleton className="h-8 w-8 rounded-lg" />
              </div>
            </div>
          ))}
        </div>
      </main>
    </div>
  );
}
