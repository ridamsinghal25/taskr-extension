import type { Category } from "@/types/category";

import {
  getLocalStorageJSON,
  removeLocalStorageItem,
  setLocalStorageJSON,
} from "../localStorage";

const CATEGORY_CACHE_KEY = "taskr:categories";

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function reviveCategory(raw: unknown): Category | null {
  if (!isRecord(raw)) return null;
  const { id, name, userId, createdAt, updatedAt } = raw;
  if (
    typeof id !== "string" ||
    typeof name !== "string" ||
    typeof userId !== "string"
  ) {
    return null;
  }
  const created =
    createdAt instanceof Date
      ? createdAt
      : new Date(typeof createdAt === "string" ? createdAt : "");
  const updated =
    updatedAt instanceof Date
      ? updatedAt
      : new Date(typeof updatedAt === "string" ? updatedAt : "");
  if (Number.isNaN(created.getTime()) || Number.isNaN(updated.getTime())) {
    return null;
  }
  return { id, name, userId, createdAt: created, updatedAt: updated };
}

export function getCachedCategories(): Category[] | null {
  const parsed = getLocalStorageJSON<unknown>(CATEGORY_CACHE_KEY);
  if (!Array.isArray(parsed)) return null;
  return parsed
    .map(reviveCategory)
    .filter((c): c is Category => c !== null);
}

export function setCachedCategories(categories: Category[]): void {
  setLocalStorageJSON(CATEGORY_CACHE_KEY, categories);
}

export function clearCategoryCache(): void {
  removeLocalStorageItem(CATEGORY_CACHE_KEY);
}
