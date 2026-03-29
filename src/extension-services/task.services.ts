import { ExtensionAPI } from "@/lib/extensionApi";
import { MessageType } from "@/types/message-types";
import { TaskType, TaskStatus, type TaskAttachmentInput } from "@/types/task";
import ApiError from "@/services/ApiError";
import ApiResponse from "@/services/ApiResponse";

class TaskExtensionService {
  async createTask<T>(
    name: string,
    type: TaskType,
    status: TaskStatus,
    categoryId: string,
    attachments?: TaskAttachmentInput[],
  ): Promise<ApiResponse<T> | ApiError> {
    return ExtensionAPI.send(MessageType.CREATE_TASK, {
      name,
      type,
      status,
      categoryId,
      attachments: attachments ?? [],
    });
  }

  async getTasksByCategoryId<T>(
    categoryId: string,
  ): Promise<ApiResponse<T> | ApiError> {
    return ExtensionAPI.send(MessageType.GET_TASKS_BY_CATEGORY_ID, {
      categoryId,
    });
  }

  async getTaskById<T>(taskId: string): Promise<ApiResponse<T> | ApiError> {
    return ExtensionAPI.send(MessageType.GET_TASK_BY_ID, {
      taskId,
    });
  }

  async updateTask<T>(
    taskId: string,
    categoryId: string,
    updates: Partial<{
      name: string;
      type: TaskType;
      status: TaskStatus;
    }>,
  ): Promise<ApiResponse<T> | ApiError> {
    return ExtensionAPI.send(MessageType.UPDATE_TASK, {
      taskId,
      categoryId,
      updates,
    });
  }

  async moveTaskToCategory<T>(
    taskId: string,
    categoryId: string,
  ): Promise<ApiResponse<T> | ApiError> {
    return ExtensionAPI.send(MessageType.MOVE_TASK, {
      taskId,
      categoryId,
    });
  }

  async deleteTasksFromCategory<T>(
    taskIds: string[],
    categoryId: string,
  ): Promise<ApiResponse<T> | ApiError> {
    return ExtensionAPI.send(MessageType.DELETE_TASKS_FROM_CATEGORY, {
      taskIds,
      categoryId,
    });
  }

  async createTaskByCategoryName<T>(
    name: string,
    type: TaskType,
    status: TaskStatus,
    categoryName: string,
  ): Promise<ApiResponse<T> | ApiError> {
    return ExtensionAPI.send(MessageType.CREATE_TASK_BY_CATEGORY_NAME, {
      name,
      type,
      status,
      categoryName,
    });
  }

  async moveTaskToCategoryByName<T>(
    taskName: string,
    categoryName: string,
    newCategoryName: string,
  ): Promise<ApiResponse<T> | ApiError> {
    return ExtensionAPI.send(MessageType.MOVE_TASK_BY_NAME, {
      taskName,
      categoryName,
      newCategoryName,
    });
  }

  async deleteTasksByName<T>(
    categoryName: string,
    tasks: string[],
  ): Promise<ApiResponse<T> | ApiError> {
    return ExtensionAPI.send(MessageType.DELETE_TASKS_BY_NAME, {
      categoryName,
      tasks,
    });
  }

  async getTasksByCategoryName<T>(
    categoryName: string,
  ): Promise<ApiResponse<T> | ApiError> {
    return ExtensionAPI.send(MessageType.GET_TASKS_BY_CATEGORY_NAME, {
      categoryName,
    });
  }

  async getTaskByName<T>(
    taskName: string,
    categoryName: string,
  ): Promise<ApiResponse<T> | ApiError> {
    return ExtensionAPI.send(MessageType.GET_TASK_BY_NAME, {
      taskName,
      categoryName,
    });
  }

  async updateTaskByName<T>(
    taskName: string,
    categoryName: string,
    task: Partial<{ name: string; type: string; status: string }>,
  ): Promise<ApiResponse<T> | ApiError> {
    return ExtensionAPI.send(MessageType.UPDATE_TASK_BY_NAME, {
      taskName,
      categoryName,
      task,
    });
  }
}

export default new TaskExtensionService();
