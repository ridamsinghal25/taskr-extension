import categoryService from "@/services/category.services";
import noteService from "@/services/note.services";
import taskService from "@/services/task.services";
import userService from "@/services/user.services";
import { MessageType } from "@/types/message-types";

chrome.runtime.onMessage.addListener((message, _, sendResponse) => {
  handleMessage(message)
    .then(sendResponse)
    .catch((error) => {
      console.error("Background error:", error);
      sendResponse({ error: "Internal extension error" });
    });

  return true; // IMPORTANT for async
});

async function handleMessage(message: any) {
  const { type, payload } = message;

  switch (type) {
    /* ======================
       CATEGORY
    ====================== */

    case MessageType.CREATE_CATEGORY:
      return categoryService.createCategory(payload.name);

    case MessageType.UPDATE_CATEGORY:
      return categoryService.updateCategory(payload.id, payload.name);

    case MessageType.GET_CATEGORIES:
      return categoryService.getCategories();

    case MessageType.DELETE_CATEGORIES:
      return categoryService.deleteCategories(payload.ids);

    case MessageType.GET_CATEGORIES_BY_IDS:
      return categoryService.getCategoriesByIds(payload.ids);

    case MessageType.GET_CATEGORIES_BY_NAME:
      return categoryService.getCategoriesByName(payload.names);

    case MessageType.UPDATE_CATEGORY_BY_NAME:
      return categoryService.updateCategoryByName(
        payload.categoryName,
        payload.newName,
      );

    case MessageType.DELETE_CATEGORIES_BY_NAME:
      return categoryService.deleteCategoriesByName(payload.names);

    /* ======================
       TASK
    ====================== */

    case MessageType.CREATE_TASK:
      return taskService.createTask(
        payload.name,
        payload.type,
        payload.status,
        payload.categoryId,
      );

    case MessageType.GET_TASKS_BY_CATEGORY_ID:
      return taskService.getTasksByCategoryId(payload.categoryId);

    case MessageType.GET_TASK_BY_ID:
      return taskService.getTaskById(payload.taskId);

    case MessageType.UPDATE_TASK:
      return taskService.updateTask(
        payload.taskId,
        payload.categoryId,
        payload.updates,
      );

    case MessageType.MOVE_TASK:
      return taskService.moveTaskToCategory(payload.taskId, payload.categoryId);

    case MessageType.DELETE_TASKS_FROM_CATEGORY:
      return taskService.deleteTasksFromCategory(
        payload.taskIds,
        payload.categoryId,
      );

    case MessageType.CREATE_TASK_BY_CATEGORY_NAME:
      return taskService.createTaskByCategoryName(
        payload.name,
        payload.type,
        payload.status,
        payload.categoryName,
      );

    case MessageType.MOVE_TASK_BY_NAME:
      return taskService.moveTaskToCategoryByName(
        payload.taskName,
        payload.categoryName,
        payload.newCategoryName,
      );

    case MessageType.DELETE_TASKS_BY_NAME:
      return taskService.deleteTasksByName(payload.categoryName, payload.tasks);

    case MessageType.GET_TASKS_BY_CATEGORY_NAME:
      return taskService.getTasksByCategoryName(payload.categoryName);

    case MessageType.GET_TASK_BY_NAME:
      return taskService.getTaskByName(payload.taskName, payload.categoryName);

    case MessageType.UPDATE_TASK_BY_NAME:
      return taskService.updateTaskByName(
        payload.taskName,
        payload.categoryName,
        payload.task,
      );

    /* ======================
       NOTE
    ====================== */

    case MessageType.CREATE_NOTE:
      return noteService.createNote(
        payload.title,
        payload.content,
        payload.categoryId,
      );

    case MessageType.GET_NOTES_BY_CATEGORY_ID:
      return noteService.getNotesByCategoryId(payload.categoryId);

    case MessageType.GET_NOTE_BY_ID:
      return noteService.getNoteById(payload.noteId);

    case MessageType.UPDATE_NOTE:
      return noteService.updateNote(
        payload.noteId,
        payload.updates,
        payload.categoryId,
      );

    case MessageType.MOVE_NOTE:
      return noteService.moveNoteToCategory(payload.noteId, payload.categoryId);

    case MessageType.DELETE_NOTES:
      return noteService.deleteNotes(payload.noteIds, payload.categoryId);

    /* ======================
       USER
    ====================== */

    case MessageType.GET_CURRENT_USER:
      return userService.getCurrentUser();

    default:
      return { error: "Unknown message type" };
  }
}
