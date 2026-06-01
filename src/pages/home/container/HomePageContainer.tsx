import { useCallback, useEffect, useMemo, useState } from "react";
import { toast } from "react-toastify";
import TaskService from "@/extension-services/task.services";
import { useCategoryContext } from "@/context/CategoryContext/CategoryContextProvider";
import { isApiResponse } from "@/lib/typeGuard";
import {
  getCachedRecentTasks,
  setCachedRecentTasks,
} from "@/lib/task/taskLocalStorage";
import { abbreviate, getCategoryColor } from "@/lib/utils";
import { TaskStatus, type Task } from "@/types/task";
import {
  HomePage,
  type HomeCategoryItem,
  type HomeGroup,
} from "@/pages/home/presentation/HomePage";

function startOfLocalDay(date: Date): number {
  return new Date(
    date.getFullYear(),
    date.getMonth(),
    date.getDate(),
  ).getTime();
}

function getGroup(ts: number): "Today" | "Yesterday" | "Earlier" {
  const taskDay = startOfLocalDay(new Date(ts));
  const today = startOfLocalDay(new Date());
  const dayMs = 86_400_000;
  const daysAgo = Math.floor((today - taskDay) / dayMs);

  if (daysAgo === 0) return "Today";
  if (daysAgo === 1) return "Yesterday";
  return "Earlier";
}

function getTaskTimestamp(task: Task): number {
  const date = task.updatedAt ?? task.createdAt;
  return date instanceof Date ? date.getTime() : new Date(date).getTime();
}

export function HomePageContainer() {
  const { categories, setCurrentCategoryId } = useCategoryContext();

  const [tasks, setTasks] = useState<Task[]>(
    () => getCachedRecentTasks() ?? [],
  );
  const [isFetching, setIsFetching] = useState(
    () => getCachedRecentTasks() === null,
  );
  const [updatingTaskId, setUpdatingTaskId] = useState<string | null>(null);

  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<"all" | TaskStatus>("all");
  const [categoryFilter, setCategoryFilter] = useState<"all" | string>("all");

  useEffect(() => {
    setCurrentCategoryId(null);
  }, [setCurrentCategoryId]);

  useEffect(() => {
    let cancelled = false;

    const cached = getCachedRecentTasks();
    if (cached) {
      setTasks(cached);
      setIsFetching(false);
      return;
    }

    setIsFetching(true);
    TaskService.getRecentTasks<Task[]>()
      .then((response) => {
        if (cancelled) return;
        if (isApiResponse(response)) {
          const next = Array.isArray(response.data) ? response.data : [];
          setTasks(next);
          setCachedRecentTasks(next);
        } else {
          toast.error(
            response.errorResponse?.message ||
              response.errorMessage ||
              "Unable to fetch recent tasks",
          );
          setTasks([]);
        }
      })
      .catch((err) => {
        if (cancelled) return;
        toast.error((err as Error).message || "Unable to fetch recent tasks");
        setTasks([]);
      })
      .finally(() => {
        if (!cancelled) setIsFetching(false);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  const allowedCategoryIds = useMemo(
    () => new Set(tasks.map((t) => t.categoryId)),
    [tasks],
  );

  const homeCategories = useMemo<HomeCategoryItem[]>(
    () =>
      categories
        .filter((c) => allowedCategoryIds.has(c.id))
        .map((c) => ({
          id: c.id,
          name: c.name,
          color: getCategoryColor(c.id),
          initials: abbreviate(c.name),
        })),
    [categories, allowedCategoryIds],
  );

  const categoryById = useMemo(() => {
    const map = new Map<string, HomeCategoryItem>();
    for (const c of categories) {
      map.set(c.id, {
        id: c.id,
        name: c.name,
        color: getCategoryColor(c.id),
        initials: abbreviate(c.name),
      });
    }
    return map;
  }, [categories]);

  const visibleTasks = useMemo(
    () => tasks.filter((t) => t.status !== TaskStatus.Archived),
    [tasks],
  );

  useEffect(() => {
    if (
      categoryFilter !== "all" &&
      !allowedCategoryIds.has(categoryFilter)
    ) {
      setCategoryFilter("all");
    }
  }, [categoryFilter, allowedCategoryIds]);

  const stats = useMemo(() => {
    let inProgress = 0;
    let pending = 0;
    let done = 0;
    for (const t of visibleTasks) {
      if (t.status === TaskStatus.Done) done += 1;
      else if (t.status === TaskStatus.InProgress) inProgress += 1;
      else if (t.status === TaskStatus.Pending) pending += 1;
    }
    return { total: visibleTasks.length, inProgress, pending, done };
  }, [visibleTasks]);

  const categoryCounts = useMemo(() => {
    const counts: Record<string, number> = {};
    for (const t of visibleTasks) {
      counts[t.categoryId] = (counts[t.categoryId] ?? 0) + 1;
    }
    return counts;
  }, [visibleTasks]);

  const groups = useMemo<HomeGroup[]>(() => {
    const needle = search.trim().toLowerCase();
    const filtered = visibleTasks
      .filter((t) =>
        categoryFilter === "all" ? true : t.categoryId === categoryFilter,
      )
      .filter((t) =>
        statusFilter === "all" ? true : t.status === statusFilter,
      )
      .filter((t) =>
        needle ? t.name.toLowerCase().includes(needle) : true,
      )
      .sort((a, b) => getTaskTimestamp(b) - getTaskTimestamp(a));

    const byGroup: Record<HomeGroup["label"], Task[]> = {
      Today: [],
      Yesterday: [],
      Earlier: [],
    };
    for (const task of filtered) {
      byGroup[getGroup(getTaskTimestamp(task))].push(task);
    }
    return (["Today", "Yesterday", "Earlier"] as const)
      .filter((label) => byGroup[label].length > 0)
      .map((label) => ({ label, items: byGroup[label] }));
  }, [visibleTasks, categoryFilter, statusFilter, search]);

  const totalShown = useMemo(
    () => groups.reduce((acc, g) => acc + g.items.length, 0),
    [groups],
  );

  const handleToggleDone = useCallback(async (task: Task) => {
    const nextStatus =
      task.status === TaskStatus.Done ? TaskStatus.Pending : TaskStatus.Done;
    const prev = task.status;
    setUpdatingTaskId(task.id);
    setTasks((all) =>
      all.map((t) => (t.id === task.id ? { ...t, status: nextStatus } : t)),
    );
    try {
      const response = await TaskService.updateTask<Task>(
        task.id,
        task.categoryId,
        { status: nextStatus },
      );
      if (!isApiResponse(response)) {
        setTasks((all) =>
          all.map((t) => (t.id === task.id ? { ...t, status: prev } : t)),
        );
        toast.error(
          response.errorResponse?.message ||
            response.errorMessage ||
            "Unable to update task",
        );
      } else {
        setTasks((all) => {
          const next = all.map((t) =>
            t.id === task.id ? response.data : t,
          );
          setCachedRecentTasks(next);
          return next;
        });
      }
    } catch (err) {
      setTasks((all) =>
        all.map((t) => (t.id === task.id ? { ...t, status: prev } : t)),
      );
      toast.error((err as Error).message || "Unable to update task");
    } finally {
      setUpdatingTaskId(null);
    }
  }, []);

  return (
    <HomePage
      isFetching={isFetching}
      stats={stats}
      categories={homeCategories}
      categoryCounts={categoryCounts}
      groups={groups}
      totalShown={totalShown}
      totalCategories={homeCategories.length}
      search={search}
      onSearchChange={setSearch}
      statusFilter={statusFilter}
      onStatusFilterChange={setStatusFilter}
      categoryFilter={categoryFilter}
      onCategoryFilterChange={setCategoryFilter}
      updatingTaskId={updatingTaskId}
      onToggleDone={handleToggleDone}
      getCategoryById={(id) => categoryById.get(id)}
    />
  );
}
