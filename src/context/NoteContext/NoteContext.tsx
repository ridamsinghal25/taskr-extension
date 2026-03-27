import { createContext, type Dispatch, type SetStateAction } from "react";
import type ApiError from "@/services/ApiError";
import type ApiResponse from "@/services/ApiResponse";
import type { Note } from "@/types/note";

type NoteApiResult<T = unknown> = ApiResponse<T> | ApiError | unknown;

type NoteContextState = {
  notes: Note[];
  isFetching: boolean;
  isCreating: boolean;
  deletingNoteId: string | null;
  updatingNoteId: string | null;
  isNoteComposerVisible: boolean;
  setIsNoteComposerVisible: Dispatch<SetStateAction<boolean>>;
  fetchNotesByCategory: (categoryId: string) => Promise<NoteApiResult<Note[]>>;
  createNote: (
    title: string,
    content: string,
    categoryId: string,
  ) => Promise<NoteApiResult<Note>>;
  updateNote: (
    noteId: string,
    updates: Partial<{ title: string; content: string }>,
    categoryId: string,
  ) => Promise<NoteApiResult<Note>>;
  deleteNotes: (
    noteIds: string[],
    categoryId: string,
  ) => Promise<NoteApiResult<{ count: number }>>;
};

export const NoteContext = createContext<NoteContextState | undefined>(
  undefined,
);
