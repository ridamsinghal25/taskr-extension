"use client";

import { useEffect, useMemo, useState } from "react";
import {
  DraggableCardBody,
  DraggableCardContainer,
} from "@/components/ui/draggable-card";
import { getCachedCategories } from "@/lib/category/categoryLocalStorage";
import { readSavedTasksMap } from "@/lib/task/localSavedTasks.storage";
import type { Category } from "@/types/category";
import { TaskStatus, TaskType, type Task } from "@/types/task";
import { Link } from "react-router-dom";
import ROUTES from "@/constants/routes";

// ─── Color palette assigned per card index ────────────────────────────────────
const CARD_THEMES = [
  { accent: "#7F77DD", iconBg: "#EEEDFE", iconColor: "#534AB7" },
  { accent: "#1D9E75", iconBg: "#E1F5EE", iconColor: "#0F6E56" },
  { accent: "#378ADD", iconBg: "#E6F1FB", iconColor: "#185FA5" },
  { accent: "#D85A30", iconBg: "#FAECE7", iconColor: "#993C1D" },
  { accent: "#BA7517", iconBg: "#FAEEDA", iconColor: "#854F0B" },
  { accent: "#D4537E", iconBg: "#FBEAF0", iconColor: "#993556" },
];

// ─── Card positions & rotations ───────────────────────────────────────────────
const CARD_POSITIONS = [
  "absolute top-10  left-[10%]  rotate-[-4deg]",
  "absolute top-32  left-[35%]  rotate-[5deg]",
  "absolute top-8   right-[8%]  rotate-[3deg]",
  "absolute top-48  left-[22%]  rotate-[-2deg]",
  "absolute top-40  right-[22%] rotate-[6deg]",
  "absolute top-20  left-[55%]  rotate-[-5deg]",
];

// ─── Helpers ──────────────────────────────────────────────────────────────────
type CardTask = {
  id: string;
  name: string;
  status: "pending" | "completed" | "in-progress";
  type: "normal" | "urgent" | "blocked";
};

function formatDate(iso: string | Date | undefined) {
  if (!iso) return "";
  return new Date(iso).toLocaleDateString("en-US", { month: "short", day: "numeric" });
}

function getCategoryInitial(name = "") {
  return name.trim().charAt(0).toUpperCase();
}

/** Map app Task model to the status/type strings this card UI already styles. */
function normalizeTaskForCard(task: Task): CardTask {
  const status: CardTask["status"] =
    task.status === TaskStatus.Done || task.status === TaskStatus.Archived
      ? "completed"
      : task.status === TaskStatus.InProgress
        ? "in-progress"
        : "pending";
  const type: CardTask["type"] =
    task.type === TaskType.Critical ? "urgent" : "normal";
  return { id: task.id, name: task.name, status, type };
}

// ─── Status & type pill styles ────────────────────────────────────────────────
const STATUS_STYLES = {
  pending:       { bg: "#FAEEDA", color: "#854F0B", label: "Pending" },
  completed:     { bg: "#E1F5EE", color: "#0F6E56", label: "Done" },
  "in-progress": { bg: "#E6F1FB", color: "#185FA5", label: "In Progress" },
};

const TYPE_STYLES = {
  normal:  { bg: "#F1EFE8", color: "#5F5E5A" },
  urgent:  { bg: "#FCEBEB", color: "#A32D2D" },
  blocked: { bg: "#FBEAF0", color: "#993556" },
};

// ─── Single card ──────────────────────────────────────────────────────────────
function CategoryCard({
  category,
  tasks,
  index,
}: {
  category: Category;
  tasks: CardTask[];
  index: number;
}) {
  const theme    = CARD_THEMES[index % CARD_THEMES.length];
  const position = CARD_POSITIONS[index % CARD_POSITIONS.length];

  const total     = tasks.length;
  const doneTasks = tasks.filter((t) => t.status === "completed").length;
  const pct       = total > 0 ? Math.round((doneTasks / total) * 100) : 0;

  return (
    <DraggableCardBody className={position}>
      <div className="w-65 overflow-hidden rounded-2xl bg-white dark:bg-neutral-900 border border-neutral-200/60 dark:border-neutral-700/60">

        {/* Accent bar */}
        <div className="h-1 w-full" style={{ background: theme.accent }} />

        <div className="p-4">

          {/* Header */}
          <Link to={`${ROUTES.WORKSPACE}/${ROUTES.WORKSPACE_CATEGORIES.replace(":categoryId", category.id)}`}>
            <div className="flex items-center justify-between mb-3 hover:bg-neutral-100 dark:hover:bg-neutral-800 rounded-lg p-2 cursor-pointer">
              <div
                className="w-8 h-8 rounded-lg flex items-center justify-center text-sm font-bold"
                style={{ background: theme.iconBg, color: theme.iconColor }}
              >
                {getCategoryInitial(category.name)}
              </div>
              <span
                className="text-[11px] font-medium px-2 py-0.5 rounded-full"
                style={{ background: theme.iconBg, color: theme.iconColor }}
              >
                {total} {total === 1 ? "task" : "tasks"}
              </span>
            </div>
          </Link>

          {/* Category name + created date */}
          <h3 className="text-sm font-semibold text-neutral-800 dark:text-neutral-100 leading-tight">
            {category.name}
          </h3>
          <p className="text-[11px] text-neutral-400 dark:text-neutral-500 mb-3 mt-0.5">
            Created {formatDate(category.createdAt)}
          </p>

          {/* Task list */}
          {total === 0 ? (
            <p className="text-[11px] text-neutral-300 dark:text-neutral-600 italic py-2">
              No tasks yet
            </p>
          ) : (
            <div className="flex flex-col gap-2">
              {tasks.map((task) => {
                const isDone      = task.status === "completed";
                const statusStyle = STATUS_STYLES[task.status] ?? STATUS_STYLES.pending;
                const typeStyle   = TYPE_STYLES[task.type]     ?? TYPE_STYLES.normal;

                return (
                  <div key={task.id} className="flex items-start gap-2">

                    {/* Checkbox */}
                    <div
                      className="mt-[3px] w-3.5 h-3.5 rounded-full border flex-shrink-0 flex items-center justify-center"
                      style={{
                        borderColor: isDone ? theme.accent : "#d1d5db",
                        background:  isDone ? theme.accent : "transparent",
                      }}
                    >
                      {isDone && (
                        <svg width="7" height="6" viewBox="0 0 7 6" fill="none">
                          <path
                            d="M1 3L2.8 5L6 1"
                            stroke="white"
                            strokeWidth="1.4"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                          />
                        </svg>
                      )}
                    </div>

                    {/* Task name */}
                    <span
                      className={`text-[11px] leading-relaxed flex-1 ${
                        isDone
                          ? "line-through text-neutral-300 dark:text-neutral-600"
                          : "text-neutral-600 dark:text-neutral-300"
                      }`}
                    >
                      {task.name}
                    </span>

                    {/* Type pill — only when not "normal" */}
                    {task.type && task.type !== "normal" && (
                      <span
                        className="text-[10px] font-medium px-1.5 py-0.5 rounded flex-shrink-0 mt-0.5 capitalize"
                        style={{ background: typeStyle.bg, color: typeStyle.color }}
                      >
                        {task.type}
                      </span>
                    )}

                    {/* Status pill — only for pending/in-progress */}
                    {!isDone && (
                      <span
                        className="text-[10px] font-medium px-1.5 py-0.5 rounded flex-shrink-0 mt-0.5"
                        style={{ background: statusStyle.bg, color: statusStyle.color }}
                      >
                        {statusStyle.label}
                      </span>
                    )}
                  </div>
                );
              })}
            </div>
          )}

          {/* Progress bar */}
          <div className="mt-4 pt-3 border-t border-neutral-100 dark:border-neutral-800 flex items-center gap-2">
            <div className="flex-1 h-1 bg-neutral-100 dark:bg-neutral-800 rounded-full overflow-hidden">
              <div
                className="h-full rounded-full transition-all duration-500"
                style={{ width: `${pct}%`, background: theme.accent }}
              />
            </div>
            <span className="text-[10px] text-neutral-400 dark:text-neutral-500 flex-shrink-0 tabular-nums">
              {pct}%
            </span>
          </div>

        </div>
      </div>
    </DraggableCardBody>
  );
}

// ─── Main component ───────────────────────────────────────────────────────────
export default function DraggableCardDemo() {
  const [categories, setCategories] = useState<Category[]>([]);

  useEffect(() => {
    setCategories(getCachedCategories() ?? []);
  }, []);

  const cardsData = useMemo(() => {
    return categories
      .map((category) => {
        const savedById = readSavedTasksMap(category.id);
        const tasks = Object.values(savedById).map(normalizeTaskForCard);
        return { category, tasks };
      })
      .filter(({ tasks }) => tasks.length > 0);
  }, [categories]);

  return (
    <DraggableCardContainer className="relative flex min-h-screen w-full items-center justify-center overflow-clip">

      <p className="absolute top-1/2 mx-auto max-w-sm -translate-y-3/4 text-center text-2xl font-black text-neutral-200 md:text-4xl dark:text-neutral-800 select-none pointer-events-none">
        Everything you need to do,{" "}
        <span className="text-neutral-400 dark:text-neutral-700">in one place.</span>
      </p>

      {cardsData.length === 0 ? (
        <p className="text-sm text-neutral-400 dark:text-neutral-600">
          {categories.length === 0
            ? "No categories found. Add some to get started."
            : "No saved tasks yet. Use Local on tasks in the workspace to see categories here."}
        </p>
      ) : (
        cardsData.map(({ category, tasks }, index) => (
          <CategoryCard
            key={category.id}
            category={category}
            tasks={tasks}
            index={index}
          />
        ))
      )}

    </DraggableCardContainer>
  );
}