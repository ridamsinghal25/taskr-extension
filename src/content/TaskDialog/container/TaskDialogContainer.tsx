import { useEffect, useRef, useState } from "react";
import type { ChangeEvent, KeyboardEvent as ReactKeyboardEvent } from "react";
import TaskDialog from "../presentation/TaskDialog";
import type { Category } from "@/types/category";
import { TaskStatus, TaskType, type Task } from "@/types/task";
import TaskService from "@/extension-services/task.services";
import { isApiResponse } from "@/lib/typeGuard";
import ApiError from "@/services/ApiError";
import { useCategoriesCache } from "@/hooks/useCachedCategory";

type Props = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  container: HTMLElement;
};

export default function AddTaskDialog({ open, onOpenChange, container }: Props) {
  const {categories} = useCategoriesCache()
  const [text, setText] = useState("");
  const [categoryId, setCategoryId] = useState<string | null>(null);
  const [taskType, setTaskType] = useState<TaskType | null>(null);
  const [success, setSuccess] = useState(false);
  const [showMenu, setShowMenu] = useState(false);
  const [query, setQuery] = useState("");
  const [menuIdx, setMenuIdx] = useState(0);
  const [categoryTasks, setCategoryTasks] = useState<Task[]>([]);
  const [isFetchingTasks, setIsFetchingTasks] = useState(false);
  const [isCreatingTask, setIsCreatingTask] = useState(false);
  const [createError, setCreateError] = useState<string | null>(null);
  const inputRef = useRef<HTMLTextAreaElement | null>(null);

  const selectedCategory = categories.find((c) => c.id === categoryId) ?? null;
  const filteredCategories = categories.filter((c) =>
    c.name.toLowerCase().includes(query.toLowerCase())
  );

  useEffect(() => {
    if (!open) return;
    setText(""); setCategoryId(null); setTaskType(null);
    setSuccess(false); setShowMenu(false); setQuery("");
    setCategoryTasks([]); setCreateError(null);
    setTimeout(() => inputRef.current?.focus(), 90);
  }, [open]);

  useEffect(() => {
    if (!selectedCategory) {
      setCategoryTasks([]);
      return;
    }
    let cancelled = false;
    setIsFetchingTasks(true);
    TaskService.getTasksByCategoryId<Task[]>(selectedCategory.id)
      .then((response) => {
        if (cancelled) return;
        if (isApiResponse(response)) {
          setCategoryTasks(Array.isArray(response.data) ? response.data : []);
        } else {
          setCategoryTasks([]);
        }
      })
      .catch(() => {
        if (!cancelled) setCategoryTasks([]);
      })
      .finally(() => {
        if (!cancelled) setIsFetchingTasks(false);
      });
    return () => {
      cancelled = true;
    };
  }, [selectedCategory?.id]);

  const handleChange = (e: ChangeEvent<HTMLTextAreaElement>) => {
    let val = e.target.value;

    if (/(^|\s)-n(\s|$)/.test(val)) {
      setTaskType(TaskType.Normal);
      val = val.replace(/(^|\s)-n(\s|$)/, (_, a, b) => (a || "") + (b || "")).trimEnd();
      setText(val); setShowMenu(false); return;
    }
    if (/(^|\s)-c(\s|$)/.test(val)) {
      setTaskType(TaskType.Critical);
      val = val.replace(/(^|\s)-c(\s|$)/, (_, a, b) => (a || "") + (b || "")).trimEnd();
      setText(val); setShowMenu(false); return;
    }

    setText(val);
    const m = val.match(/\/([a-zA-Z ]*)$/);
    if (m) { setShowMenu(true); setQuery(m[1].trim()); setMenuIdx(0); }
    else   { setShowMenu(false); setQuery(""); }
  };

  const handleKeyDown = (e: ReactKeyboardEvent<HTMLTextAreaElement>) => {
    if (showMenu && filteredCategories.length > 0) {
      if (e.key === "ArrowDown") { e.preventDefault(); setMenuIdx((i) => Math.min(i + 1, filteredCategories.length - 1)); return; }
      if (e.key === "ArrowUp")   { e.preventDefault(); setMenuIdx((i) => Math.max(i - 1, 0)); return; }
      if (e.key === "Enter")     { e.preventDefault(); selectCategory(filteredCategories[menuIdx]); return; }
      if (e.key === "Escape")    { e.preventDefault(); setShowMenu(false); setQuery(""); return; }
    }
    if (e.key === "Enter" && !e.shiftKey && !showMenu) {
      e.preventDefault();
      handleAdd();
    }
  };

  const selectCategory = (c: Category) => {
    setText((prev) => prev.replace(/\/[a-zA-Z ]*$/, "").trimEnd());
    setCategoryId(c.id); setShowMenu(false); setQuery("");
    setTimeout(() => inputRef.current?.focus(), 0);
  };

  const handleAdd = async () => {
    const trimmed = text.trim();
    if (!trimmed) { inputRef.current?.focus(); return; }
    if (!selectedCategory) {
      setCreateError("Pick a category with “/” before adding a task");
      return;
    }
    setCreateError(null);
    setIsCreatingTask(true);
    try {
      const response = await TaskService.createTask<Task>(
        trimmed,
        taskType ?? TaskType.Normal,
        TaskStatus.Pending,
        selectedCategory.id,
      );
      if (isApiResponse(response)) {
        setCategoryTasks((prev) => [...prev, response.data]);
        setSuccess(true);
        setTimeout(() => onOpenChange(false), 1900);
      } else {
        const err = response as ApiError;
        setCreateError(
          err.errorResponse?.message ||
            err.errorMessage ||
            "Unable to create task",
        );
      }
    } catch (err) {
      setCreateError((err as Error).message || "Unable to create task");
    } finally {
      setIsCreatingTask(false);
    }
  };

  return (
    <TaskDialog
      open={open}
      onOpenChange={onOpenChange}
      container={container}
      text={text}
      success={success}
      showMenu={showMenu}
      query={query}
      menuIdx={menuIdx}
      inputRef={inputRef}
      selectedCategory={selectedCategory}
      selectedTaskType={taskType}
      filteredCategories={filteredCategories}
      categoryTasks={categoryTasks}
      isFetchingTasks={isFetchingTasks}
      isCreatingTask={isCreatingTask}
      createError={createError}
      onChange={handleChange}
      onKeyDown={handleKeyDown}
      onSelectCategory={selectCategory}
      onAdd={handleAdd}
      onClearCategory={() => setCategoryId(null)}
      onClearTaskType={() => setTaskType(null)}
      onHoverMenuItem={setMenuIdx}
    />
  );
}
