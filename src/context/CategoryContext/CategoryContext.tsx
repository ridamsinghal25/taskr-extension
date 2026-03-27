import { createContext } from "react";
import type ApiError from "@/services/ApiError";
import type ApiResponse from "@/services/ApiResponse";
import type { Category } from "@/types/category";

type CategoryApiResult<T = unknown> = ApiResponse<T> | ApiError | unknown;

type CategoryContextState = {
  categories: Category[];
  isFetching: boolean;
  isCreating: boolean;
  isUpdating: boolean;
  isDeleting: boolean;
  currentCategoryId: string | null;
  setCurrentCategoryId: (categoryId: string | null) => void;
  fetchCategories: () => Promise<CategoryApiResult<Category[]>>;
  createCategory: (name: string) => Promise<CategoryApiResult<Category>>;
  updateCategory: (
    categoryId: string,
    name: string,
  ) => Promise<CategoryApiResult<Category>>;
  deleteCategories: (
    categoryIds: string[],
  ) => Promise<CategoryApiResult<{ count: number }>>;
  getCategoriesByIds: (
    categoryIds: string[],
  ) => Promise<CategoryApiResult<Category[]>>;
};

export const CategoryContext = createContext<CategoryContextState | undefined>(
  undefined,
);
