import { FolderOpen } from "lucide-react";
import type { CSSProperties } from "react";
import { TasksSkeleton } from "@/components/task/TaskSkeleton";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import { TaskListPanel } from "@/components/task/TaskListPanel";
import { TaskComposerBar } from "@/components/task/TaskComposerBar";
type Props = {
  categoryId: string;
  categoryName: string;
  isTaskFetching: boolean;
  donePct: number;
  accentColor: string;
  onDeleteCategory: () => void;
};

export function Workspace({
  categoryId,
  categoryName,
  isTaskFetching,
  donePct,
  accentColor,
  onDeleteCategory,
}: Props) {
  if (isTaskFetching) {
    return <TasksSkeleton />;
  }

  if (!categoryId) {
    return (
      <div className="flex h-full w-full flex-col bg-[#09090f] text-zinc-300">
        <div className="flex h-full items-center justify-center px-4">
          <div className="flex w-full max-w-md flex-col items-center gap-3 rounded-2xl border border-white/6 bg-white/2 px-6 py-10 text-center">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl border border-white/10 bg-white/4 text-zinc-400">
              <FolderOpen className="h-6 w-6" aria-hidden />
            </div>
            <h2 className="text-base font-semibold text-zinc-100">
              Select a category
            </h2>
            <p className="text-xs text-zinc-500">
              Choose a category from the sidebar to load its tasks.
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-full w-full flex-col bg-[#09090f] text-zinc-300">
      <header className="shrink-0 border-b border-white/6 px-5 pt-5 pb-4">
        <div className="flex items-start justify-between gap-4">
          <h1 className="truncate text-2xl font-bold tracking-tight text-zinc-100">
            {categoryName || "—"}
          </h1>
          <div className="flex flex-col items-end gap-1">
            <span
              className="font-mono text-sm font-bold"
              style={{ color: accentColor }}
            >
              {donePct}%
            </span>
            <Button
              type="button"
              variant="link"
              onClick={onDeleteCategory}
              className="h-auto p-0 text-[10px] font-semibold tracking-wide text-red-500/70 hover:text-red-500 hover:no-underline"
            >
              delete category
            </Button>
          </div>
        </div>
        <Progress
          value={donePct}
          className="mt-3 h-1 bg-white/6"
          indicatorClassName="bg-[var(--workspace-accent)] transition-all duration-500"
          style={
            { "--workspace-accent": accentColor } as CSSProperties
          }
        />
      </header>

      <div className="flex min-h-0 flex-1 flex-col">
        <TaskListPanel />
      </div>

      <TaskComposerBar />
    </div>
  );
}
