import { Button } from "@/components/ui/button";
import { Form } from "@/components/ui/form";
import { useTaskContext, type TaskApiResult } from "@/context/TaskContext/TaskContextProvider";
import {
  isTaskStatusValue,
  isTaskTypeValue,
  TASK_STATUS_OPTIONS,
  TASK_TYPE_OPTIONS,
} from "@/lib/task/task.constants";
import { TaskStatus, TaskType, type Task } from "@/types/task";
import { Loader2, Send } from "lucide-react";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { useParams } from "react-router-dom";
import FormFieldTextarea from "../basic/FormFieldTextarea";
import { isApiResponse } from "@/lib/typeGuard";


export type TaskComposerValues = {
  command: string;
};

const chatFooterClass =
  "border-t border-primary/20 bg-linear-to-t from-primary/6 to-primary/2 px-4 py-3 backdrop-blur-md dark:from-primary/10 dark:to-primary/5 dark:border-primary/25";

export function TaskComposerBar() {
  const [commandError, setCommandError] = useState<string | null>(null);
  let { categoryId } = useParams<{ categoryId?: string }>();

  const taskForm = useForm<TaskComposerValues>({
    defaultValues: { command: "" },
  });

  useEffect(() => {
    taskForm.reset({ command: "" });
  }, [categoryId]);

  const {
    isCreating: isTaskCreating,
    updatingTaskId,
    deletingTaskId,
    createTask,
    setIsTaskMode
  } = useTaskContext();

  const handleCreateTask = async (
    name: string,
    type: TaskType,
    status: TaskStatus,
  ): Promise<TaskApiResult<Task>> => {
    if (!categoryId) return;
    const response = await createTask(name, type, status, categoryId);

    return response;
  };

  const handleCommandSubmit = async (command: string): Promise<boolean> => {
    if (!categoryId) {
      setCommandError("Select a category before adding tasks via command.");
      return false;
    }

    if (command.trim() === "n" || command.trim() === "note") {
      setIsTaskMode(false);
      return true;
    }

    const tokens = command.trim().split(/[ ]+/); // only spaces

    if (tokens.length === 0) {
      setCommandError(
        "Enter a task name. Example: Buy milk -t normal -s pending",
      );
      return false;
    }

    let type = TaskType.Normal;
    let status = TaskStatus.Pending;

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
      }
    }

    // ✅ preserve original formatting
    let name = command
      .replace(/-t\s+\w+/g, "")
      .replace(/-s\s+\w+/g, "")
      .trim();

    const response = await handleCreateTask(name, type, status);
    if (isApiResponse(response)) {
      return response.success;
    } else {
      return false;
    }
  };

  const isTaskActionInProgress =
    isTaskCreating || updatingTaskId !== null || deletingTaskId !== null;

  return (
    <div className={chatFooterClass}>
      <Form {...taskForm}>
        <form
          onSubmit={taskForm.handleSubmit((data) =>
            handleCommandSubmit(data.command).then((success) => {
              if (success) {
                taskForm.reset({ command: "" });
              }
            }),
          )}
          className="flex flex-col gap-2"
        >
          <div className="flex items-start gap-2">
            <div className="min-w-0 flex-1">
              <FormFieldTextarea
                form={taskForm}
                name="command"
                placeholder="Task name — optional: -t normal|critical -s pending|in_progress|done|archived — or send n / note for notes"
                rows={1}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && !e.shiftKey) {
                    e.preventDefault();
                    e.currentTarget.form?.requestSubmit();
                  }
                }}
                className="h-auto min-h-10 border-primary/20 bg-background/85 text-foreground shadow-inner shadow-primary/5 backdrop-blur focus-visible:border-primary/45 focus-visible:ring-2 focus-visible:ring-primary/25"
              />
            </div>

            <Button
              type="submit"
              disabled={
                !categoryId ||
                !(taskForm.watch("command") ?? "").trim().length ||
                isTaskActionInProgress
              }
              className="mt-2"
            >
              {isTaskCreating ? (
                <Loader2 className="animate-spin" size={18} />
              ) : (
                <Send size={18} />
              )}
              Send
            </Button>
          </div>

          {commandError && (
            <div className="text-xs text-destructive">{commandError}</div>
          )}
        </form>
      </Form>
    </div>
  );
}
