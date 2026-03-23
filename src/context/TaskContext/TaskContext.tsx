import { createContext } from "react";
import type { Task, TaskStatus, TaskType } from "@/types/task";

type TaskContextState = {
  tasks: Task[];
  isFetching: boolean;
  isCreating: boolean;
  updatingTaskId: string | null;
  deletingTaskId: string | null;
  isTaskMode: boolean;
  setIsTaskMode: (isTaskMode: boolean) => void;
  fetchTasksByCategory: (categoryId: string) => Promise<void>;
  createTask: (
    name: string,
    type: TaskType,
    status: TaskStatus,
    categoryId: string,
  ) => Promise<void>;
  updateTask: (
    taskId: string,
    categoryId: string,
    updates: Partial<Pick<Task, "name" | "type" | "status">>,
  ) => Promise<void>;
  deleteTasks: (taskIds: string[], categoryId: string) => Promise<void>;
  handleTaskModeChange: (mode: "task" | "note") => Promise<boolean | void>;
};

export const TaskContext = createContext<TaskContextState | undefined>(
  undefined,
);
