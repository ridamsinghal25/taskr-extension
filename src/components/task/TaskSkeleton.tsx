import { Skeleton } from "@/components/ui/skeleton";

const TASK_ROW_COUNT = 5;

function TaskRowSkeleton() {
  return (
    <div className="rounded-xl border border-l-2 border-white/6 bg-white/3 px-3 py-2.5">
      <div className="flex items-start gap-3">
        <Skeleton className="mt-0.5 size-5 shrink-0 rounded-md bg-white/10" />
        <div className="min-w-0 flex-1 space-y-2">
          <Skeleton className="h-3 w-full max-w-[280px] bg-white/10" />
          <Skeleton className="h-3 w-4/5 max-w-[220px] bg-white/10" />
          <Skeleton className="h-2.5 w-24 bg-white/10" />
        </div>
        <Skeleton className="mt-0.5 h-6 w-10 shrink-0 rounded-md bg-white/10" />
        <div className="mt-0.5 flex shrink-0 gap-0.5">
          <Skeleton className="size-6 rounded-md bg-white/10" />
          <Skeleton className="size-6 rounded-md bg-white/10" />
        </div>
      </div>
    </div>
  );
}

export function TasksSkeleton() {
  return (
    <div className="flex h-full w-full flex-col bg-[#09090f] text-zinc-300">
      <header className="shrink-0 border-b border-white/6 px-5 pt-5 pb-4">
        <div className="flex items-start justify-between gap-4">
          <Skeleton className="h-8 w-48 max-w-[60%] bg-white/10" />
          <div className="flex flex-col items-end gap-2">
            <Skeleton className="h-4 w-10 bg-white/10" />
            <Skeleton className="h-3 w-24 bg-white/10" />
          </div>
        </div>
        <Skeleton className="mt-3 h-1 w-full rounded-full bg-white/10" />
      </header>

      <div className="flex min-h-0 flex-1 flex-col">
        <div className="flex h-full min-h-0 flex-col">
          <div className="shrink-0 px-4 pt-3 pb-2">
            <div className="flex gap-1">
              <Skeleton className="h-7 w-[72px] rounded-full bg-white/10" />
              <Skeleton className="h-7 w-[88px] rounded-full bg-white/10" />
              <Skeleton className="h-7 w-[64px] rounded-full bg-white/10" />
            </div>
          </div>

          <div className="flex flex-1 flex-col gap-2 overflow-hidden px-3 pb-3">
            {Array.from({ length: TASK_ROW_COUNT }).map((_, i) => (
              <TaskRowSkeleton key={i} />
            ))}
          </div>
        </div>
      </div>

      <div className="shrink-0 border-t border-white/6 bg-[#09090f] px-4 py-3">
        <div className="flex flex-col gap-2">
          <div className="flex items-start gap-2">
            <Skeleton className="min-h-10 flex-1 rounded-lg bg-white/10" />
            <Skeleton className="h-10 w-[72px] shrink-0 rounded-lg bg-white/10" />
          </div>
          <div className="flex items-center gap-2 pl-1">
            <Skeleton className="h-3 w-14 bg-white/10" />
            <Skeleton className="h-6 w-16 rounded-full bg-white/10" />
            <Skeleton className="h-6 w-[72px] rounded-full bg-white/10" />
          </div>
        </div>
      </div>
    </div>
  );
}
