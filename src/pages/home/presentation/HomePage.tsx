import type { CSSProperties } from "react";
import { ArrowRight, LayoutGrid, Loader2, Search } from "lucide-react";
import { Link } from "react-router-dom";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import {
  ToggleGroup,
  ToggleGroupItem,
} from "@/components/ui/toggle-group";
import { cn } from "@/lib/utils";
import { TaskStatus, type Task } from "@/types/task";

export type HomeCategoryItem = {
  id: string;
  name: string;
  color: string;
  initials: string;
};

export type HomeGroup = {
  label: "Today" | "Yesterday" | "Earlier";
  items: Task[];
};

export type HomeStats = {
  total: number;
  inProgress: number;
  pending: number;
  done: number;
};

export type HomePageProps = {
  isFetching: boolean;
  stats: HomeStats;
  categories: HomeCategoryItem[];
  categoryCounts: Record<string, number>;
  groups: HomeGroup[];
  totalShown: number;
  totalCategories: number;
  search: string;
  onSearchChange: (value: string) => void;
  statusFilter: "all" | TaskStatus;
  onStatusFilterChange: (value: "all" | TaskStatus) => void;
  categoryFilter: "all" | string;
  onCategoryFilterChange: (value: "all" | string) => void;
  updatingTaskId: string | null;
  onToggleDone: (task: Task) => void;
  getCategoryById: (id: string) => HomeCategoryItem | undefined;
};

const STATUS_FILTERS: { value: "all" | TaskStatus; label: string }[] = [
  { value: "all", label: "All" },
  { value: TaskStatus.Pending, label: "Pending" },
  { value: TaskStatus.InProgress, label: "In Progress" },
  { value: TaskStatus.Done, label: "Done" },
];

const STATUS_BADGE: Record<TaskStatus, { label: string; className: string }> = {
  [TaskStatus.Pending]: {
    label: "Pending",
    className: "bg-amber-500/12 text-amber-400",
  },
  [TaskStatus.InProgress]: {
    label: "In Progress",
    className: "bg-blue-500/15 text-blue-400",
  },
  [TaskStatus.Done]: {
    label: "Done",
    className: "bg-emerald-500/12 text-emerald-400",
  },
  [TaskStatus.Archived]: {
    label: "Archived",
    className: "bg-zinc-700/40 text-zinc-500",
  },
};

const STAT_GRADIENTS = {
  total: "linear-gradient(90deg, #6366f1, #8B5CF6)",
  inProgress: "linear-gradient(90deg, #3b82f6, #60a5fa)",
  pending: "linear-gradient(90deg, #d97706, #F59E0B)",
  done: "linear-gradient(90deg, #059669, #10B981)",
};

function ago(ts: number): string {
  const diff = Date.now() - ts;
  const m = Math.floor(diff / 60_000);
  if (m < 1) return "just now";
  if (m < 60) return `${m}m ago`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}h ago`;
  return `${Math.floor(h / 24)}d ago`;
}

function StatCard({
  label,
  value,
  sub,
  gradient,
}: {
  label: string;
  value: number;
  sub: string;
  gradient: string;
}) {
  return (
    <div
      className="relative overflow-hidden rounded-xl border border-zinc-800 bg-[#0d0d18] p-4"
      style={{ "--stat-gradient": gradient } as CSSProperties}
    >
      <p className="font-mono text-[10px] font-bold tracking-widest text-zinc-700 uppercase">
        {label}
      </p>
      <p className="mt-2 text-2xl leading-none font-bold tracking-tighter text-zinc-100">
        {value}
      </p>
      <p className="mt-1 font-mono text-[10px] text-zinc-700">{sub}</p>
      <span
        aria-hidden
        className="absolute right-0 bottom-0 left-0 h-[2px] opacity-60"
        style={{ background: "var(--stat-gradient)" }}
      />
    </div>
  );
}

export function HomePage({
  isFetching,
  stats,
  categories,
  categoryCounts,
  groups,
  totalShown,
  totalCategories,
  search,
  onSearchChange,
  statusFilter,
  onStatusFilterChange,
  categoryFilter,
  onCategoryFilterChange,
  updatingTaskId,
  onToggleDone,
  getCategoryById,
}: HomePageProps) {
  return (
    <div className="flex min-h-screen w-full flex-col bg-[#080810] text-zinc-300">
      <nav className="sticky top-0 z-20 flex items-center justify-between border-b border-white/5 bg-[#070709]/90 px-6 py-3 backdrop-blur md:px-10">
        <div className="flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg border border-zinc-700 bg-white/6">
            <LayoutGrid className="h-4 w-4 text-zinc-400" aria-hidden />
          </div>
          <span className="text-base font-bold tracking-tight text-zinc-100">
            Taskr
          </span>
        </div>
        <Button
          asChild
          variant="outline"
          size="sm"
          className="rounded-full border-zinc-700 bg-white/5 text-xs font-medium text-zinc-300 hover:bg-white/9 hover:text-zinc-100"
        >
          <Link to="/workspace">
            Open workspace
            <ArrowRight className="ml-1 h-3 w-3" aria-hidden />
          </Link>
        </Button>
      </nav>

      <main className="mx-auto w-full max-w-4xl flex-1 px-6 pt-8 pb-16">
        <header className="mb-6">
          <h1 className="text-2xl font-bold tracking-tight text-zinc-100">
            Recently Updated
          </h1>
          <p className="mt-1 text-xs text-zinc-500">
            from the last 4 days · {stats.total} tasks across{" "}
            {totalCategories} {totalCategories === 1 ? "category" : "categories"}
          </p>
        </header>

        <div className="mb-6 grid grid-cols-2 gap-3 sm:grid-cols-4">
          <StatCard
            label="Total Tasks"
            value={stats.total}
            sub="across all categories"
            gradient={STAT_GRADIENTS.total}
          />
          <StatCard
            label="In Progress"
            value={stats.inProgress}
            sub="actively being worked"
            gradient={STAT_GRADIENTS.inProgress}
          />
          <StatCard
            label="Pending"
            value={stats.pending}
            sub="waiting to be started"
            gradient={STAT_GRADIENTS.pending}
          />
          <StatCard
            label="Completed"
            value={stats.done}
            sub="marked as done"
            gradient={STAT_GRADIENTS.done}
          />
        </div>

        <div className="mb-4 flex flex-wrap items-center gap-3">
          <div className="relative min-w-[180px] flex-1">
            <Search
              className="pointer-events-none absolute top-1/2 left-3 h-3.5 w-3.5 -translate-y-1/2 text-zinc-700"
              aria-hidden
            />
            <Input
              placeholder="Search tasks…"
              value={search}
              onChange={(e) => onSearchChange(e.target.value)}
              className="h-9 rounded-lg border-zinc-800 bg-[#0d0d18] pl-9 font-mono text-xs text-zinc-100 placeholder:text-zinc-700 focus-visible:border-white/20 focus-visible:ring-0"
            />
          </div>

          <ToggleGroup
            type="single"
            value={statusFilter}
            onValueChange={(v) =>
              v && onStatusFilterChange(v as "all" | TaskStatus)
            }
            className="gap-1.5"
          >
            {STATUS_FILTERS.map((f) => (
              <ToggleGroupItem
                key={f.value}
                value={f.value}
                aria-label={f.label}
                className={cn(
                  "h-7 rounded-full border border-white/7 bg-[#0d0d18] px-3 text-xs font-medium text-zinc-600",
                  "hover:bg-white/6 hover:text-zinc-300",
                  "data-[state=on]:border-white/15 data-[state=on]:bg-white/8 data-[state=on]:text-zinc-100",
                )}
              >
                {f.label}
              </ToggleGroupItem>
            ))}
          </ToggleGroup>
        </div>

        <div className="mb-6 flex gap-2 overflow-x-auto pb-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
          <button
            type="button"
            onClick={() => onCategoryFilterChange("all")}
            className={cn(
              "flex shrink-0 items-center gap-1.5 rounded-full border px-3 py-1.5 text-xs font-medium transition",
              categoryFilter === "all"
                ? "border-white/15 bg-white/8 text-zinc-100"
                : "border-white/7 bg-[#0d0d18] text-zinc-500 hover:text-zinc-300",
            )}
          >
            All
            <span className="rounded bg-white/7 px-1.5 py-0.5 font-mono text-[10px] text-zinc-500">
              {stats.total}
            </span>
          </button>

          {categories.map((c) => {
            const isActive = categoryFilter === c.id;
            return (
              <button
                key={c.id}
                type="button"
                onClick={() =>
                  onCategoryFilterChange(isActive ? "all" : c.id)
                }
                className={cn(
                  "flex shrink-0 items-center gap-1.5 rounded-full border px-3 py-1.5 text-xs font-medium transition",
                  isActive
                    ? "border-white/15 bg-white/8 text-zinc-100"
                    : "border-white/7 bg-[#0d0d18] text-zinc-500 hover:text-zinc-300",
                )}
              >
                <span
                  className="h-1.5 w-1.5 shrink-0 rounded-full"
                  style={{ background: c.color }}
                />
                {c.name}
                <span className="rounded bg-white/7 px-1.5 py-0.5 font-mono text-[10px] text-zinc-500">
                  {categoryCounts[c.id] ?? 0}
                </span>
              </button>
            );
          })}
        </div>

        {isFetching ? (
          <div className="flex items-center justify-center py-16 text-zinc-600">
            <Loader2 className="h-5 w-5 animate-spin" aria-hidden />
          </div>
        ) : totalShown === 0 ? (
          <div className="flex flex-col items-center justify-center gap-2 py-16">
            <p className="text-4xl opacity-10" aria-hidden>
              ◎
            </p>
            <p className="text-sm font-semibold text-zinc-700">
              No tasks found
            </p>
            <p className="text-xs text-zinc-800">
              Try adjusting your search or filters
            </p>
          </div>
        ) : (
          <div>
            {groups.map((group) => (
              <section key={group.label}>
                <div className="sticky top-[54px] z-10 flex items-center gap-3 bg-[#080810] pt-4 pb-3">
                  <span className="font-mono text-[10px] font-bold tracking-widest whitespace-nowrap text-zinc-700 uppercase">
                    {group.label}
                  </span>
                  <div className="h-px flex-1 bg-white/4" />
                  <span className="font-mono text-[10px] whitespace-nowrap text-zinc-800">
                    {group.items.length} task
                    {group.items.length !== 1 ? "s" : ""}
                  </span>
                </div>

                {group.items.map((task) => {
                  const cat = getCategoryById(task.categoryId);
                  const isDone = task.status === TaskStatus.Done;
                  const badge =
                    STATUS_BADGE[task.status] ??
                    STATUS_BADGE[TaskStatus.Pending];
                  const isUpdating = updatingTaskId === task.id;
                  const accent = cat?.color ?? "#6366f1";
                  const ts =
                    task.updatedAt instanceof Date
                      ? task.updatedAt.getTime()
                      : new Date(task.updatedAt).getTime();

                  return (
                    <div
                      key={task.id}
                      className={cn(
                        "group/row relative flex items-center gap-3 border-b border-white/3 px-4 py-3 transition",
                        "hover:bg-white/3",
                        isDone && "opacity-50",
                        isUpdating && "pointer-events-none opacity-60",
                      )}
                      style={
                        { "--row-accent": accent } as CSSProperties
                      }
                    >
                      <span
                        aria-hidden
                        className="absolute top-0 bottom-0 left-0 w-[2.5px] rounded-r-sm opacity-0 transition-opacity group-hover/row:opacity-70"
                        style={{ background: "var(--row-accent)" }}
                      />

                      <Avatar className="size-8 rounded-lg">
                        <AvatarFallback
                          className="rounded-lg text-[11px] font-bold tracking-wide text-white/90"
                          style={{
                            background: `linear-gradient(135deg, ${accent}, color-mix(in srgb, ${accent} 60%, white))`,
                          }}
                        >
                          {cat?.initials ?? "•"}
                        </AvatarFallback>
                      </Avatar>

                      <Checkbox
                        checked={isDone}
                        onCheckedChange={() => onToggleDone(task)}
                        disabled={isUpdating}
                        aria-label={isDone ? "Mark pending" : "Mark done"}
                        className={cn(
                          "size-5 shrink-0 rounded-full border-white/15 bg-transparent",
                          "data-[state=checked]:border-transparent data-[state=checked]:bg-(--row-accent) data-[state=checked]:text-white",
                        )}
                      />

                      <div className="min-w-0 flex-1">
                        <p
                          className={cn(
                            "truncate font-mono text-sm",
                            isDone
                              ? "text-zinc-700 line-through"
                              : "text-zinc-200",
                          )}
                        >
                          {task.name}
                        </p>
                        <p className="mt-0.5 text-[11px] font-medium text-zinc-700">
                          {cat?.name ?? "Uncategorized"}
                        </p>
                      </div>

                      <div className="flex shrink-0 items-center gap-2">
                        <span
                          className={cn(
                            "rounded-full px-2 py-0.5 text-[10px] font-semibold whitespace-nowrap",
                            badge.className,
                          )}
                        >
                          {badge.label}
                        </span>
                        <span className="min-w-[44px] text-right font-mono text-[10px] whitespace-nowrap text-zinc-800">
                          {ago(ts)}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </section>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
