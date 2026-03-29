import { createContext } from "react";
import type ApiError from "@/services/ApiError";
import type ApiResponse from "@/services/ApiResponse";
import type {
  Task,
  TaskAttachmentInput,
  TaskStatus,
  TaskType,
} from "@/types/task";

type TaskApiResult<T = unknown> = ApiResponse<T> | ApiError | unknown;

type TaskContextState = {
  tasks: Task[];
  isFetching: boolean;
  isCreating: boolean;
  updatingTaskId: string | null;
  deletingTaskId: string | null;
  isTaskMode: boolean;
  setIsTaskMode: (isTaskMode: boolean) => void;
  fetchTasksByCategory: (categoryId: string) => Promise<TaskApiResult<Task[]>>;
  createTask: (
    name: string,
    type: TaskType,
    status: TaskStatus,
    categoryId: string,
    attachments?: TaskAttachmentInput[],
  ) => Promise<TaskApiResult<Task>>;
  updateTask: (
    taskId: string,
    categoryId: string,
    updates: Partial<Pick<Task, "name" | "type" | "status">>,
  ) => Promise<TaskApiResult<Task>>;
  deleteTasks: (
    taskIds: string[],
    categoryId: string,
  ) => Promise<TaskApiResult<{ count: number }>>;
  handleTaskModeChange: (mode: "task" | "note") => Promise<boolean | void>;
};

export const TaskContext = createContext<TaskContextState | undefined>(
  undefined,
);
