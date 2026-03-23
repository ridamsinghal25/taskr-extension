import { createContext } from "react";
import type { Note } from "@/types/note";

type NoteContextState = {
  notes: Note[];
  isFetching: boolean;
  isCreating: boolean;
  deletingNoteId: string | null;
  fetchNotesByCategory: (categoryId: string) => Promise<void>;
  createNote: (
    title: string,
    content: string,
    categoryId: string,
  ) => Promise<void>;
  deleteNotes: (noteIds: string[], categoryId: string) => Promise<void>;
};

export const NoteContext = createContext<NoteContextState | undefined>(
  undefined,
);
