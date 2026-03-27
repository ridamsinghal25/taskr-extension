import {
  useCallback,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";
import { toast } from "react-toastify";
import NoteService from "@/extension-services/note.services";
import { isApiResponse } from "@/lib/typeGuard";
import type { Note } from "@/types/note";
import ApiError from "@/services/ApiError";
import type ApiResponse from "@/services/ApiResponse";
import { NoteContext } from "./NoteContext";
import { useCategoryContext } from "../CategoryContext/CategoryContextProvider";

function normalizeNote(raw: Note): Note {
  return {
    ...raw,
    createdAt:
      raw.createdAt instanceof Date
        ? raw.createdAt
        : new Date(raw.createdAt as unknown as string),
    updatedAt:
      raw.updatedAt instanceof Date
        ? raw.updatedAt
        : new Date(raw.updatedAt as unknown as string),
  };
}

export function NoteProvider({ children }: { children: ReactNode }) {
  const [notes, setNotes] = useState<Note[]>([]);
  const [isFetching, setIsFetching] = useState(false);
  const [isCreating, setIsCreating] = useState(false);
  const [deletingNoteId, setDeletingNoteId] = useState<string | null>(null);
  const [updatingNoteId, setUpdatingNoteId] = useState<string | null>(null);
  const [isNoteComposerVisible, setIsNoteComposerVisible] = useState(false);

  type NoteApiResult<T = unknown> = ApiResponse<T> | ApiError | unknown;

  const { currentCategoryId } = useCategoryContext();

  const fetchNotesByCategory = useCallback(async (categoryId: string) => {
    setIsFetching(true);
    setNotes([]);
    try {
      const response =
        await NoteService.getNotesByCategoryId<Note[]>(categoryId);
      if (isApiResponse(response)) {
        const list = Array.isArray(response.data) ? response.data : [];
        setNotes(list.map(normalizeNote));
        return response;
      } else {
        const err = response as ApiError;
        toast.error(
          err.errorResponse?.message ||
            err.errorMessage ||
            "Unable to fetch notes",
        );
        return response;
      }
    } catch (err) {
      toast.error((err as Error).message || "Unable to fetch notes");
      setNotes([]);
      return err;
    } finally {
      setIsFetching(false);
    }
  }, []);

  useEffect(() => {
    if (currentCategoryId) {
      fetchNotesByCategory(currentCategoryId);
    } else {
      setNotes([]);
    }
  }, [currentCategoryId, fetchNotesByCategory]);

  const createNote = useCallback(
    async (
      title: string,
      content: string,
      categoryId: string,
    ): Promise<NoteApiResult<Note>> => {
      setIsCreating(true);
      try {
        const response = await NoteService.createNote<Note>(
          title,
          content,
          categoryId,
        );
        if (isApiResponse(response)) {
          setNotes((prev) => [...prev, normalizeNote(response.data)]);
          toast.success("Note created successfully");
          return response;
        } else {
          const err = response as ApiError;
          toast.error(
            err.errorResponse?.message ||
              err.errorMessage ||
              "Unable to create note",
          );
          return response;
        }
      } catch (err) {
        toast.error((err as Error).message || "Unable to create note");
        return err;
      } finally {
        setIsCreating(false);
      }
    },
    [],
  );

  const updateNote = useCallback(
    async (
      noteId: string,
      updates: Partial<{ title: string; content: string }>,
      categoryId: string,
    ): Promise<NoteApiResult<Note>> => {
      setUpdatingNoteId(noteId);
      try {
        const response = await NoteService.updateNote<Note>(
          noteId,
          updates,
          categoryId,
        );
        if (isApiResponse(response)) {
          setNotes((prev) =>
            prev.map((n) =>
              n.id === noteId
                ? normalizeNote({ ...n, ...response.data } as Note)
                : n,
            ),
          );
          toast.success("Note updated successfully");
          return response;
        } else {
          const err = response as ApiError;
          toast.error(
            err.errorResponse?.message ||
              err.errorMessage ||
              "Unable to update note",
          );
          return response;
        }
      } catch (err) {
        toast.error((err as Error).message || "Unable to update note");
        return err;
      } finally {
        setUpdatingNoteId(null);
      }
    },
    [],
  );

  const deleteNotes = useCallback(
    async (
      noteIds: string[],
      categoryId: string,
    ): Promise<NoteApiResult<{ count: number }>> => {
      const primaryDeletingId = noteIds[0] ?? null;
      setDeletingNoteId(primaryDeletingId);
      try {
        const deleteResp = await NoteService.deleteNotes<{
          count: number;
        }>(noteIds, categoryId);
        if (isApiResponse(deleteResp)) {
          setNotes((prev) => prev.filter((n) => !noteIds.includes(n.id)));
          toast.success("Notes deleted successfully");
          return deleteResp;
        } else {
          const err = deleteResp as ApiError;
          toast.error(
            err.errorResponse?.message ||
              err.errorMessage ||
              "Unable to delete notes",
          );
          return deleteResp;
        }
      } catch (err) {
        toast.error((err as Error).message || "Unable to delete notes");
        return err;
      } finally {
        setDeletingNoteId(null);
      }
    },
    [],
  );

  return (
    <NoteContext.Provider
      value={{
        notes,
        isFetching,
        isCreating,
        deletingNoteId,
        updatingNoteId,
        isNoteComposerVisible,
        setIsNoteComposerVisible,
        fetchNotesByCategory,
        createNote,
        updateNote,
        deleteNotes,
      }}
    >
      {children}
    </NoteContext.Provider>
  );
}

export function useNoteContext() {
  const context = useContext(NoteContext);
  if (!context) {
    throw new Error("useNoteContext must be used within NoteProvider");
  }
  return context;
}
