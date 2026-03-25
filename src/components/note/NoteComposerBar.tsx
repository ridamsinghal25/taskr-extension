import FormFieldInput from "@/components/basic/FormFieldInput";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormMessage,
} from "@/components/ui/form";
import { useNoteContext } from "@/context/NoteContext/NoteContextProvider";
import { ClipboardList, Loader2, Send } from "lucide-react";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { useParams } from "react-router-dom";

export type NoteComposerValues = {
  title: string;
  content: string;
};

type Props = {
  onSwitchToTasks: () => void;
};

const chatFooterClass =
  "border-t border-primary/20 bg-linear-to-t from-primary/6 to-primary/2 px-4 py-3 backdrop-blur-md dark:from-primary/10 dark:to-primary/5 dark:border-primary/25";

export function NoteComposerBar({ onSwitchToTasks }: Props) {
  const [noteError, setNoteError] = useState<string | null>(null);
  let { categoryId } = useParams<{ categoryId?: string }>();

  const noteForm = useForm<NoteComposerValues>({
    defaultValues: { title: "", content: "" },
  });

  useEffect(() => {
    noteForm.reset({ title: "", content: "" });
  }, [categoryId]);

  const {
    isCreating: isNoteCreating,
    deletingNoteId,
    updatingNoteId,
    createNote,
    isNoteComposerVisible,
    setIsNoteComposerVisible,
  } = useNoteContext();

    useEffect(() => {
      const handleKeyDown = (event: KeyboardEvent) => {
        if (event.key === "Escape") {
          setIsNoteComposerVisible(false);
        }

        if (event.shiftKey && event.key.toLowerCase() === "o") {
          setIsNoteComposerVisible((prev: boolean) => (!prev));
        }
      };

      window.addEventListener("keydown", handleKeyDown);

      return () => {
        window.removeEventListener("keydown", handleKeyDown);
      };
    }, []);

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

  const isNoteActionInProgress =
    isNoteCreating || deletingNoteId !== null || updatingNoteId !== null;

  return (
    <div className={chatFooterClass}>
      <div className={`${isNoteComposerVisible ? "mb-3" : ""} flex flex-wrap items-center justify-between gap-2`}>
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
        <Button
          type="button"
          variant="outline"
          size="sm"
          className="h-8 text-xs text-muted-foreground hover:text-foreground"
          onClick={() => setIsNoteComposerVisible(!isNoteComposerVisible)}
        >
          {isNoteComposerVisible ? "Close" : "Open"}
        </Button>
      </div>

    {isNoteComposerVisible && (
      <Form {...noteForm}>
        <form
          onSubmit={noteForm.handleSubmit((data) =>
            handleNoteSubmit(data.title, data.content).then((success) => {
              if (success) {
                noteForm.reset({ title: "", content: "" });
              }
            }),
          )}
          className="flex flex-col gap-3"
        >
          <FormFieldInput
            form={noteForm}
            name="title"
            placeholder="Note title"
            className="h-9 border-primary/20 bg-background/85 text-foreground shadow-inner shadow-primary/5 backdrop-blur focus-visible:border-primary/45 focus-visible:ring-2 focus-visible:ring-primary/25"
          />

          <FormField
            control={noteForm.control}
            name="content"
            render={({ field, fieldState }) => (
              <FormItem>
                <FormControl>
                  <textarea
                    placeholder="Markdown content — headings, lists, code blocks…"
                    rows={5}
                    className="flex min-h-20 h-20 w-full resize-y rounded-md border border-primary/20 bg-background/85 px-3 py-2 text-sm text-foreground shadow-inner shadow-primary/5 backdrop-blur outline-none focus-visible:border-primary/45 focus-visible:ring-2 focus-visible:ring-primary/25 disabled:cursor-not-allowed disabled:opacity-50"
                    {...field}
                  />
                </FormControl>
                <FormMessage
                  className={fieldState.error ? "dark:text-red-500" : undefined}
                />
              </FormItem>
            )}
          />

          <div className="flex items-center gap-2">
            <Button
              type="submit"
              disabled={
                !categoryId ||
                !(noteForm.watch("title") ?? "").trim().length ||
                !(noteForm.watch("content") ?? "").trim().length ||
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
      )}
    </div>
  );
}
