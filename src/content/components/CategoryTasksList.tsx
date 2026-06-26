import { CheckCircle2, Circle, Inbox, Loader2 } from "lucide-react";
import type { Task } from "@/types/task";
import { TaskStatus, TaskType } from "@/types/task";

type CategoryTasksListProps = {
  tasks: Task[];
  isLoading: boolean;
  categoryName: string;
  categoryColor: string;
  emptyMessage?: string;
};

const TYPE_DOT_CLASS: Record<TaskType, string> = {
  [TaskType.Critical]: "bg-red-500",
  [TaskType.Normal]: "bg-amber-500",
};

export default function CategoryTasksList({
  tasks,
  isLoading,
  categoryName,
  categoryColor,
  emptyMessage = "No tasks in this category yet",
}: CategoryTasksListProps) {
  return (
    <div className="overflow-hidden rounded-lg border bg-white">
      <div className="flex items-center justify-between border-b px-3 py-2">
        <div className="flex items-center gap-2 text-xs font-semibold text-black">
          <span
            className="h-2 w-2 rounded-full"
            style={{ backgroundColor: categoryColor }}
          />
          <span>{categoryName}</span>
        </div>
        <span className="text-[11px] text-muted-foreground">
          {isLoading ? "Loading…" : `${tasks.length} ${tasks.length === 1 ? "task" : "tasks"}`}
        </span>
      </div>

      <div
      className="h-[200px] overflow-y-auto"
        style={{
          overscrollBehavior: "contain",
        }}
        onWheel={(e) => e.stopPropagation()}
      >
        {isLoading ? (
          <div className="flex items-center justify-center gap-2 px-3 py-4 text-xs text-muted-foreground">
            <Loader2 className="h-3 w-3 animate-spin" />
            <span>Fetching tasks…</span>
          </div>
        ) : tasks.length === 0 ? (
          <div className="flex flex-col items-center gap-1.5 px-3 py-5 text-center">
            <Inbox className="h-4 w-4 text-muted-foreground" />
            <p className="text-xs text-muted-foreground">{emptyMessage}</p>
          </div>
        ) : (
          [...tasks]
            .sort(
              (a, b) =>
                new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
            )
            .map((task) => {
            const isDone = task.status === TaskStatus.Done;
            return (
              <div
                key={task.id}
                className="flex items-start gap-2 border-b px-3 py-2 last:border-b-0"
              >
                {isDone ? (
                  <CheckCircle2 className="mt-0.5 h-3.5 w-3.5 shrink-0 text-emerald-500" />
                ) : (
                  <Circle className="mt-0.5 h-3.5 w-3.5 shrink-0 text-muted-foreground" />
                )}
                <p
                  className={`flex-1 text-xs leading-snug text-black ${
                    isDone ? "text-muted-foreground line-through" : ""
                  }`}
                >
                  {task.name}
                </p>
                <span
                  className={`mt-1 h-1.5 w-1.5 shrink-0 rounded-full ${TYPE_DOT_CLASS[task.type]}`}
                  aria-label={task.type}
                />
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
