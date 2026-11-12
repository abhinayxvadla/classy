import { Skeleton } from "@/components/ui/skeleton";

export default function BatchesLoading() {
  return (
    <div className="min-h-screen bg-bg text-ink flex flex-col justify-between">
      <main className="flex-1 w-full max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 pt-24 md:pt-[104px] pb-[calc(96px+env(safe-area-inset-bottom))] space-y-6 animate-in fade-in duration-300">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="space-y-2">
            <Skeleton className="h-8 w-44 rounded-xl" />
            <Skeleton className="h-4 w-60 rounded-md" />
          </div>
          <Skeleton className="h-10 w-32 rounded-xl" />
        </div>

        <Skeleton className="h-11 w-full rounded-2xl" />

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 pt-2">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div key={i} className="p-5 rounded-2xl bg-surface border border-border space-y-4">
              <Skeleton className="h-6 w-36 rounded-md" />
              <div className="flex gap-2">
                <Skeleton className="h-5 w-16 rounded-full" />
                <Skeleton className="h-5 w-16 rounded-full" />
              </div>
              <Skeleton className="h-10 w-full rounded-xl" />
            </div>
          ))}
        </div>
      </main>
    </div>
  );
}
