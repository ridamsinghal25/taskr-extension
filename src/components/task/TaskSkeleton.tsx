import { Skeleton } from "@/components/ui/skeleton";

export function TasksSkeleton() {
  return (
    <div className="flex h-full w-full bg-background overflow-hidden">
      <div className="flex-1 flex flex-col relative">
        {/* Header */}
        <div className="flex items-center gap-3 border-b border-border bg-card p-4">
          <Skeleton className="h-10 w-10 rounded-md" />

          <div className="flex flex-col gap-2">
            <Skeleton className="h-4 w-32" />
            <Skeleton className="h-3 w-20" />
          </div>
        </div>

        {/* Task list */}
        <div className="flex-1 p-3 md:p-4 flex flex-col gap-10">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="flex justify-end">
              <div className="max-w-md w-full flex flex-col gap-2">
                {/* Status badges */}
                <div className="flex gap-2 justify-end">
                  {[...Array(4)].map((_, j) => (
                    <Skeleton key={j} className="h-6 w-20 rounded-full" />
                  ))}
                </div>

                {/* Task bubble */}
                <div className="rounded-2xl px-4 py-3 flex items-center gap-3 bg-muted">
                  <div className="flex-1 space-y-2">
                    <Skeleton className="h-4 w-full" />
                    <Skeleton className="h-3 w-24" />
                  </div>

                  <Skeleton className="h-4 w-4 rounded" />
                </div>

                {/* Type badges */}
                <div className="flex gap-2 justify-end">
                  {[...Array(2)].map((_, j) => (
                    <Skeleton key={j} className="h-6 w-20 rounded-full" />
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Input bar */}
        <div className="border-t border-border bg-card px-4 py-3">
          <div className="flex gap-2 items-center">
            <Skeleton className="h-10 flex-1 rounded-lg" />
            <Skeleton className="h-10 w-16 rounded-lg" />
          </div>
        </div>
      </div>
    </div>
  );
}
