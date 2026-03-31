import { useCallback, useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { Workspace } from "../presentation/Workspace";
import { useTaskContext } from "@/context/TaskContext/TaskContextProvider";
import { useNoteContext } from "@/context/NoteContext/NoteContextProvider";
import { useCategoryContext } from "@/context/CategoryContext/CategoryContextProvider";
import type { Task } from "@/types/task";
import {
  readSavedTasksMap,
  writeSavedTasksMap,
  deleteSavedTasksMap,
} from "@/lib/task/localSavedTasks.storage";

/** Stable JSON for comparing API tasks with tasks rehydrated from localStorage. */
function taskPayloadJson(task: Task): string {
  const createdAt =
    task.createdAt instanceof Date
      ? task.createdAt.toISOString()
      : String(task.createdAt);
  const updatedAt =
    task.updatedAt instanceof Date
      ? task.updatedAt.toISOString()
      : String(task.updatedAt);
  return JSON.stringify({
    id: String(task.id),
    name: task.name,
    type: task.type,
    status: task.status,
    categoryId: task.categoryId,
    createdAt,
    updatedAt,
    attachments: task.attachments ?? [],
  });
}

export function WorkspaceContainer() {
  const { categoryId } = useParams<{ categoryId?: string }>();

  const { setCurrentCategoryId, currentCategoryId } = useCategoryContext();

  const {
    tasks,
    isFetching: isTaskFetching,
    isTaskMode,
    setIsTaskMode,
  } = useTaskContext();

  const { notes, isFetching: isNoteFetching } = useNoteContext();

  const { categories } = useCategoryContext();

  const [savedTasksById, setSavedTasksById] = useState<Record<string, Task>>(
    () => (categoryId ? readSavedTasksMap(categoryId) : {}),
  );

  useEffect(() => {
    if (categoryId) {
      setCurrentCategoryId(categoryId);
    } else {
      setCurrentCategoryId(null);
    }
  }, [categoryId, setCurrentCategoryId]);

  useEffect(() => {
    if (!categoryId) {
      setSavedTasksById({});
      return;
    }
    setSavedTasksById(readSavedTasksMap(categoryId));
  }, [categoryId]);

  const isTaskSavedInBrowser = useCallback(
    (taskId: string) => Object.hasOwn(savedTasksById, String(taskId)),
    [savedTasksById],
  );

  const toggleSaveTaskInBrowser = useCallback(
    (task: Task, checked: boolean) => {
      if (!categoryId) return;

      const id = String(task.id);

      setSavedTasksById((prev) => {
        const next = { ...prev };
        if (checked) {
          next[id] = task;
        } else {
          delete next[id];
        }

        if (Object.keys(next).length > 0) {
          writeSavedTasksMap(categoryId, next);
        } else {
          deleteSavedTasksMap(categoryId);
        }
        return next;
      });

    },
    [categoryId],
  );

  const removeTaskFromBrowserSave = useCallback(
    (taskId: string) => {
      if (!categoryId) return;

      const id = String(taskId);

      setSavedTasksById((prev) => {
        if (!(id in prev)) return prev;

        const next = { ...prev };
        delete next[id];

        if (Object.keys(next).length > 0) {
          writeSavedTasksMap(categoryId, next);
        } else {
          deleteSavedTasksMap(categoryId);
        }

        return next;
      });
    },
    [categoryId],
  );

  /* Refresh stored copies when the server task changes. Do NOT drop saved ids
     just because the live list is empty or differs (fetch errors, races, id
     shape) — that was clearing localStorage when reopening a category. */
  useEffect(() => {
    if (!categoryId || isTaskFetching) return;
    if (currentCategoryId !== categoryId) return;
    if (tasks.length === 0) return;

    setSavedTasksById((prev) => {
      if (Object.keys(prev).length === 0) return prev;

      const next = { ...prev };
      let changed = false;

      for (const task of tasks) {
        const id = String(task.id);
        if (!id || id === "undefined") continue;
        if (id in prev && taskPayloadJson(prev[id]) !== taskPayloadJson(task)) {
          next[id] = task;
          changed = true;
        }
      }
      if (changed) {
        writeSavedTasksMap(categoryId, next);
      }
      return changed ? next : prev;
    });
  }, [tasks, categoryId, isTaskFetching, currentCategoryId]);

  return (
    <>
      <Workspace
        categoryId={categoryId as string}
        categories={categories}
        tasks={tasks}
        notes={notes}
        isTaskFetching={isTaskFetching}
        isNoteFetching={isNoteFetching}
        isTaskMode={isTaskMode}
        setIsTaskMode={setIsTaskMode}
        taskLocalSave={{
          isTaskSavedInBrowser,
          toggleSaveTaskInBrowser,
          removeTaskFromBrowserSave,
        }}
      />
    </>
  );
}
