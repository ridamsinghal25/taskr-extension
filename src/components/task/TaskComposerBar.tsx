import FormFieldInput from "@/components/basic/FormFieldInput";
import { Button } from "@/components/ui/button";
import { Form } from "@/components/ui/form";
import { Loader2, Send } from "lucide-react";
import type { UseFormReturn } from "react-hook-form";

export type TaskComposerValues = {
  command: string;
};

type Props = {
  form: UseFormReturn<TaskComposerValues>;
  categoryId: string;
  commandError: string | null;
  isTaskActionInProgress: boolean;
  isTaskCreating: boolean;
  onSubmit: (command: string) => Promise<boolean>;
};

export function TaskComposerBar({
  form,
  categoryId,
  commandError,
  isTaskActionInProgress,
  isTaskCreating,
  onSubmit,
}: Props) {
  const chatFooterClass =
    "border-t border-primary/20 bg-linear-to-t from-primary/6 to-primary/2 px-4 py-3 backdrop-blur-md dark:from-primary/10 dark:to-primary/5 dark:border-primary/25";

  return (
    <div className={chatFooterClass}>
      <Form {...form}>
        <form
          onSubmit={form.handleSubmit((data) =>
            onSubmit(data.command).then((success) => {
              if (success) {
                form.reset({ command: "" });
              }
            }),
          )}
          className="flex flex-col gap-2"
        >
          <div className="flex items-start gap-2">
            <div className="min-w-0 flex-1">
              <FormFieldInput
                form={form}
                name="command"
                placeholder="Task name — optional: -t normal|critical -s pending|in_progress|done|archived — or send n / note for notes"
                className="h-auto min-h-9 border-primary/20 bg-background/85 py-2 text-foreground shadow-inner shadow-primary/5 backdrop-blur focus-visible:border-primary/45 focus-visible:ring-2 focus-visible:ring-primary/25"
              />
            </div>

            <Button
              type="submit"
              disabled={
                !categoryId ||
                !(form.watch("command") ?? "").trim().length ||
                isTaskActionInProgress
              }
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
