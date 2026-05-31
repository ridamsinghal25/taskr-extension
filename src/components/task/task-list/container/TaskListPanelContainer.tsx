import { useMemo, useState } from "react";
import { useParams } from "react-router-dom";
import { useTaskContext } from "@/context/TaskContext/TaskContextProvider";
import { sortTasksByCreatedAtDesc } from "@/lib/task/task.constants";
import { getCategoryColor } from "@/lib/utils";
import { TaskStatus, TaskType, type Task } from "@/types/task";
import {
  TaskListPanel,
  type TaskFilter,
} from "@/components/task/task-list/presentation/TaskListPanel";

export function TaskListPanelContainer() {
  const { categoryId } = useParams<{ categoryId?: string }>();

  const {
    tasks,
    updatingTaskId,
    deletingTaskId,
    updateTask,
    deleteTasks,
  } = useTaskContext();

  const [taskIdToDelete, setTaskIdToDelete] = useState<string | null>(null);
  const [filter, setFilter] = useState<TaskFilter>("all");

  const { counts, filteredTasks } = useMemo(() => {
    const visible = tasks.filter((t) => t.status !== TaskStatus.Archived);
    const done = visible.filter((t) => t.status === TaskStatus.Done).length;

    const counts = {
      all: visible.length,
      pending: visible.length - done,
      done,
    };

    let filtered = visible;
    if (filter === "done") {
      filtered = visible.filter((t) => t.status === TaskStatus.Done);
    } else if (filter === "pending") {
      filtered = visible.filter((t) => t.status !== TaskStatus.Done);
    }

    return {
      counts,
      filteredTasks: sortTasksByCreatedAtDesc(filtered),
    };
  }, [tasks, filter]);

  const accentColor = categoryId ? getCategoryColor(categoryId) : "#6366f1";

  const taskPendingDelete = useMemo(
    () =>
      taskIdToDelete ? tasks.find((t) => t.id === taskIdToDelete) : undefined,
    [taskIdToDelete, tasks],
  );

  const handleToggleDone = async (task: Task) => {
    if (!categoryId) return;
    const next =
      task.status === TaskStatus.Done ? TaskStatus.Pending : TaskStatus.Done;
    await updateTask(task.id, categoryId, { status: next });
  };

  const handleToggleType = async (task: Task) => {
    if (!categoryId) return;
    const next =
      task.type === TaskType.Critical ? TaskType.Normal : TaskType.Critical;
    await updateTask(task.id, categoryId, { type: next });
  };

  const handleConfirmDelete = async () => {
    if (!taskIdToDelete || !categoryId) return;
    await deleteTasks([taskIdToDelete], categoryId);
    setTaskIdToDelete(null);
  };

  return (
    <TaskListPanel
      tasks={filteredTasks}
      counts={counts}
      activeFilter={filter}
      accentColor={accentColor}
      updatingTaskId={updatingTaskId}
      deletingTaskId={deletingTaskId}
      onFilterChange={setFilter}
      onToggleDone={handleToggleDone}
      onToggleType={handleToggleType}
      onRequestDelete={setTaskIdToDelete}
      deleteDialogOpen={taskIdToDelete !== null}
      pendingDeleteName={taskPendingDelete?.name}
      onDeleteDialogOpenChange={(open) => {
        if (!open) setTaskIdToDelete(null);
      }}
      onConfirmDelete={handleConfirmDelete}
    />
  );
}
