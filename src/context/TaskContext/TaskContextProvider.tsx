import {
  useCallback,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";
import { toast } from "react-toastify";
import TaskService from "@/extension-services/task.services";
import { isApiResponse } from "@/lib/typeGuard";
import type { Task, TaskStatus, TaskType } from "@/types/task";
import ApiError from "@/services/ApiError";
import { TaskContext } from "./TaskContext";
import { useCategoryContext } from "../CategoryContext/CategoryContextProvider";

export function TaskProvider({ children }: { children: ReactNode }) {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [isFetching, setIsFetching] = useState(false);
  const [isCreating, setIsCreating] = useState(false);
  const [updatingTaskId, setUpdatingTaskId] = useState<string | null>(null);
  const [deletingTaskId, setDeletingTaskId] = useState<string | null>(null);
  const [isTaskMode, setIsTaskMode] = useState(true);

  const fetchTasksByCategory = useCallback(async (categoryId: string) => {
    setIsFetching(true);
    setTasks([]);
    try {
      const response =
        await TaskService.getTasksByCategoryId<Task[]>(categoryId);
      if (isApiResponse(response)) {
        setTasks(Array.isArray(response.data) ? response.data : []);
      } else {
        const err = response as ApiError;
        toast.error(
          err.errorResponse?.message ||
            err.errorMessage ||
            "Unable to fetch tasks",
        );
      }
    } catch (err) {
      toast.error((err as Error).message || "Unable to fetch tasks");
      setTasks([]);
    } finally {
      setIsFetching(false);
    }
  }, []);

  const { currentCategoryId } = useCategoryContext();

  useEffect(() => {
    if (currentCategoryId) {
      fetchTasksByCategory(currentCategoryId);
    } else {
      setTasks([]);
    }
  }, [currentCategoryId, fetchTasksByCategory]);

  const createTask = useCallback(
    async (
      name: string,
      type: TaskType,
      status: TaskStatus,
      categoryId: string,
    ) => {
      setIsCreating(true);
      try {
        const response = await TaskService.createTask<Task>(
          name,
          type,
          status,
          categoryId,
        );
        if (isApiResponse(response)) {
          setTasks((prev) => [...prev, response.data]);
          toast.success("Task created successfully");
        } else {
          const err = response as ApiError;
          toast.error(
            err.errorResponse?.message ||
              err.errorMessage ||
              "Unable to create task",
          );
        }
      } catch (err) {
        toast.error((err as Error).message || "Unable to create task");
      } finally {
        setIsCreating(false);
      }
    },
    [],
  );

  const updateTask = useCallback(
    async (
      taskId: string,
      categoryId: string,
      updates: Partial<Pick<Task, "name" | "type" | "status">>,
    ) => {
      setUpdatingTaskId(taskId);
      try {
        const response = await TaskService.updateTask<Task>(
          taskId,
          categoryId,
          updates,
        );
        if (isApiResponse(response)) {
          setTasks((prev) =>
            prev.map((task) => (task.id === taskId ? response.data : task)),
          );
          toast.success("Task updated successfully");
        } else {
          const err = response as ApiError;
          toast.error(
            err.errorResponse?.message ||
              err.errorMessage ||
              "Unable to update task",
          );
        }
      } catch (err) {
        toast.error((err as Error).message || "Unable to update task");
      } finally {
        setUpdatingTaskId(null);
      }
    },
    [],
  );

  const deleteTasks = useCallback(
    async (taskIds: string[], categoryId: string) => {
      const primaryDeletingId = taskIds[0] ?? null;
      setDeletingTaskId(primaryDeletingId);
      try {
        const deleteResp = await TaskService.deleteTasksFromCategory<{
          count: number;
        }>(taskIds, categoryId);
        if (isApiResponse(deleteResp)) {
          setTasks((prev) => prev.filter((task) => !taskIds.includes(task.id)));
          toast.success("Tasks deleted successfully");
        } else {
          const err = deleteResp as ApiError;
          toast.error(
            err.errorResponse?.message ||
              err.errorMessage ||
              "Unable to delete tasks",
          );
        }
      } catch (err) {
        toast.error((err as Error).message || "Unable to delete tasks");
      } finally {
        setDeletingTaskId(null);
      }
    },
    [],
  );

  const handleTaskModeChange = async (
    command: string,
  ): Promise<boolean | void> => {
    const token = command.trim().toLowerCase();

    if (token === "t" || token === "task") {
      setIsTaskMode(true);
      return true;
    }

    if (token === "n" || token === "note") {
      setIsTaskMode(false);
      return true;
    }
  };

  return (
    <TaskContext.Provider
      value={{
        tasks,
        isFetching,
        isCreating,
        updatingTaskId,
        deletingTaskId,
        isTaskMode,
        setIsTaskMode,
        fetchTasksByCategory,
        createTask,
        updateTask,
        deleteTasks,
        handleTaskModeChange,
      }}
    >
      {children}
    </TaskContext.Provider>
  );
}

export function useTaskContext() {
  const context = useContext(TaskContext);
  if (!context) {
    throw new Error("useTaskContext must be used within TaskProvider");
  }
  return context;
}
