import FormFieldInput from "@/components/basic/FormFieldInput";
import { NoteMarkdown } from "@/components/note/NoteMarkdown";
import { format } from "date-fns";
import { Check, FileText, Loader2, Pencil, Trash2, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Form
} from "@/components/ui/form";
import { useNoteContext } from "@/context/NoteContext/NoteContextProvider";
import { useEffect, useMemo, useState } from "react";
import { useForm } from "react-hook-form";
import { ConfirmActionDialog } from "../dialog/ConfirmActionDialog";
import { useParams } from "react-router-dom";
import FormFieldTextarea from "../basic/FormFieldTextarea";

const fieldClass =
  "border-primary/20 bg-background/85 text-foreground shadow-inner shadow-primary/5 backdrop-blur focus-visible:border-primary/45 focus-visible:ring-2 focus-visible:ring-primary/25";

type NoteEditValues = {
  title: string;
  content: string;
};

export function NoteListPanel() {
  const [noteIdToDelete, setNoteIdToDelete] = useState<string | null>(null);
  const [editingNoteId, setEditingNoteId] = useState<string | null>(null);
  const { categoryId } = useParams<{ categoryId?: string }>();

  const editForm = useForm<NoteEditValues>({
    defaultValues: { title: "", content: "" },
  });

  const {
    notes,
    deletingNoteId,
    updatingNoteId,
    isFetching: isNoteFetching,
    updateNote,
    deleteNotes,
  } = useNoteContext();

  useEffect(() => {
    setEditingNoteId(null);
    editForm.reset({ title: "", content: "" });
  }, [categoryId]);

  useEffect(() => {
    if (!updatingNoteId) {
      cancelEditing();
    }
  }, [updatingNoteId]);

  const notePendingDelete = useMemo(
    () =>
      noteIdToDelete ? notes.find((n) => n.id === noteIdToDelete) : undefined,
    [noteIdToDelete, notes],
  );

  const handleDeleteNote = async (noteId: string) => {
    if (!categoryId) return;
    await deleteNotes([noteId], categoryId);
  };

  const startEditing = (note: { id: string; title: string; content: string }) => {
    setEditingNoteId(note.id);
    editForm.clearErrors();
    editForm.reset({ title: note.title, content: note.content });
  };

  const cancelEditing = () => {
    setEditingNoteId(null);
    editForm.reset({ title: "", content: "" });
  };

  const onSaveEdit = async (data: NoteEditValues) => {
    if (!categoryId || !editingNoteId) return;

    const title = data.title.trim();
    const content = data.content.trim();

    if (!title) {
      editForm.setError("title", {
        type: "manual",
        message: "Title is required.",
      });
      return;
    }

    if (!content) {
      editForm.setError("content", {
        type: "manual",
        message: "Markdown content is required.",
      });
      return;
    }

    editForm.clearErrors();
   await updateNote(editingNoteId, { title, content }, categoryId);
  };

  return (
    <div className="flex flex-col gap-3 p-3 md:p-4">
      {!isNoteFetching && notes.length === 0 && (
        <div className="flex min-h-[60vh] items-center justify-center p-4 md:p-6">
          <div className="flex w-full max-w-md flex-col items-center justify-center">
            <div className="flex w-full flex-col items-center justify-center rounded-2xl border border-primary/20 bg-primary/5 px-6 py-8 text-center shadow-md shadow-primary/10 backdrop-blur-sm dark:bg-primary/10">
              <div
                className="mb-4 flex h-14 w-14 items-center justify-center rounded-2xl border border-primary/25 bg-primary/15 text-primary shadow-inner shadow-primary/10"
                aria-hidden
              >
                <FileText className="h-7 w-7" />
              </div>

              <p className="text-base font-semibold tracking-tight text-foreground">
                No notes yet
              </p>

              <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                Write in Markdown below. Use the preview to check formatting
                before you save.
              </p>
            </div>
          </div>
        </div>
      )}

      {notes.map((note) => {
        const isDeletingThis = deletingNoteId === note.id;
        const isUpdatingThis = updatingNoteId === note.id;
        const isEditingThis = editingNoteId === note.id;
        const cardBusy = isDeletingThis || isUpdatingThis;

        return (
          <div key={note.id} className="mb-6 flex justify-end">
            <div className="w-full max-w-2xl">
              <div
                className={`rounded-2xl border border-primary/25 bg-card/90 px-4 py-3 text-card-foreground shadow-md backdrop-blur-sm transition ${cardBusy ? "opacity-90" : "hover:shadow-lg"}`}
                aria-busy={cardBusy}
              >
                <div className="flex items-start gap-3">
                  <div className="min-w-0 flex-1">
                    {isEditingThis ? (
                      <Form {...editForm}>
                        <form
                          className="flex flex-col gap-2"
                          onSubmit={editForm.handleSubmit(onSaveEdit)}
                        >
                          <FormFieldInput
                            form={editForm}
                            name="title"
                            placeholder="Note title"
                            disabled={isUpdatingThis}
                            className={`h-9 ${fieldClass}`}
                          />

                          <FormFieldTextarea
                            form={editForm}
                            name="content"
                            placeholder="Note content"
                            disabled={isUpdatingThis}
                            className={`h-48 ${fieldClass}`}
                          />

                          <div className="flex flex-wrap items-center gap-2">
                            <Button
                              type="submit"
                              size="sm"
                              disabled={
                                isUpdatingThis ||
                                !(editForm.watch("title") ?? "").trim()
                                  .length ||
                                !(editForm.watch("content") ?? "").trim()
                                  .length
                              }
                            >
                              {isUpdatingThis ? (
                                <Loader2 className="animate-spin" size={16} />
                              ) : (
                                <Check size={16} />
                              )}
                              Save changes
                            </Button>
                            <Button
                              type="button"
                              variant="outline"
                              size="sm"
                              disabled={isUpdatingThis}
                              onClick={cancelEditing}
                            >
                              <X size={16} />
                              Cancel
                            </Button>
                          </div>
                        </form>
                      </Form>
                    ) : (
                      <>
                        <div className="px-2 pt-2">
                          <p className="text-xl font-semibold tracking-tight text-foreground leading-tight">
                            {note.title}
                          </p>

                          <p className="mt-0.5 text-xs text-muted-foreground">
                            {format(new Date(note.createdAt), "EEE, MMM d")}
                          </p>
                        </div>
                        <div className="mt-3 w-full min-w-0">
                          <NoteMarkdown source={note.content} />
                        </div>
                      </>
                    )}
                    {isDeletingThis && (
                      <p className="mt-2 flex items-center gap-1.5 text-xs text-muted-foreground">
                        <Loader2
                          className="shrink-0 animate-spin"
                          size={14}
                          aria-hidden
                        />
                        <span>Deleting note…</span>
                      </p>
                    )}
                  </div>

                  {!isEditingThis ? (
                    <div className="flex shrink-0 flex-col gap-0.5 sm:flex-row">
                      <Button
                        variant="ghost"
                        type="button"
                        disabled={
                          cardBusy ||
                          updatingNoteId !== null ||
                          editingNoteId !== null
                        }
                        onClick={() => startEditing(note)}
                        className="cursor-pointer text-muted-foreground hover:text-foreground disabled:pointer-events-none disabled:opacity-40"
                        aria-label="Edit note"
                      >
                        <Pencil size={16} />
                      </Button>
                      <Button
                        variant="ghost"
                        type="button"
                        disabled={cardBusy}
                        onClick={() => setNoteIdToDelete(note.id)}
                        className="cursor-pointer text-red-600 hover:text-red-500 disabled:pointer-events-none disabled:opacity-40"
                        aria-label="Delete note"
                      >
                        <Trash2 size={16} />
                      </Button>
                    </div>
                  ) : null}
                </div>
              </div>
            </div>
          </div>
        );
      })}
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
    </div>
  );
}
