import { createContext } from "react";
import type ApiError from "@/services/ApiError";
import type ApiResponse from "@/services/ApiResponse";
import type { Category, GetCategoriesResponse } from "@/types/category";

type CategoryApiResult<T = unknown> = ApiResponse<T> | ApiError | unknown;

type CategoryContextState = {
  categories: GetCategoriesResponse[];
  isFetching: boolean;
  isCreating: boolean;
  isUpdating: boolean;
  isDeleting: boolean;
  currentCategoryId: string | null;
  setCurrentCategoryId: (categoryId: string | null) => void;
  fetchCategories: () => Promise<CategoryApiResult<GetCategoriesResponse[]>>;
  refreshCategories: () => Promise<void>;
  createCategory: (name: string) => Promise<CategoryApiResult<Category>>;
  updateCategory: (
    categoryId: string,
    name: string,
  ) => Promise<CategoryApiResult<Category>>;
  deleteCategories: (
    categoryIds: string[],
  ) => Promise<CategoryApiResult<{ count: number }>>;
};

export const CategoryContext = createContext<CategoryContextState | undefined>(
  undefined,
);
