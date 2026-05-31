import {
  ImageKitAbortError,
  ImageKitInvalidRequestError,
  ImageKitServerError,
  ImageKitUploadNetworkError,
  upload,
} from "@imagekit/react";
import { useCallback, useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { useParams } from "react-router-dom";
import { toast } from "react-toastify";
import imageKitExtensionService from "@/extension-services/imagekit.services";
import { useTaskContext } from "@/context/TaskContext/TaskContextProvider";
import { isApiResponse } from "@/lib/typeGuard";
import {
  TaskComposerBar,
  type PastedImageItem,
  type TaskComposerValues,
} from "@/components/task/task-composer/presentation/TaskComposerBar";
import {
  TaskStatus,
  TaskType,
  type TaskAttachmentInput,
} from "@/types/task";
import type { ImageKitAuthParams } from "@/types/imagekit";

export function TaskComposerBarContainer() {
  const { categoryId } = useParams<{ categoryId?: string }>();

  const taskForm = useForm<TaskComposerValues>({
    defaultValues: { name: "" },
  });

  const {
    isCreating: isTaskCreating,
    updatingTaskId,
    deletingTaskId,
    createTask,
  } = useTaskContext();

  const [submitError, setSubmitError] = useState<string | null>(null);
  const [pastedImages, setPastedImages] = useState<PastedImageItem[]>([]);
  const [removingImageId, setRemovingImageId] = useState<string | null>(null);
  const [selectedType, setSelectedType] = useState<TaskType>(TaskType.Normal);

  useEffect(() => {
    taskForm.reset({ name: "" });
    setPastedImages([]);
    setSubmitError(null);
  }, [categoryId, taskForm]);

  const fetchImageKitAuth =
    useCallback(async (): Promise<ImageKitAuthParams> => {
      const res =
        await imageKitExtensionService.getAuthParameters<ImageKitAuthParams>();
      if (!isApiResponse(res)) {
        throw new Error(res.errorMessage ?? "ImageKit authentication failed");
      }
      return res.data;
    }, []);

  const uploadPastedImage = useCallback(
    async (file: File, id: string) => {
      const abortController = new AbortController();

      const fail = (message: string) => {
        setPastedImages((prev) =>
          prev.map((p) =>
            p.id === id
              ? { ...p, status: "error" as const, error: message, progress: 0 }
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
              prev.map((p) => (p.id === id ? { ...p, progress: pct } : p)),
            );
          },
          abortSignal: abortController.signal,
        });

        const remoteUrl = uploadResponse.url;
        const fileId = uploadResponse.fileId;

        if (!remoteUrl) {
          fail("Upload finished without a file URL");
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
        if (
          error instanceof ImageKitInvalidRequestError ||
          error instanceof ImageKitUploadNetworkError ||
          error instanceof ImageKitServerError ||
          error instanceof Error
        ) {
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
    if (files.length === 0) return;
    if (pastedImages.length + files.length > 3) {
      toast.error("You can only paste up to 3 images at a time");
      return;
    }
    e.preventDefault();
    for (const file of files) {
      const id = crypto.randomUUID();
      setPastedImages((prev) => [
        ...prev,
        { id, progress: 0, status: "uploading" },
      ]);
      void uploadPastedImage(file, id);
    }
  };

  const removePastedImage = useCallback(
    async (id: string) => {
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
    },
    [pastedImages],
  );

  const handleSubmit = async (values: TaskComposerValues) => {
    if (!categoryId) {
      setSubmitError("Select a category before adding tasks.");
      return;
    }

    const name = values.name.trim();
    if (!name) return;

    if (pastedImages.some((p) => p.status === "uploading")) {
      setSubmitError("Wait for images to finish uploading before sending.");
      return;
    }

    const attachments: TaskAttachmentInput[] = pastedImages
      .filter(
        (p): p is PastedImageItem & { remoteUrl: string } =>
          p.status === "done" && Boolean(p.remoteUrl),
      )
      .map((p) => ({ url: p.remoteUrl, fileId: p.fileId }));

    const response = await createTask(
      name,
      selectedType,
      TaskStatus.Pending,
      categoryId,
      attachments,
    );
    if (isApiResponse(response) && response.success) {
      taskForm.reset({ name: "" });
      setPastedImages([]);
      setSubmitError(null);
    }
  };

  const isUploading = pastedImages.some((p) => p.status === "uploading");
  const isTaskActionInProgress =
    isTaskCreating || updatingTaskId !== null || deletingTaskId !== null;

  return (
    <TaskComposerBar
      form={taskForm}
      pastedImages={pastedImages}
      removingImageId={removingImageId}
      submitError={submitError}
      isTaskActionInProgress={isTaskActionInProgress}
      isUploading={isUploading}
      isSubmitting={isTaskCreating}
      selectedType={selectedType}
      onTypeChange={setSelectedType}
      onPaste={handlePaste}
      onRemoveImage={(id) => void removePastedImage(id)}
      onSubmit={handleSubmit}
    />
  );
}
