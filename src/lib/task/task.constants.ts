import { TaskStatus, TaskType } from "@/types/task";

/** Task types in UI / CLI order */
export const TASK_TYPE_OPTIONS: TaskType[] = [
  TaskType.Normal,
  TaskType.Critical,
];

/** Task statuses in UI / CLI order */
export const TASK_STATUS_OPTIONS: TaskStatus[] = [
  TaskStatus.Pending,
  TaskStatus.InProgress,
  TaskStatus.Done,
  TaskStatus.Archived,
];

export function isTaskTypeValue(value: string): value is TaskType {
  return TASK_TYPE_OPTIONS.includes(value as TaskType);
}

export function isTaskStatusValue(value: string): value is TaskStatus {
  return TASK_STATUS_OPTIONS.includes(value as TaskStatus);
}
