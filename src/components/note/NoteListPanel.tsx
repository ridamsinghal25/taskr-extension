import { NoteMarkdown } from "@/components/note/NoteMarkdown";
import { format } from "date-fns";
import { FileText, Loader2, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useNoteContext } from "@/context/NoteContext/NoteContextProvider";
import { useMemo, useState } from "react";
import { ConfirmActionDialog } from "../dialog/ConfirmActionDialog";
import { useParams } from "react-router-dom";

export function NoteListPanel() {
  const [noteIdToDelete, setNoteIdToDelete] = useState<string | null>(null);
  const { categoryId } = useParams<{ categoryId?: string }>();

  const {
    notes,
    deletingNoteId,
    isFetching: isNoteFetching,
    deleteNotes,
  } = useNoteContext();

  const notePendingDelete = useMemo(
    () =>
      noteIdToDelete ? notes.find((n) => n.id === noteIdToDelete) : undefined,
    [noteIdToDelete, notes],
  );

  const handleDeleteNote = async (noteId: string) => {
    if (!categoryId) return;
    await deleteNotes([noteId], categoryId);
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

        return (
          <div key={note.id} className="mb-6 flex justify-end">
            <div className="w-full max-w-md">
              <div
                className={`rounded-2xl border border-primary/25 bg-card/90 px-4 py-3 text-card-foreground shadow-md backdrop-blur-sm transition ${isDeletingThis ? "opacity-90" : "hover:shadow-lg"}`}
                aria-busy={isDeletingThis}
              >
                <div className="flex items-start gap-3">
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-semibold tracking-tight text-foreground">
                      {note.title}
                    </p>
                    <p className="mt-1 text-xs text-muted-foreground">
                      {format(new Date(note.createdAt), "EEE, MMM d")}
                    </p>
                    <div className="mt-3 border-t border-primary/15 pt-3">
                      <NoteMarkdown source={note.content} />
                    </div>
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

                  <Button
                    variant="ghost"
                    type="button"
                    disabled={isDeletingThis}
                    onClick={() => setNoteIdToDelete(note.id)}
                    className="shrink-0 cursor-pointer text-red-600 hover:text-red-500 disabled:pointer-events-none disabled:opacity-40"
                  >
                    <Trash2 size={16} />
                  </Button>
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
