import { StatusBadge } from "@/components/task/status-badge";
import { TypeBadge } from "@/components/task/type-badge";
import type { Task } from "@/types/task";
import {
  TASK_STATUS_OPTIONS,
  TASK_TYPE_OPTIONS,
} from "@/lib/task/task.constants";
import { format } from "date-fns";
import { Inbox, Loader2, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useTaskContext } from "@/context/TaskContext/TaskContextProvider";
import { useParams } from "react-router-dom";
import { ConfirmActionDialog } from "../dialog/ConfirmActionDialog";
import { useMemo, useState } from "react";

export function TaskListPanel() {
  const [taskIdToDelete, setTaskIdToDelete] = useState<string | null>(null);

  const { categoryId } = useParams<{ categoryId?: string }>();

  const {
    tasks,
    updatingTaskId,
    deletingTaskId,
    isFetching: isTaskFetching,
    updateTask,
    deleteTasks,
  } = useTaskContext();

  const taskPendingDelete = useMemo(
    () =>
      taskIdToDelete ? tasks.find((t) => t.id === taskIdToDelete) : undefined,
    [taskIdToDelete, tasks],
  );

  const handleUpdateTask = async (
    taskId: string,
    updates: Partial<Pick<Task, "status" | "type">>,
  ) => {
    if (!categoryId) return;
    await updateTask(taskId, categoryId, updates);
  };

  const handleDeleteTask = async (taskId: string) => {
    if (!categoryId) return;
    await deleteTasks([taskId], categoryId);
  };

  return (
    <div className="flex flex-col gap-3 p-3 md:p-4">
      {!isTaskFetching && tasks.length === 0 && (
        <div className="flex min-h-[60vh] items-center justify-center p-4 md:p-6">
          <div className="flex w-full max-w-md flex-col items-center justify-center">
            <div className="flex w-full flex-col items-center justify-center rounded-2xl border border-primary/20 bg-primary/5 px-6 py-8 text-center shadow-md shadow-primary/10 backdrop-blur-sm dark:bg-primary/10">
              <div
                className="mb-4 flex h-14 w-14 items-center justify-center rounded-2xl border border-primary/25 bg-primary/15 text-primary shadow-inner shadow-primary/10"
                aria-hidden
              >
                <Inbox className="h-7 w-7" />
              </div>

              <p className="text-base font-semibold tracking-tight text-foreground">
                No tasks yet
              </p>

              <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                Use the composer below to add a task (optional{" "}
                <span className="text-foreground/80">-t</span> and{" "}
                <span className="text-foreground/80">-s</span> flags). Type{" "}
                <span className="text-foreground/80">n</span> or{" "}
                <span className="text-foreground/80">note</span> and send to
                switch to notes.
              </p>
            </div>
          </div>
        </div>
      )}

      {tasks.map((task) => {
        const isUpdatingThis = updatingTaskId === task.id;
        const isDeletingThis = deletingTaskId === task.id;
        const isRowBusy = isUpdatingThis || isDeletingThis;

        return (
          <div key={task.id} className="mb-6 flex justify-end">
            <div className="w-full max-w-md">
              <div
                className={`mb-2 flex flex-wrap justify-end gap-2 ${isRowBusy ? "pointer-events-none opacity-50" : ""}`}
              >
                {TASK_STATUS_OPTIONS.map((opt) => (
                  <div
                    key={opt}
                    role="button"
                    onClick={() =>
                      !isRowBusy && handleUpdateTask(task.id, { status: opt })
                    }
                  >
                    <StatusBadge
                      status={opt}
                      size="sm"
                      isSelected={opt === task.status}
                    />
                  </div>
                ))}
              </div>

              <div
                className={`flex items-center gap-3 rounded-2xl bg-primary/80 px-4 py-3 text-primary-foreground shadow-md transition ${isRowBusy ? "opacity-90" : "hover:shadow-lg"}`}
                aria-busy={isRowBusy}
              >
                <div className="min-w-0 flex-1">
                  <p className="wrap-break-word text-sm">{task.name}</p>
                  <p className="mt-1 text-xs opacity-80">
                    {format(new Date(task.createdAt), "EEE, MMM d")}
                  </p>
                  {isUpdatingThis && (
                    <p className="mt-2 flex items-center gap-1.5 text-xs opacity-90">
                      <Loader2
                        className="shrink-0 animate-spin"
                        size={14}
                        aria-hidden
                      />
                      <span>Updating task…</span>
                    </p>
                  )}
                  {isDeletingThis && (
                    <p className="mt-2 flex items-center gap-1.5 text-xs opacity-90">
                      <Loader2
                        className="shrink-0 animate-spin"
                        size={14}
                        aria-hidden
                      />
                      <span>Deleting task…</span>
                    </p>
                  )}
                </div>

                <Button
                  variant="ghost"
                  type="button"
                  disabled={isRowBusy}
                  onClick={() => setTaskIdToDelete(task.id)}
                  className="shrink-0 cursor-pointer text-red-600 hover:text-red-500 disabled:pointer-events-none disabled:opacity-40"
                >
                  <Trash2 size={16} />
                </Button>
              </div>

              <div
                className={`mt-2 flex justify-end gap-2 ${isRowBusy ? "pointer-events-none opacity-50" : ""}`}
              >
                {TASK_TYPE_OPTIONS.map((opt) => (
                  <div
                    key={opt}
                    role="button"
                    onClick={() =>
                      !isRowBusy && handleUpdateTask(task.id, { type: opt })
                    }
                  >
                    <TypeBadge
                      type={opt}
                      size="sm"
                      isSelected={opt === task.type}
                    />
                  </div>
                ))}
              </div>
            </div>
          </div>
        );
      })}

      <ConfirmActionDialog
        open={taskIdToDelete !== null}
        onOpenChange={(open) => {
          if (!open) setTaskIdToDelete(null);
        }}
        title="Delete this task?"
        description={
          taskPendingDelete ? (
            <>
              <span className="font-medium text-foreground">
                {taskPendingDelete.name}
              </span>{" "}
              will be removed permanently. This cannot be undone.
            </>
          ) : null
        }
        onConfirm={async () => {
          if (taskIdToDelete) {
            await handleDeleteTask(taskIdToDelete);
          }
        }}
      />
    </div>
  );
}
