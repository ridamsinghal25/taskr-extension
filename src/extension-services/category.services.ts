import { ExtensionAPI } from "@/lib/extensionApi";
import { MessageType } from "@/types/message-types";
import ApiError from "@/services/ApiError";
import ApiResponse from "@/services/ApiResponse";

class CategoryExtensionService {
  async getCategories<T>(): Promise<ApiResponse<T> | ApiError> {
    return ExtensionAPI.send(MessageType.GET_CATEGORIES);
  }

  async createCategory<T>(name: string): Promise<ApiResponse<T> | ApiError> {
    return ExtensionAPI.send(MessageType.CREATE_CATEGORY, { name });
  }

  async updateCategory<T>(
    categoryId: string,
    name: string,
  ): Promise<ApiResponse<T> | ApiError> {
    return ExtensionAPI.send(MessageType.UPDATE_CATEGORY, {
      id: categoryId,
      name,
    });
  }

  async deleteCategories<T>(
    categoryIds: string[],
  ): Promise<ApiResponse<T> | ApiError> {
    return ExtensionAPI.send(MessageType.DELETE_CATEGORIES, {
      ids: categoryIds,
    });
  }

  async getCategoriesByIds<T>(
    categoryIds: string[],
  ): Promise<ApiResponse<T> | ApiError> {
    return ExtensionAPI.send(MessageType.GET_CATEGORIES_BY_IDS, {
      ids: categoryIds,
    });
  }

  async getCategoriesByName<T>(
    categoryNames: string[],
  ): Promise<ApiResponse<T> | ApiError> {
    return ExtensionAPI.send(MessageType.GET_CATEGORIES_BY_NAME, {
      names: categoryNames,
    });
  }

  async updateCategoryByName<T>(
    categoryName: string,
    newName: string,
  ): Promise<ApiResponse<T> | ApiError> {
    return ExtensionAPI.send(MessageType.UPDATE_CATEGORY_BY_NAME, {
      categoryName,
      newName,
    });
  }

  async deleteCategoriesByName<T>(
    names: string[],
  ): Promise<ApiResponse<T> | ApiError> {
    return ExtensionAPI.send(MessageType.DELETE_CATEGORIES_BY_NAME, {
      names,
    });
  }
}

export default new CategoryExtensionService();
