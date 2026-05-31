import { Loader2, Send, X } from "lucide-react";
import type { ClipboardEvent } from "react";
import type { UseFormReturn } from "react-hook-form";
import { Button } from "@/components/ui/button";
import { Form } from "@/components/ui/form";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import FormFieldTextarea from "@/components/basic/FormFieldTextarea";
import { cn } from "@/lib/utils";
import { TaskType } from "@/types/task";

export type TaskComposerValues = {
  name: string;
};

export type PastedImageItem = {
  id: string;
  progress: number;
  status: "uploading" | "done" | "error";
  remoteUrl?: string;
  fileId?: string;
  error?: string;
};

export type TaskComposerBarProps = {
  form: UseFormReturn<TaskComposerValues>;
  pastedImages: PastedImageItem[];
  removingImageId: string | null;
  submitError: string | null;
  isTaskActionInProgress: boolean;
  isUploading: boolean;
  isSubmitting: boolean;
  selectedType: TaskType;
  onTypeChange: (type: TaskType) => void;
  onPaste: (event: ClipboardEvent<HTMLTextAreaElement>) => void;
  onRemoveImage: (id: string) => void;
  onSubmit: (values: TaskComposerValues) => void | Promise<void>;
};

const TYPE_PILLS: {
  value: TaskType;
  label: string;
  pillClass: string;
}[] = [
  {
    value: TaskType.Normal,
    label: "normal",
    pillClass:
      "bg-white/[4%] text-amber-500/60 hover:bg-white/[8%] hover:text-amber-400 data-[state=on]:border-amber-500/35 data-[state=on]:bg-amber-500/15 data-[state=on]:text-amber-400",
  },
  {
    value: TaskType.Critical,
    label: "critical",
    pillClass:
      "bg-white/[4%] text-red-500/60 hover:bg-white/[8%] hover:text-red-400 data-[state=on]:border-red-500/35 data-[state=on]:bg-red-500/15 data-[state=on]:text-red-400",
  },
];

export function TaskComposerBar({
  form,
  pastedImages,
  removingImageId,
  submitError,
  isTaskActionInProgress,
  isUploading,
  isSubmitting,
  selectedType,
  onTypeChange,
  onPaste,
  onRemoveImage,
  onSubmit,
}: TaskComposerBarProps) {
  const taskName = form.watch("name") ?? "";
  const isSubmitDisabled =
    !taskName.trim().length ||
    isTaskActionInProgress ||
    isUploading;

  return (
    <div className="border-t border-white/6 bg-[#09090f] px-4 py-3">
      <Form {...form}>
        <form
          onSubmit={form.handleSubmit((data) => onSubmit(data))}
          className="flex flex-col gap-2"
        >
          {pastedImages.length > 0 && (
            <div className="flex flex-row gap-2 overflow-x-auto">
              {pastedImages.map((item) => (
                <div key={item.id} className="relative shrink-0">
                  <div className="relative flex h-20 w-20 items-center justify-center overflow-hidden rounded-lg border border-white/10 bg-white/4">
                    {item.status === "uploading" && (
                      <div className="flex flex-col items-center justify-center text-zinc-500">
                        <Loader2 className="mb-0.5 size-4 animate-spin" />
                        <span className="text-[10px]">
                          {Math.round(item.progress)}%
                        </span>
                      </div>
                    )}
                    {item.status === "done" && item.remoteUrl && (
                      <img
                        src={item.remoteUrl}
                        alt="Pasted attachment"
                        className="h-full w-full object-cover"
                      />
                    )}
                    {item.status === "error" && (
                      <div className="flex h-full w-full items-center justify-center text-[10px] text-red-500">
                        Failed
                      </div>
                    )}
                    <Button
                      type="button"
                      variant="outline"
                      size="icon-xs"
                      className="absolute top-1 right-1 z-10 size-5 rounded-full border-white/10 bg-black/60 text-zinc-300 shadow-sm hover:bg-black/80"
                      disabled={
                        removingImageId === item.id ||
                        item.status === "uploading"
                      }
                      onClick={() => onRemoveImage(item.id)}
                      aria-label="Remove image"
                    >
                      {removingImageId === item.id ? (
                        <Loader2 className="size-2.5 animate-spin" />
                      ) : (
                        <X className="size-2.5" />
                      )}
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}

          <div className="flex items-start gap-2">
            <div className="min-w-0 flex-1">
              <FormFieldTextarea
                form={form}
                name="name"
                placeholder="Add a task…"
                rows={1}
                onPaste={onPaste}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && !e.shiftKey) {
                    e.preventDefault();
                    e.currentTarget.form?.requestSubmit();
                  }
                }}
                className="h-auto min-h-10 rounded-lg border-white/8 bg-white/4 font-mono text-xs text-zinc-100 placeholder:text-zinc-600 focus-visible:border-white/20 focus-visible:ring-0"
              />
            </div>
            <Button
              type="submit"
              disabled={isSubmitDisabled}
              className="h-10 rounded-lg bg-indigo-500/90 px-5 text-sm font-semibold text-white hover:bg-indigo-500 disabled:opacity-40"
            >
              {isSubmitting ? (
                <Loader2 className="size-4 animate-spin" aria-hidden />
              ) : (
                <Send className="size-4" aria-hidden />
              )}
              Add
            </Button>
          </div>

          <div className="flex items-center gap-2 pl-1">
            <span className="font-mono text-[10px] font-bold tracking-[0.18em] text-zinc-600 uppercase">
              Priority
            </span>
            <ToggleGroup
              type="single"
              value={selectedType}
              onValueChange={(v) => v && onTypeChange(v as TaskType)}
              className="gap-1"
            >
              {TYPE_PILLS.map((pill) => (
                <ToggleGroupItem
                  key={pill.value}
                  value={pill.value}
                  aria-label={pill.label}
                  className={cn(
                    "h-6 rounded-full border border-transparent px-2.5 font-mono text-[10px] font-bold tracking-wider transition",
                    pill.pillClass,
                  )}
                >
                  {pill.label}
                </ToggleGroupItem>
              ))}
            </ToggleGroup>
          </div>

          {submitError && (
            <div className="text-xs text-red-500">{submitError}</div>
          )}
        </form>
      </Form>
    </div>
  );
}
