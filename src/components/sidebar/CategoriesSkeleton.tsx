import { Skeleton } from "@/components/ui/skeleton";

export default function CategoriesSkeleton() {
  return (
    <div className="flex flex-col gap-2">
      {Array.from({ length: 6 }).map((_, i) => (
        <div
          key={i}
          className="flex items-center gap-2 rounded-xl border border-primary/15 bg-primary/5 px-2 py-2 shadow-sm shadow-primary/5"
        >
          <Skeleton className="h-9 w-9 shrink-0 rounded-lg" />
          <div className="min-w-0 flex-1 space-y-2 py-0.5">
            <Skeleton className="h-3.5 w-3/4 max-w-[140px]" />
          </div>
          <Skeleton className="h-8 w-16 shrink-0 rounded-md" />
        </div>
      ))}
    </div>
  );
}
