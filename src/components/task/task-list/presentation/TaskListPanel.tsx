import { Inbox, Loader2, Trash2 } from "lucide-react";
import { format } from "date-fns";
import type { CSSProperties } from "react";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { cn } from "@/lib/utils";
import { ConfirmActionDialog } from "@/components/dialog/ConfirmActionDialog";
import type { Task } from "@/types/task";
import { TaskType } from "@/types/task";

export type TaskFilter = "all" | "pending" | "done";

export type TaskListPanelProps = {
  tasks: Task[];
  counts: { all: number; pending: number; done: number };
  activeFilter: TaskFilter;
  accentColor: string;
  updatingTaskId: string | null;
  deletingTaskId: string | null;
  onFilterChange: (filter: TaskFilter) => void;
  onToggleDone: (task: Task) => void;
  onToggleType: (task: Task) => void;
  onRequestDelete: (taskId: string) => void;
  deleteDialogOpen: boolean;
  pendingDeleteName: string | undefined;
  onDeleteDialogOpenChange: (open: boolean) => void;
  onConfirmDelete: () => Promise<void>;
};

const FILTER_TABS: { value: TaskFilter; label: string }[] = [
  { value: "all", label: "All" },
  { value: "pending", label: "Pending" },
  { value: "done", label: "Done" },
];

const TYPE_STYLES: Record<
  TaskType,
  { label: string; badgeClass: string; borderClass: string }
> = {
  [TaskType.Critical]: {
    label: "HIGH",
    badgeClass: "bg-red-500/15 text-red-400 hover:bg-red-500/25",
    borderClass: "border-l-red-500",
  },
  [TaskType.Normal]: {
    label: "MED",
    badgeClass: "bg-amber-500/15 text-amber-400 hover:bg-amber-500/25",
    borderClass: "border-l-amber-500",
  },
};

export function TaskListPanel({
  tasks,
  counts,
  activeFilter,
  accentColor,
  updatingTaskId,
  deletingTaskId,
  onFilterChange,
  onToggleDone,
  onToggleType,
  onRequestDelete,
  deleteDialogOpen,
  pendingDeleteName,
  onDeleteDialogOpenChange,
  onConfirmDelete,
}: TaskListPanelProps) {
  return (
    <div
      className="flex h-full min-h-0 flex-col"
      style={{ "--task-accent": accentColor } as CSSProperties}
    >
      <div className="shrink-0 px-4 pt-3 pb-2">
        <Tabs
          value={activeFilter}
          onValueChange={(v) => onFilterChange(v as TaskFilter)}
        >
          <TabsList className="h-auto gap-1 bg-transparent p-0">
            {FILTER_TABS.map((tab) => (
              <TabsTrigger
                key={tab.value}
                value={tab.value}
                className={cn(
                  "h-7 rounded-full border border-transparent bg-white/4 px-3 text-xs font-semibold text-zinc-500",
                  "data-[state=active]:border-white/15 data-[state=active]:bg-white/10 data-[state=active]:text-zinc-100 data-[state=active]:shadow-none",
                  "hover:text-zinc-300",
                )}
              >
                {tab.label} ({counts[tab.value]})
              </TabsTrigger>
            ))}
          </TabsList>
        </Tabs>
      </div>

      <div className="flex flex-1 flex-col gap-2 overflow-y-auto px-3 pb-3">
        {tasks.length === 0 ? (
          <div className="flex flex-1 items-center justify-center px-4">
            <div className="flex w-full max-w-sm flex-col items-center gap-2 rounded-2xl border border-white/6 bg-white/2 px-6 py-10 text-center">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl border border-white/10 bg-white/4">
                <Inbox className="h-5 w-5 text-zinc-500" aria-hidden />
              </div>
              <p className="text-sm font-semibold text-zinc-300">
                {activeFilter === "done"
                  ? "Nothing done yet"
                  : activeFilter === "pending"
                    ? "All caught up!"
                    : "No tasks yet"}
              </p>
              <p className="text-xs text-zinc-600">
                {activeFilter === "all"
                  ? "Add your first task below"
                  : "Switch filter to see other tasks"}
              </p>
            </div>
          </div>
        ) : (
          tasks.map((task) => {
            const isUpdatingThis = updatingTaskId === task.id;
            const isDeletingThis = deletingTaskId === task.id;
            const isRowBusy = isUpdatingThis || isDeletingThis;
            const isDone = task.status === "done";
            const typeStyle = TYPE_STYLES[task.type];

            return (
              <div
                key={task.id}
                className={cn(
                  "group/task relative rounded-xl border border-l-2 border-white/6 bg-white/3 px-3 py-2.5 transition",
                  "hover:border-white/10 hover:bg-white/5",
                  typeStyle.borderClass,
                  isDone && "opacity-50",
                  isRowBusy && "pointer-events-none opacity-60",
                )}
              >
                <div className="flex items-start gap-3">
                  <Checkbox
                    checked={isDone}
                    onCheckedChange={() => onToggleDone(task)}
                    disabled={isRowBusy}
                    aria-label={isDone ? "Mark pending" : "Mark done"}
                    className={cn(
                      "mt-0.5 size-5 rounded-md border-white/20 bg-transparent",
                      "data-[state=checked]:border-transparent data-[state=checked]:bg-(--task-accent) data-[state=checked]:text-white",
                    )}
                  />

                  <div className="min-w-0 flex-1">
                    <p
                      className={cn(
                        "font-mono text-xs leading-relaxed wrap-break-word whitespace-pre-wrap",
                        isDone
                          ? "text-zinc-600 line-through"
                          : "text-zinc-200",
                      )}
                    >
                      {task.name}
                    </p>
                    {task.attachments?.length > 0 && (
                      <div className="mt-2 flex gap-2 overflow-x-auto">
                        {task.attachments.map((attachment) => (
                          <img
                            key={attachment.url}
                            src={attachment.url}
                            alt="attachment"
                            className="h-20 w-20 shrink-0 rounded-md border border-white/5 object-cover"
                          />
                        ))}
                      </div>
                    )}
                    <p className="mt-1 font-mono text-[10px] text-zinc-600">
                      {format(new Date(task.createdAt), "EEE, MMM d")}
                    </p>
                    {(isUpdatingThis || isDeletingThis) && (
                      <p className="mt-1 flex items-center gap-1 text-[10px] text-zinc-500">
                        <Loader2 className="h-3 w-3 animate-spin" aria-hidden />
                        {isDeletingThis ? "Deleting…" : "Updating…"}
                      </p>
                    )}
                  </div>

                  <button
                    type="button"
                    onClick={() => onToggleType(task)}
                    disabled={isRowBusy}
                    aria-label={`Priority ${typeStyle.label}, click to change`}
                    className={cn(
                      "mt-0.5 shrink-0 rounded-md px-2 py-1 font-mono text-[10px] font-bold tracking-wider transition",
                      typeStyle.badgeClass,
                    )}
                  >
                    {typeStyle.label}
                  </button>

                  <div className="mt-0.5 flex shrink-0 items-center opacity-0 transition group-hover/task:opacity-100">
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon-xs"
                      className="size-6 text-zinc-500 hover:bg-red-500/15 hover:text-red-500"
                      disabled={isRowBusy}
                      onClick={() => onRequestDelete(task.id)}
                      aria-label="Delete task"
                    >
                      <Trash2 className="size-3.5" />
                    </Button>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>

      <ConfirmActionDialog
        open={deleteDialogOpen}
        onOpenChange={onDeleteDialogOpenChange}
        title="Delete this task?"
        description={
          pendingDeleteName ? (
            <>
              <span className="font-medium text-foreground">
                {pendingDeleteName}
              </span>{" "}
              will be removed permanently. This cannot be undone.
            </>
          ) : null
        }
        onConfirm={onConfirmDelete}
      />
    </div>
  );
}
