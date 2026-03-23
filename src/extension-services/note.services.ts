import { ExtensionAPI } from "@/lib/extensionApi";
import { MessageType } from "@/types/message-types";
import ApiError from "@/services/ApiError";
import ApiResponse from "@/services/ApiResponse";

class NoteExtensionService {
  async createNote<T>(
    title: string,
    content: string,
    categoryId: string,
  ): Promise<ApiResponse<T> | ApiError> {
    return ExtensionAPI.send(MessageType.CREATE_NOTE, {
      title,
      content,
      categoryId,
    });
  }

  async getNotesByCategoryId<T>(
    categoryId: string,
  ): Promise<ApiResponse<T> | ApiError> {
    return ExtensionAPI.send(MessageType.GET_NOTES_BY_CATEGORY_ID, {
      categoryId,
    });
  }

  async getNoteById<T>(noteId: string): Promise<ApiResponse<T> | ApiError> {
    return ExtensionAPI.send(MessageType.GET_NOTE_BY_ID, {
      noteId,
    });
  }

  async updateNote<T>(
    noteId: string,
    updates: Partial<{ title: string; content: string }>,
    categoryId: string,
  ): Promise<ApiResponse<T> | ApiError> {
    return ExtensionAPI.send(MessageType.UPDATE_NOTE, {
      noteId,
      categoryId,
      updates,
    });
  }

  async moveNoteToCategory<T>(
    noteId: string,
    categoryId: string,
  ): Promise<ApiResponse<T> | ApiError> {
    return ExtensionAPI.send(MessageType.MOVE_NOTE, {
      noteId,
      categoryId,
    });
  }

  async deleteNotes<T>(
    noteIds: string[],
    categoryId: string,
  ): Promise<ApiResponse<T> | ApiError> {
    return ExtensionAPI.send(MessageType.DELETE_NOTES, {
      noteIds,
      categoryId,
    });
  }
}

export default new NoteExtensionService();
