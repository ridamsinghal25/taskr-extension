import { createContext } from "react";
import type { Category } from "@/types/category";

type CategoryContextState = {
  categories: Category[];
  isFetching: boolean;
  isCreating: boolean;
  isUpdating: boolean;
  isDeleting: boolean;
  fetchCategories: () => Promise<void>;
  createCategory: (name: string) => Promise<void>;
  updateCategory: (categoryId: string, name: string) => Promise<void>;
  deleteCategories: (categoryIds: string[]) => Promise<void>;
  getCategoriesByIds: (categoryIds: string[]) => Promise<void>;
};

export const CategoryContext = createContext<CategoryContextState | undefined>(
  undefined,
);
