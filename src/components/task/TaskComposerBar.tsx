import { Button } from "@/components/ui/button";
import { Form } from "@/components/ui/form";
import { useTaskContext, type TaskApiResult } from "@/context/TaskContext/TaskContextProvider";
import {
  isTaskStatusValue,
  isTaskTypeValue,
  TASK_STATUS_OPTIONS,
  TASK_TYPE_OPTIONS,
} from "@/lib/task/task.constants";
import imageKitExtensionService from "@/extension-services/imagekit.services";
import { isApiResponse } from "@/lib/typeGuard";
import {
  TaskStatus,
  TaskType,
  type Task,
  type TaskAttachmentInput,
} from "@/types/task";
import type { ImageKitAuthParams } from "@/types/imagekit";
import {
  ImageKitAbortError,
  ImageKitInvalidRequestError,
  ImageKitServerError,
  ImageKitUploadNetworkError,
  upload,
} from "@imagekit/react";
import { cn } from "@/lib/utils";
import { Loader2, Send, X } from "lucide-react";
import { useCallback, useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { useParams } from "react-router-dom";
import FormFieldTextarea from "../basic/FormFieldTextarea";
import { toast } from "react-toastify";

export type TaskComposerValues = {
  command: string;
};

type PastedImageItem = {
  id: string;
  progress: number;
  status: "uploading" | "done" | "error";
  remoteUrl?: string;
  fileId?: string;
  error?: string;
};

const chatFooterClass =
  "border-t border-primary/20 bg-linear-to-t from-primary/6 to-primary/2 px-4 py-3 backdrop-blur-md dark:from-primary/10 dark:to-primary/5 dark:border-primary/25";

export function TaskComposerBar() {
  const [commandError, setCommandError] = useState<string | null>(null);
  let { categoryId } = useParams<{ categoryId?: string }>();
  const [pastedImages, setPastedImages] = useState<PastedImageItem[]>([]);
  const [removingImageId, setRemovingImageId] = useState<string | null>(null);

  const fetchImageKitAuth = useCallback(async (): Promise<ImageKitAuthParams> => {
    const res = await imageKitExtensionService.getAuthParameters<ImageKitAuthParams>();

    if (!isApiResponse(res)) {
      throw new Error(res.errorMessage ?? "ImageKit authentication failed");
    }

    return res.data;
  }, []);

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
    attachments: TaskAttachmentInput[],
  ): Promise<TaskApiResult<Task>> => {
    if (!categoryId) return;
    return createTask(name, type, status, categoryId, attachments);
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

    if (pastedImages.some((p) => p.status === "uploading")) {
      setCommandError("Wait for images to finish uploading before sending.");
      return false;
    }

    const attachments: TaskAttachmentInput[] = pastedImages
      .filter(
        (p): p is PastedImageItem & { remoteUrl: string } =>
          p.status === "done" && Boolean(p.remoteUrl),
      )
      .map((p) => ({ url: p.remoteUrl, fileId: p.fileId }));

    const response = await handleCreateTask(name, type, status, attachments);
    if (isApiResponse(response) && response.success) {
      setPastedImages([]);
      setCommandError(null);
      setRemovingImageId(null);
      return true;
    }
    return false;
  };

  const removePastedImage = useCallback(async (id: string) => {
    const item = pastedImages.find((p) => p.id === id);
    if (!item) return;

    setRemovingImageId(id);
    try {
      if (item.fileId) {
        const res = await imageKitExtensionService.bulkDeleteFiles<unknown>([
          item.fileId,
        ]);
        if (!isApiResponse(res) || !res.success) {
          toast.error(
            !isApiResponse(res)
              ? (res.errorMessage ?? "Failed to delete image")
              : (res.message || "Failed to delete image"),
          );
          return;
        }
      }

      setPastedImages((prev) => prev.filter((p) => p.id !== id));
    } finally {
      setRemovingImageId(null);
    }
  }, [pastedImages]);

  const uploadPastedImage = useCallback(
    async (file: File, id: string) => {
      const abortController = new AbortController();

      const fail = (message: string) => {
        setPastedImages((prev) =>
          prev.map((p) =>
            p.id === id
              ? {
                  ...p,
                  status: "error" as const,
                  error: message,
                  progress: 0,
                }
              : p,
          ),
        );
      };

      try {
        const auth = await fetchImageKitAuth();

        const { signature, expire, token, publicKey } = auth;

        const expireSec = Number(expire);

        if (!Number.isFinite(expireSec)) {
          fail("Invalid ImageKit auth expiry from server");
          return;
        }

        const uploadResponse = await upload({
          expire: expireSec,
          token,
          signature,
          publicKey,
          file,
          fileName: file.name || `paste-${Date.now()}.png`,
          onProgress: (event) => {
            const pct =
              event.total > 0 ? (event.loaded / event.total) * 100 : 0;
            setPastedImages((prev) =>
              prev.map((p) =>
                p.id === id ? { ...p, progress: pct } : p,
              ),
            );
          },
          abortSignal: abortController.signal,
        });

        const remoteUrl = uploadResponse.url;
        const fileId = uploadResponse.fileId;

        if (!remoteUrl) {
          setPastedImages((prev) =>
            prev.map((p) =>
              p.id === id
                ? {
                    ...p,
                    status: "error" as const,
                    error: "Upload finished without a file URL",
                    progress: 0,
                  }
                : p,
            ),
          );
          return;
        }

        setPastedImages((prev) =>
          prev.map((p) =>
            p.id === id
              ? {
                  ...p,
                  status: "done" as const,
                  remoteUrl,
                  fileId,
                  progress: 100,
                }
              : p,
          ),
        );
      } catch (error) {
        if (error instanceof ImageKitAbortError) {
          setPastedImages((prev) => prev.filter((p) => p.id !== id));
          return;
        }
        if (error instanceof ImageKitInvalidRequestError) {
          fail(error.message);
        } else if (error instanceof ImageKitUploadNetworkError) {
          fail(error.message);
        } else if (error instanceof ImageKitServerError) {
          fail(error.message);
        } else if (error instanceof Error) {
          fail(error.message);
        } else {
          fail("Upload failed");
        }
      }
    },
    [fetchImageKitAuth],
  );

  const handlePaste = (e: React.ClipboardEvent<HTMLTextAreaElement>) => {
    const items = e.clipboardData.items;
    const files: File[] = [];

    for (let i = 0; i < items.length; i++) {
      const item = items[i];
      if (item.type.startsWith("image/")) {
        const file = item.getAsFile();
        if (file) files.push(file);
      }
    }

    if (files.length === 0) {
      return;
    }

    if (pastedImages.length + files.length > 3) {
      toast.error("You can only paste up to 3 images at a time");
      return;
    }

    e.preventDefault();

    for (const file of files) {
      const id = crypto.randomUUID();
      setPastedImages((prev) => [
        ...prev,
        {
          id,
          progress: 0,
          status: "uploading",
        },
      ]);

      void uploadPastedImage(file, id);
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
              <div className="mt-2 flex flex-row gap-3 overflow-x-auto">
                {pastedImages.map((item) => (
                  <div
                    key={item.id}
                    className="relative shrink-0"
                  >
                    <div
                      className={cn(
                        "relative flex items-center justify-center overflow-hidden rounded-lg border bg-muted",
                        "h-24 w-24"
                      )}
                    >
                      {/* Uploading → Skeleton */}
                      {item.status === "uploading" && (
                        <div className="absolute inset-0 animate-pulse bg-muted flex flex-col items-center justify-center">
                          <Loader2 className="size-5 animate-spin text-primary mb-0.5" />
                          <span className="text-[10px] text-muted-foreground">
                            {Math.round(item.progress)}%
                          </span>
                        </div>
                      )}

                      {/* Done */}
                      {item.status === "done" && item.remoteUrl && (
                        <img
                          src={item.remoteUrl}
                          alt="Pasted attachment"
                          className="h-full w-full object-cover"
                        />
                      )}

                      {/* Error */}
                      {item.status === "error" && (
                        <div className="flex h-full w-full items-center justify-center bg-muted/60 text-[10px] text-destructive">
                          Failed
                        </div>
                      )}

                      {/* Remove Button */}
                      <Button
                        type="button"
                        variant="outline"
                        size="icon-xs"
                        className="absolute right-1 top-1 z-10 size-6 rounded-full bg-background/90 shadow-sm disabled:opacity-50 disabled:cursor-not-allowed"
                        disabled={removingImageId === item.id || item.status === "uploading"}
                        onClick={() => void removePastedImage(item.id)}
                      >
                        {removingImageId === item.id ? (
                          <Loader2 className="size-3 animate-spin" />
                        ) : (
                          <X className="size-3" />
                        )}
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
              <FormFieldTextarea
                form={taskForm}
                name="command"
                placeholder="Task name — optional: -t normal|critical -s pending|in_progress|done|archived — or send n / note for notes"
                rows={1}
                onPaste={handlePaste}
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
                isTaskActionInProgress ||
                pastedImages.some((p) => p.status === "uploading")
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
