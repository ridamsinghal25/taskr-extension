import { isApiResponse } from "@/lib/typeGuard";
import ApiError from "@/services/ApiError";
import ApiRequest from "@/services/ApiRequest";
import ApiResponse from "@/services/ApiResponse";

class NoteService {
  NOTE_BASE_URL = "/api/v1/notes";

  async createNote<T>(
    title: string,
    content: string,
    categoryId: string,
  ): Promise<ApiResponse<T> | ApiError> {
    const apiRequest = new ApiRequest(
      `${this.NOTE_BASE_URL}?categoryId=${encodeURIComponent(categoryId)}`,
    );

    const response = await apiRequest.postRequest<T>({ title, content });

    if (isApiResponse(response)) {
      return response;
    }

    return response;
  }

  async getNotesByCategoryId<T>(
    categoryId: string,
  ): Promise<ApiResponse<T> | ApiError> {
    const apiRequest = new ApiRequest(`${this.NOTE_BASE_URL}`);

    const response = await apiRequest.getRequest<T>({ categoryId });

    if (isApiResponse(response)) {
      return response;
    }

    return response;
  }

  async getNoteById<T>(noteId: string): Promise<ApiResponse<T> | ApiError> {
    const apiRequest = new ApiRequest(`${this.NOTE_BASE_URL}/${noteId}`);

    const response = await apiRequest.getRequest<T>({});

    if (isApiResponse(response)) {
      return response;
    }

    return response;
  }

  async updateNote<T>(
    noteId: string,
    updates: Partial<{ title: string; content: string }>,
    categoryId: string,
  ): Promise<ApiResponse<T> | ApiError> {
    const apiRequest = new ApiRequest(
      `${this.NOTE_BASE_URL}/${noteId}?categoryId=${encodeURIComponent(categoryId)}`,
    );

    const response = await apiRequest.patchRequest<T>(updates);

    if (isApiResponse(response)) {
      return response;
    }

    return response;
  }

  async moveNoteToCategory<T>(
    noteId: string,
    categoryId: string,
  ): Promise<ApiResponse<T> | ApiError> {
    const apiRequest = new ApiRequest(
      `${this.NOTE_BASE_URL}/${noteId}/move?categoryId=${encodeURIComponent(categoryId)}`,
    );

    const response = await apiRequest.postRequest<T>(undefined);

    if (isApiResponse(response)) {
      return response;
    }

    return response;
  }

  async deleteNotes<T>(
    noteIds: string[],
    categoryId: string,
  ): Promise<ApiResponse<T> | ApiError> {
    const apiRequest = new ApiRequest(
      `${this.NOTE_BASE_URL}?categoryId=${encodeURIComponent(categoryId)}`,
    );

    const response = await apiRequest.deleteRequest<T>({ noteIds });

    if (isApiResponse(response)) {
      return response;
    }

    return response;
  }
}

export default new NoteService();
