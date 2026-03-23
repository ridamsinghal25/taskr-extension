import FormFieldInput from "@/components/basic/FormFieldInput";
import { NoteMarkdown } from "@/components/note/NoteMarkdown";
import { Button } from "@/components/ui/button";
import { Form, FormControl, FormField, FormItem, FormMessage } from "@/components/ui/form";
import { ClipboardList, Loader2, Send } from "lucide-react";
import type { UseFormReturn } from "react-hook-form";

export type NoteComposerValues = {
  title: string;
  content: string;
};

type Props = {
  form: UseFormReturn<NoteComposerValues>;
  categoryId: string;
  noteError: string | null;
  isNoteActionInProgress: boolean;
  isNoteCreating: boolean;
  onSubmit: (title: string, content: string) => Promise<boolean>;
  onSwitchToTasks: () => void;
};

export function NoteComposerBar({
  form,
  categoryId,
  noteError,
  isNoteActionInProgress,
  isNoteCreating,
  onSubmit,
  onSwitchToTasks,
}: Props) {
  const chatFooterClass =
    "border-t border-primary/20 bg-linear-to-t from-primary/6 to-primary/2 px-4 py-3 backdrop-blur-md dark:from-primary/10 dark:to-primary/5 dark:border-primary/25";

  const contentWatch = form.watch("content") ?? "";

  return (
    <div className={chatFooterClass}>
      <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
        <Button
          type="button"
          variant="ghost"
          size="sm"
          className="h-8 text-xs text-muted-foreground hover:text-foreground"
          onClick={onSwitchToTasks}
        >
          <ClipboardList className="mr-1.5 h-3.5 w-3.5 opacity-70" />
          Switch to tasks
        </Button>
      </div>

      <Form {...form}>
        <form
          onSubmit={form.handleSubmit((data) =>
            onSubmit(data.title, data.content).then((success) => {
              if (success) {
                form.reset({ title: "", content: "" });
              }
            }),
          )}
          className="flex flex-col gap-3"
        >
          <FormFieldInput
            form={form}
            name="title"
            placeholder="Note title"
            className="h-9 border-primary/20 bg-background/85 text-foreground shadow-inner shadow-primary/5 backdrop-blur focus-visible:border-primary/45 focus-visible:ring-2 focus-visible:ring-primary/25"
          />

          <FormField
            control={form.control}
            name="content"
            render={({ field, fieldState }) => (
              <FormItem>
                <FormControl>
                  <textarea
                    placeholder="Markdown content — headings, lists, code blocks…"
                    rows={5}
                    className="flex min-h-[120px] w-full resize-y rounded-md border border-primary/20 bg-background/85 px-3 py-2 text-sm text-foreground shadow-inner shadow-primary/5 backdrop-blur outline-none focus-visible:border-primary/45 focus-visible:ring-2 focus-visible:ring-primary/25 disabled:cursor-not-allowed disabled:opacity-50"
                    {...field}
                  />
                </FormControl>
                <FormMessage
                  className={fieldState.error ? "dark:text-red-500" : undefined}
                />
              </FormItem>
            )}
          />

          <div className="rounded-lg border border-primary/15 bg-background/60 p-3 shadow-inner shadow-primary/5">
            <p className="mb-2 text-xs font-medium text-muted-foreground">
              Preview
            </p>
            {contentWatch.trim() ? (
              <NoteMarkdown source={contentWatch} />
            ) : (
              <p className="text-xs italic text-muted-foreground">
                Preview appears as you type Markdown…
              </p>
            )}
          </div>

          <div className="flex items-center gap-2">
            <Button
              type="submit"
              disabled={
                !categoryId ||
                !(form.watch("title") ?? "").trim().length ||
                !(form.watch("content") ?? "").trim().length ||
                isNoteActionInProgress
              }
            >
              {isNoteCreating ? (
                <Loader2 className="animate-spin" size={18} />
              ) : (
                <Send size={18} />
              )}
              Save note
            </Button>
          </div>

          {noteError && (
            <div className="text-xs text-destructive">{noteError}</div>
          )}
        </form>
      </Form>
    </div>
  );
}
