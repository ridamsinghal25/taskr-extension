import {
  TaskStatus,
  TaskType,
  type Task,
  type TaskAttachmentInput,
} from "@/types/task";

import {
  getLocalStorageJSON,
  removeLocalStorageItem,
  setLocalStorageJSON,
} from "../localStorage";

const RECENT_TASKS_CACHE_KEY = "taskr:recent-tasks";
const RECENT_TASKS_TTL_MS = 60 * 60 * 1000;

type RecentTasksCacheEntry = {
  cachedAt: number;
  tasks: Task[];
};

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function parseDate(value: unknown): Date | null {
  const date =
    value instanceof Date
      ? value
      : new Date(typeof value === "string" ? value : "");
  return Number.isNaN(date.getTime()) ? null : date;
}

function reviveAttachment(raw: unknown): TaskAttachmentInput | null {
  if (!isRecord(raw) || typeof raw.url !== "string") return null;
  return typeof raw.fileId === "string"
    ? { url: raw.url, fileId: raw.fileId }
    : { url: raw.url };
}

function reviveTask(raw: unknown): Task | null {
  if (!isRecord(raw)) return null;
  const { id, name, type, status, categoryId } = raw;
  if (
    typeof id !== "string" ||
    typeof name !== "string" ||
    typeof categoryId !== "string" ||
    !Object.values(TaskType).includes(type as TaskType) ||
    !Object.values(TaskStatus).includes(status as TaskStatus)
  ) {
    return null;
  }
  const createdAt = parseDate(raw.createdAt);
  const updatedAt = parseDate(raw.updatedAt);
  if (!createdAt || !updatedAt) return null;

  const attachments = Array.isArray(raw.attachments)
    ? raw.attachments
        .map(reviveAttachment)
        .filter((a): a is TaskAttachmentInput => a !== null)
    : [];

  return {
    id,
    name,
    type: type as TaskType,
    status: status as TaskStatus,
    categoryId,
    attachments,
    createdAt,
    updatedAt,
  };
}

function readCacheEntry(): RecentTasksCacheEntry | null {
  const parsed = getLocalStorageJSON<unknown>(RECENT_TASKS_CACHE_KEY);
  if (!isRecord(parsed) || typeof parsed.cachedAt !== "number") return null;
  if (!Array.isArray(parsed.tasks)) return null;

  const tasks = parsed.tasks
    .map(reviveTask)
    .filter((t): t is Task => t !== null);

  return { cachedAt: parsed.cachedAt, tasks };
}

function isExpired(cachedAt: number): boolean {
  return Date.now() - cachedAt >= RECENT_TASKS_TTL_MS;
}

export function getCachedRecentTasks(): Task[] | null {
  const entry = readCacheEntry();
  if (!entry) return null;
  if (isExpired(entry.cachedAt)) {
    clearRecentTasksCache();
    return null;
  }
  return entry.tasks;
}

export function setCachedRecentTasks(tasks: Task[]): void {
  setLocalStorageJSON(RECENT_TASKS_CACHE_KEY, {
    cachedAt: Date.now(),
    tasks,
  } satisfies RecentTasksCacheEntry);
}

export function clearRecentTasksCache(): void {
  removeLocalStorageItem(RECENT_TASKS_CACHE_KEY);
}
