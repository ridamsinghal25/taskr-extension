import { createContext, type Dispatch, type SetStateAction } from "react";
import type { Note } from "@/types/note";

type NoteContextState = {
  notes: Note[];
  isFetching: boolean;
  isCreating: boolean;
  deletingNoteId: string | null;
  updatingNoteId: string | null;
  isNoteComposerVisible: boolean;
  setIsNoteComposerVisible: Dispatch<SetStateAction<boolean>>;
  fetchNotesByCategory: (categoryId: string) => Promise<void>;
  createNote: (
    title: string,
    content: string,
    categoryId: string,
  ) => Promise<void>;
  updateNote: (
    noteId: string,
    updates: Partial<{ title: string; content: string }>,
    categoryId: string,
  ) => Promise<void>;
  deleteNotes: (noteIds: string[], categoryId: string) => Promise<void>;
};

export const NoteContext = createContext<NoteContextState | undefined>(
  undefined,
);
