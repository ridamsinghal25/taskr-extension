import type {
  ChangeEvent,
  KeyboardEvent as ReactKeyboardEvent,
  RefObject,
} from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import type { Category } from "@/types/category";
import { TaskType, type Task } from "@/types/task";
import { abbreviate, getCategoryColor } from "@/lib/utils";
import { CheckCircle2, Loader2, Search, X, ArrowUpDown, CornerDownLeft } from "lucide-react";
import CategoryTasksList from "@/content/components/CategoryTasksList";

const TASK_TYPE_LABEL: Record<TaskType, string> = {
  [TaskType.Normal]: "Normal",
  [TaskType.Critical]: "Critical",
};

type TaskDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  container: HTMLElement;
  text: string;
  success: boolean;
  showMenu: boolean;
  query: string;
  menuIdx: number;
  inputRef: RefObject<HTMLTextAreaElement | null>;
  selectedCategory: Category | null;
  selectedTaskType: TaskType | null;
  filteredCategories: Category[];
  categoryTasks: Task[];
  isFetchingTasks: boolean;
  isCreatingTask: boolean;
  createError: string | null;
  onChange: (e: ChangeEvent<HTMLTextAreaElement>) => void;
  onKeyDown: (e: ReactKeyboardEvent<HTMLTextAreaElement>) => void;
  onSelectCategory: (c: Category) => void;
  onAdd: () => void;
  onClearCategory: () => void;
  onClearTaskType: () => void;
  onHoverMenuItem: (idx: number) => void;
};

export default function TaskDialog({
  open,
  onOpenChange,
  container,
  text,
  success,
  showMenu,
  query,
  menuIdx,
  inputRef,
  selectedCategory,
  selectedTaskType,
  filteredCategories,
  categoryTasks,
  isFetchingTasks,
  isCreatingTask,
  createError,
  onChange,
  onKeyDown,
  onSelectCategory,
  onAdd,
  onClearCategory,
  onClearTaskType,
  onHoverMenuItem,
}: TaskDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        container={container}
        showCloseButton={false}
        className="max-w-[440px] text-white gap-0 p-0 z-1000"
      >
        {success ? (
          <div className="flex flex-col items-center py-4 animate-in fade-in zoom-in-95 duration-500">
            {/* Success Icon */}
            <div className="relative">
              {/* Outer pulse */}
              <div className="absolute inset-0 rounded-full bg-green-500/20 animate-ping" />

              {/* Glow */}
              <div className="absolute inset-0 rounded-full bg-green-500/30 blur-xl" />

              {/* Main circle */}
              <div className="relative flex h-20 w-20 items-center justify-center rounded-full bg-linear-to-br from-green-500 to-emerald-600 shadow-lg shadow-green-500/30">
                <CheckCircle2 className="h-11 w-11 text-white" />
              </div>
            </div>

            {/* Content */}
            <div className="mt-6 text-center max-w-sm">
              <h3 className="text-xl font-bold tracking-tight">
                Task Created 🎉
              </h3>

              <p className="mt-2 text-sm text-muted-foreground">
                {selectedCategory
                  ? <>
                    <span>Your task has been successfully added to </span>
                    <span className="font-bold text-black">{selectedCategory.name}</span>
                  </>
                  : "Your task has been saved successfully."}
              </p>
            </div>
          </div>
        ) : (
          <>
            <DialogHeader className="flex-row items-center justify-between space-y-0 border-b px-4 py-3">
              <DialogTitle className="text-sm font-medium flex justify-center items-center gap-2 text-black">
                <div className="flex h-7 w-7 items-center justify-center rounded-md bg-linear-to-br from-indigo-500 to-cyan-500 text-xs font-bold text-black">
                  T
                </div>
                <h1 className="text-sm font-bold tracking-tight">Taskr</h1>
              </DialogTitle>
              <DialogClose asChild>
                <Button variant="ghost" size="icon" className="h-7 w-7 cursor-pointer">
                  <X className="h-4 w-4 text-black" />
                </Button>
              </DialogClose>
            </DialogHeader>

            <div className="space-y-3 px-4 py-3">
              <Textarea
                ref={inputRef}
                placeholder="What needs to be done?"
                value={text}
                onChange={onChange}
                onKeyDown={(e) => {
                  e.stopPropagation();
                  onKeyDown(e);
                }}
                onKeyUp={(e) => e.stopPropagation()}
                onKeyPress={(e) => e.stopPropagation()}
                onInput={(e) => e.stopPropagation()}
                onBeforeInput={(e) => e.stopPropagation()}
                className="resize-none text-sm text-black border border-gray-300 focus-visible:border-gray-400"
              />

              {showMenu && (
                <div className="overflow-hidden rounded-lg border bg-popover shadow-md">
                  <div className="flex items-center gap-2 border-b px-3 py-2">
                    <Search size={12} className="text-muted-foreground" />
                    <span className="text-xs text-muted-foreground">
                      {query ? `/${query}` : "type to filter…"}
                    </span>
                    <span className="ml-auto flex items-center gap-1 text-xs text-muted-foreground/50">
                      <ArrowUpDown className="h-3 w-3" />
                      <span>navigate</span>

                      <CornerDownLeft className="ml-2 h-3 w-3" />
                      <span>pick</span>
                    </span>
                  </div>
                  {filteredCategories.length === 0 ? (
                    <p className="px-3 py-2.5 text-xs text-muted-foreground">
                      No results for "{query}"
                    </p>
                  ) : (
                    filteredCategories.map((c, i) => (
                      <div
                        key={c.id}
                        className={`flex cursor-pointer items-center gap-2.5 px-3 py-2.5 text-sm transition-colors ${
                          i === menuIdx ? "bg-accent" : "hover:bg-accent/50"
                        }`}
                        onMouseEnter={() => onHoverMenuItem(i)}
                        onMouseDown={(e) => {
                          e.preventDefault();
                          onSelectCategory(c);
                        }}
                      >
                        <span
                          className="flex h-5 w-5 shrink-0 items-center justify-center rounded text-[9px] font-bold text-white"
                          style={{ backgroundColor: getCategoryColor(c.id) }}
                        >
                          {abbreviate(c.name)}
                        </span>
                        <span className="font-medium text-black">{c.name}</span>
                      </div>
                    ))
                  )}
                </div>
              )}

              {(selectedCategory || selectedTaskType) && !showMenu && (
                <div className="flex flex-wrap gap-2">
                  {selectedCategory && (() => {
                    const selectedCategoryColor = getCategoryColor(selectedCategory.id);
                    return (
                      <button
                        onClick={onClearCategory}
                        className="flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-xs font-medium transition-opacity hover:opacity-70"
                        style={{
                          color: selectedCategoryColor,
                          borderColor: `${selectedCategoryColor}60`,
                          backgroundColor: `${selectedCategoryColor}15`,
                        }}
                      >
                        <span
                          className="flex h-4 w-4 items-center justify-center rounded text-[8px] font-bold text-white"
                          style={{ backgroundColor: selectedCategoryColor }}
                        >
                          {abbreviate(selectedCategory.name)}
                        </span>
                        {selectedCategory.name}
                        <X size={10} className="opacity-50" />
                      </button>
                    );
                  })()}
                  {selectedTaskType && (
                    <button
                      onClick={onClearTaskType}
                      className="flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-xs font-medium text-black transition-opacity hover:opacity-70"
                    >
                      {TASK_TYPE_LABEL[selectedTaskType]}
                      <X size={10} className="opacity-50" />
                    </button>
                  )}
                </div>
              )}

              {selectedCategory && !showMenu && (
                <CategoryTasksList
                  tasks={categoryTasks}
                  isLoading={isFetchingTasks}
                  categoryName={selectedCategory.name}
                  categoryColor={getCategoryColor(selectedCategory.id)}
                />
              )}

              {createError && (
                <p className="text-xs text-red-600">{createError}</p>
              )}
            </div>

            <div className="flex items-center justify-between border-t px-4 py-3">
              <p className="text-xs text-muted-foreground">
                {selectedCategory ? (
                  <span style={{ color: getCategoryColor(selectedCategory.id) }}>{selectedCategory.name}</span>
                ) : (
                  "/ for category"
                )}
                {selectedTaskType && (
                  <>
                    {" "}
                    · <span>{TASK_TYPE_LABEL[selectedTaskType]}</span>
                  </>
                )}
              </p>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => onOpenChange(false)}
                  className="text-black"
                >
                  Cancel
                </Button>
                <Button
                  size="sm"
                  disabled={!text.trim() || !selectedCategory || isCreatingTask}
                  onClick={onAdd}
                >
                  {isCreatingTask && (
                    <Loader2 className="mr-1 h-3 w-3 animate-spin" />
                  )}
                  {isCreatingTask ? "Adding…" : "Add Task"}
                </Button>
              </div>
            </div>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}
