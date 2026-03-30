import type { Task } from "@/types/task";

const PREFIX = "taskr.savedTasks.v1";

export type TaskLocalSaveHandlers = {
  isTaskSavedInBrowser: (taskId: string) => boolean;
  toggleSaveTaskInBrowser: (task: Task, checked: boolean) => void;
  removeTaskFromBrowserSave: (taskId: string) => void;
};

export function savedTasksStorageKey(categoryId: string): string {
  return `${PREFIX}.${categoryId}`;
}

export function readSavedTasksMap(categoryId: string): Record<string, Task> {
  try {
    const raw = localStorage.getItem(savedTasksStorageKey(categoryId));
    if (!raw) return {};
    const parsed = JSON.parse(raw) as Record<string, Task>;
    return parsed && typeof parsed === "object" ? parsed : {};
  } catch {
    return {};
  }
}

export function writeSavedTasksMap(
  categoryId: string,
  map: Record<string, Task>,
): void {
  try {
    localStorage.setItem(savedTasksStorageKey(categoryId), JSON.stringify(map));
  } catch {
    // quota / private mode
  }
}


export function deleteSavedTasksMap(categoryId: string): void {
  try {
    localStorage.removeItem(savedTasksStorageKey(categoryId));
  } catch {
    // quota / private mode
  }
}