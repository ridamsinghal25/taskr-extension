import { Skeleton } from "@/components/ui/skeleton";

const ROW_COUNT = 6;

function CategoryRowSkeleton() {
  return (
    <div className="relative rounded-lg px-3 py-3">
      <div className="flex items-center gap-2">
        <Skeleton className="h-1.5 w-1.5 shrink-0 rounded-full bg-white/10" />
        <Skeleton className="h-3.5 min-w-0 flex-1 max-w-[140px] bg-white/10" />
        <div className="flex shrink-0 gap-0.5">
          <Skeleton className="size-5 rounded-md bg-white/10" />
          <Skeleton className="size-5 rounded-md bg-white/10" />
        </div>
      </div>
      <div className="mt-1.5 flex items-center gap-2 pl-3.5">
        <Skeleton className="h-[2px] flex-1 rounded-full bg-white/10" />
        <Skeleton className="h-2.5 w-8 shrink-0 bg-white/10" />
      </div>
    </div>
  );
}

export default function CategoriesSkeleton() {
  return (
    <div className="flex flex-col gap-2">
      {Array.from({ length: ROW_COUNT }).map((_, i) => (
        <CategoryRowSkeleton key={i} />
      ))}
    </div>
  );
}
