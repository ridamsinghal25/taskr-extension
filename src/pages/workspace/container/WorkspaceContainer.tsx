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

export function WorkspaceContainer() {
  let { categoryId } = useParams<{ categoryId?: string }>();

  const { setCurrentCategoryId } = useCategoryContext();

  const {
    tasks,
    isFetching: isTaskFetching,
    isTaskMode,
    setIsTaskMode,
  } = useTaskContext();

  const { notes, isFetching: isNoteFetching } = useNoteContext();

  const { categories } = useCategoryContext();

  const [savedTasksById, setSavedTasksById] = useState<Record<string, Task>>(
    {},
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
    (taskId: string) => taskId in savedTasksById,
    [savedTasksById],
  );

  const toggleSaveTaskInBrowser = useCallback(
    (task: Task, checked: boolean) => {
      if (!categoryId) return;

      let next;

      setSavedTasksById((prev) => {
        next = { ...prev };
        if (checked) {
          next[task.id] = task;
        } else {
          delete next[task.id];
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

      setSavedTasksById((prev) => {
        if (!(taskId in prev)) return prev;

        const next = { ...prev };
        delete next[taskId];

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

  useEffect(() => {
    if (!categoryId || isTaskFetching) return;
    const taskIds = new Set(tasks.map((t) => t.id));
    setSavedTasksById((prev) => {
      const savedIds = Object.keys(prev);
      if (savedIds.length === 0) return prev;
      let next = { ...prev };
      let changed = false;
      for (const id of savedIds) {
        if (!taskIds.has(id)) {
          delete next[id];
          changed = true;
        }
      }
      for (const task of tasks) {
        if (task.id in prev) {
          if (JSON.stringify(prev[task.id]) !== JSON.stringify(task)) {
            next[task.id] = task;
            changed = true;
          }
        }
      }
      if (changed && Object.keys(next).length > 0) {
        writeSavedTasksMap(categoryId, next);
      }
      return changed ? next : prev;
    });
  }, [tasks, categoryId, isTaskFetching]);

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
