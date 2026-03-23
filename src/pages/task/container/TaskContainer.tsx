import { useEffect, useMemo, useState } from "react";
import { useParams } from "react-router-dom";
import { Task as TaskComponent } from "../presentation/Task";
import { useTaskContext } from "@/context/TaskContext/TaskContextProvider";
import { useNoteContext } from "@/context/NoteContext/NoteContextProvider";
import { TaskStatus, TaskType, type Task } from "@/types/task";
import {
  isTaskStatusValue,
  isTaskTypeValue,
  TASK_STATUS_OPTIONS,
  TASK_TYPE_OPTIONS,
} from "@/lib/task/task.constants";
import { useCategoryContext } from "@/context/CategoryContext/CategoryContextProvider";
import { ConfirmActionDialog } from "@/components/dialog/ConfirmActionDialog";

export function TaskContainer() {
  let { categoryId } = useParams<{ categoryId?: string }>();
  const [commandError, setCommandError] = useState<string | null>(null);
  const [noteError, setNoteError] = useState<string | null>(null);
  const [taskIdToDelete, setTaskIdToDelete] = useState<string | null>(null);
  const [noteIdToDelete, setNoteIdToDelete] = useState<string | null>(null);

  const {
    tasks,
    isCreating: isTaskCreating,
    updatingTaskId,
    deletingTaskId,
    isFetching: isTaskFetching,
    setCurrentCategoryId,
    createTask,
    updateTask,
    deleteTasks,
  } = useTaskContext();

  const {
    notes,
    isCreating: isNoteCreating,
    deletingNoteId,
    isFetching: isNoteFetching,
    setCurrentCategoryId: setNoteCategoryId,
    createNote,
    deleteNotes,
  } = useNoteContext();

  const { categories } = useCategoryContext();

  const taskPendingDelete = useMemo(
    () =>
      taskIdToDelete ? tasks.find((t) => t.id === taskIdToDelete) : undefined,
    [taskIdToDelete, tasks],
  );

  const notePendingDelete = useMemo(
    () =>
      noteIdToDelete ? notes.find((n) => n.id === noteIdToDelete) : undefined,
    [noteIdToDelete, notes],
  );

  useEffect(() => {
    if (categoryId) {
      setCurrentCategoryId(categoryId);
      setNoteCategoryId(categoryId);
      setCommandError(null);
      setNoteError(null);
      setTaskIdToDelete(null);
      setNoteIdToDelete(null);
    } else {
      setCurrentCategoryId(null);
      setNoteCategoryId(null);
    }
  }, [categoryId, setCurrentCategoryId, setNoteCategoryId]);

  const handleCommandSubmit = async (command: string): Promise<boolean> => {
    if (!categoryId) {
      setCommandError("Select a category before adding tasks via command.");
      return false;
    }

    const tokens = command.trim().split(/\s+/);
    if (tokens.length === 0) {
      setCommandError(
        "Enter a task name. Example: Buy milk -t normal -s pending",
      );
      return false;
    }

    let type = TaskType.Normal;
    let status = TaskStatus.Pending;
    const nameParts: string[] = [];

    for (let i = 0; i < tokens.length; i++) {
      const token = tokens[i];
      if (token === "-t" && i + 1 < tokens.length) {
        const value = tokens[++i];
        if (!isTaskTypeValue(value)) {
          setCommandError(
            `Invalid task type '${value}'. Use ${TASK_TYPE_OPTIONS.join(" or ")}.`,
          );
          return false;
        }
        type = value;
      } else if (token === "-s" && i + 1 < tokens.length) {
        const value = tokens[++i];
        if (!isTaskStatusValue(value)) {
          setCommandError(
            `Invalid task status '${value}'. Use ${TASK_STATUS_OPTIONS.join(", ")}.`,
          );
          return false;
        }
        status = value;
      } else {
        nameParts.push(token);
      }
    }

    const name = nameParts.join(" ").trim() || "New task";
    setCommandError(null);
    await handleCreateTask(name, type, status);
    return true;
  };

  const handleCreateTask = async (
    name: string,
    type: TaskType,
    status: TaskStatus,
  ) => {
    if (!categoryId) return;
    await createTask(name, type, status, categoryId);
  };

  const handleNoteSubmit = async (
    title: string,
    content: string,
  ): Promise<boolean> => {
    if (!categoryId) {
      setNoteError("Select a category before saving a note.");
      return false;
    }

    const t = title.trim();
    const c = content.trim();
    if (!t) {
      setNoteError("Title is required.");
      return false;
    }
    if (!c) {
      setNoteError("Markdown content is required.");
      return false;
    }

    setNoteError(null);
    await createNote(t, c, categoryId);
    return true;
  };

  const handleUpdateTask = async (
    taskId: string,
    updates: Partial<Pick<Task, "status" | "type">>,
  ) => {
    if (!categoryId) return;
    await updateTask(taskId, categoryId, updates);
  };

  const handleDeleteTask = async (taskId: string) => {
    if (!categoryId) return;
    await deleteTasks([taskId], categoryId);
  };

  const handleDeleteNote = async (noteId: string) => {
    if (!categoryId) return;
    await deleteNotes([noteId], categoryId);
  };

  return (
    <>
      <TaskComponent
        categoryId={categoryId as string}
        categories={categories}
        tasks={tasks}
        notes={notes}
        isTaskFetching={isTaskFetching}
        isNoteFetching={isNoteFetching}
        isTaskCreating={isTaskCreating}
        isNoteCreating={isNoteCreating}
        updatingTaskId={updatingTaskId}
        deletingTaskId={deletingTaskId}
        deletingNoteId={deletingNoteId}
        commandError={commandError}
        noteError={noteError}
        onChatCommandSubmit={handleCommandSubmit}
        onNoteSubmit={handleNoteSubmit}
        onUpdateTask={handleUpdateTask}
        onRequestTaskDelete={setTaskIdToDelete}
        onRequestNoteDelete={setNoteIdToDelete}
      />

      <ConfirmActionDialog
        open={taskIdToDelete !== null}
        onOpenChange={(open) => {
          if (!open) setTaskIdToDelete(null);
        }}
        title="Delete this task?"
        description={
          taskPendingDelete ? (
            <>
              <span className="font-medium text-foreground">
                {taskPendingDelete.name}
              </span>{" "}
              will be removed permanently. This cannot be undone.
            </>
          ) : null
        }
        onConfirm={async () => {
          if (taskIdToDelete) {
            await handleDeleteTask(taskIdToDelete);
          }
        }}
      />

      <ConfirmActionDialog
        open={noteIdToDelete !== null}
        onOpenChange={(open) => {
          if (!open) setNoteIdToDelete(null);
        }}
        title="Delete this note?"
        description={
          notePendingDelete ? (
            <>
              <span className="font-medium text-foreground">
                {notePendingDelete.title}
              </span>{" "}
              will be removed permanently. This cannot be undone.
            </>
          ) : null
        }
        onConfirm={async () => {
          if (noteIdToDelete) {
            await handleDeleteNote(noteIdToDelete);
          }
        }}
      />
    </>
  );
}
