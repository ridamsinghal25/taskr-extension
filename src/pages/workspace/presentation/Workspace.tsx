import { ScrollArea } from "@/components/ui/scroll-area";
import type { Task } from "@/types/task";
import { FolderOpen } from "lucide-react";
import type { Category } from "@/types/category";
import { abbreviate } from "@/lib/utils";
import { TasksSkeleton } from "@/components/task/TaskSkeleton";
import { Button } from "@/components/ui/button";
import { TaskListPanel } from "@/components/task/TaskListPanel";
import { TaskComposerBar } from "@/components/task/TaskComposerBar";
import { NoteListPanel } from "@/components/note/NoteListPanel";
import { NoteComposerBar } from "@/components/note/NoteComposerBar";
import type { Note } from "@/types/note";
import type { TaskLocalSaveHandlers } from "@/lib/task/localSavedTasks.storage";

export type ComposerMode = "task" | "note";

type Props = {
  categoryId: string;
  categories: Category[];
  tasks: Task[];
  notes: Note[];
  isTaskFetching: boolean;
  isNoteFetching: boolean;
  isTaskMode: boolean;
  setIsTaskMode: (isTaskMode: boolean) => void;
  taskLocalSave: TaskLocalSaveHandlers;
};

export function Workspace({
  categoryId,
  categories,
  tasks,
  notes,
  isTaskFetching,
  isNoteFetching,
  isTaskMode,
  setIsTaskMode,
  taskLocalSave,
}: Props) {
  const isLoadingContent = isTaskMode ? isTaskFetching : isNoteFetching;

  if (isLoadingContent) {
    return <TasksSkeleton />;
  }

  const chatShellClass =
    "relative flex flex-1 flex-col bg-linear-to-b from-primary/7 from-0% via-background via-45% to-blue-500/4 to-100% dark:from-primary/12 dark:via-background dark:to-blue-950/35";
  const chatHeaderClass =
    "flex items-center gap-3 border-b border-primary/20 bg-linear-to-r from-primary/8 via-primary/4 to-blue-500/6 p-4 shadow-sm shadow-primary/5 backdrop-blur-md dark:from-primary/15 dark:via-primary/8 dark:to-blue-950/40 dark:border-primary/25";
  const chatFooterClass =
    "border-t border-primary/20 bg-linear-to-t from-primary/6 to-primary/2 px-4 py-3 backdrop-blur-md dark:from-primary/10 dark:to-primary/5 dark:border-primary/25";

  if (!categoryId) {
    return (
      <div className="flex h-full w-full overflow-hidden">
        <div className={chatShellClass}>
          <div className={chatHeaderClass}>
            <div className="flex h-10 w-10 items-center justify-center rounded-xl border border-dashed border-primary/35 bg-primary/10 text-primary shadow-sm">
              <FolderOpen className="h-5 w-5" aria-hidden />
            </div>
            <div className="flex min-w-0 flex-col">
              <span className="text-md font-semibold text-foreground">
                Tasks
              </span>
              <span className="text-xs text-muted-foreground">
                No category selected
              </span>
            </div>
          </div>

          <ScrollArea className="flex-1 overflow-hidden">
            <div className="flex min-h-[min(320px,50vh)] flex-col items-center justify-center p-4 md:p-6">
              <div className="w-full max-w-md rounded-2xl border border-primary/20 bg-primary/5 px-6 py-8 text-center shadow-md shadow-primary/10 backdrop-blur-sm dark:bg-primary/10">
                <div
                  className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl border border-primary/25 bg-primary/15 text-primary shadow-inner shadow-primary/10"
                  aria-hidden
                >
                  <FolderOpen className="h-7 w-7" />
                </div>
                <h2 className="text-lg font-semibold tracking-tight text-foreground">
                  Select a category
                </h2>
                <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                  Choose a category from the sidebar to load tasks and notes.
                </p>
              </div>
            </div>
          </ScrollArea>

          <div className={`${chatFooterClass} pointer-events-none opacity-60`}>
            <div className="flex items-center gap-2">
              <input
                type="text"
                readOnly
                disabled
                placeholder="Select a category to add tasks…"
                className="flex-1 cursor-not-allowed rounded-md border border-primary/20 bg-background/50 px-3 py-2 text-sm text-muted-foreground shadow-inner shadow-primary/5"
              />
              <Button type="button" disabled variant="secondary" size="default">
                Send
              </Button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  const categoryName =
    categories.find((cat) => cat.id === categoryId)?.name ?? "";
  const listCount = isTaskMode ? tasks.length : notes.length;
  const listLabel = isTaskMode ? "Tasks" : "Notes";

  return (
    <div className="flex h-full w-full overflow-hidden">
      <div className={chatShellClass}>
        <div className={chatHeaderClass}>
          <div className="flex h-10 w-10 items-center justify-center rounded-xl border border-primary/30 bg-primary/15 text-sm font-bold text-primary shadow-sm shadow-primary/10">
            {abbreviate(categoryName)}
          </div>

          <div className="flex min-w-0 flex-1 flex-col">
            <span className="text-md font-semibold text-foreground">
              {categoryName}
            </span>
            <span className="text-xs text-muted-foreground">
              {listLabel} ({listCount})
            </span>
          </div>

          <div className="flex shrink-0 gap-1 rounded-lg border border-primary/20 bg-background/50 p-0.5 text-xs font-medium cursor-pointer">
            <button
              type="button"
              onClick={() => setIsTaskMode(true)}
              className={`rounded-md px-2.5 py-1 transition cursor-pointer ${isTaskMode ? "bg-primary/20 text-foreground" : "text-muted-foreground hover:text-foreground"}`}
            >
              Tasks
            </button>
            <button
              type="button"
              onClick={() => setIsTaskMode(false)}
              className={`rounded-md px-2.5 py-1 transition cursor-pointer ${!isTaskMode ? "bg-primary/20 text-foreground" : "text-muted-foreground hover:text-foreground"}`}
            >
              Notes
            </button>
          </div>
        </div>

        <ScrollArea className="flex-1 overflow-hidden">
          {isTaskMode ? (
            <TaskListPanel taskLocalSave={taskLocalSave} />
          ) : (
            <NoteListPanel />
          )}
        </ScrollArea>

        {isTaskMode ? (
          <TaskComposerBar />
        ) : (
          <NoteComposerBar onSwitchToTasks={() => setIsTaskMode(true)} />
        )}
      </div>
    </div>
  );
}
