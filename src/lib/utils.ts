import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function abbreviate(name: string) {
  return name
    .split(" ")
    .map((word) => word.charAt(0).toUpperCase())
    .join("")
    .slice(0, 2);
}

export const CATEGORY_COLORS = [
  "#3B82F6",
  "#8B5CF6",
  "#10B981",
  "#F59E0B",
  "#EF4444",
  "#EC4899",
  "#06B6D4",
  "#84CC16",
] as const;

export const CATEGORY_BG_CLASSES = [
  "bg-[#3B82F6]",
  "bg-[#8B5CF6]",
  "bg-[#10B981]",
  "bg-[#F59E0B]",
  "bg-[#EF4444]",
  "bg-[#EC4899]",
  "bg-[#06B6D4]",
  "bg-[#84CC16]",
] as const;

function getCategoryColorIndex(key: string): number {
  let hash = 0;
  for (let i = 0; i < key.length; i++) {
    hash = (hash << 5) - hash + key.charCodeAt(i);
    hash |= 0;
  }
  return Math.abs(hash) % CATEGORY_COLORS.length;
}

export function getCategoryColor(key: string): string {
  return CATEGORY_COLORS[getCategoryColorIndex(key)];
}

export function getCategoryBgClass(key: string): string {
  return CATEGORY_BG_CLASSES[getCategoryColorIndex(key)];
}
