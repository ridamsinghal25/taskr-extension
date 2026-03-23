import { createContext } from "react";
import type { Note } from "@/types/note";

type NoteContextState = {
  notes: Note[];
  currentCategoryId: string | null;
  isFetching: boolean;
  isCreating: boolean;
  deletingNoteId: string | null;
  setCurrentCategoryId: (categoryId: string | null) => void;
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
