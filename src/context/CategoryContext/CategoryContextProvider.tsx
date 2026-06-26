import {
  useCallback,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";
import { toast } from "react-toastify";
import CategoryService from "@/extension-services/category.services";
import { isApiResponse } from "@/lib/typeGuard";
import type { Category, GetCategoriesResponse } from "@/types/category";
import {
  clearCategoryCache,
  getCachedCategories,
  setCachedCategories,
} from "@/lib/category/categoryChromeStorage";
import ApiError from "@/services/ApiError";
import type ApiResponse from "@/services/ApiResponse";
import { CategoryContext } from "./CategoryContext";
import { useCategoriesCache } from "@/hooks/useCachedCategory";

export function CategoryProvider({ children }: { children: ReactNode }) {
  const {categories, setCategories} = useCategoriesCache()
  const [currentCategoryId, setCurrentCategoryId] = useState<string | null>(
    null,
  );
  const [isFetching, setIsFetching] = useState(false);
  const [isCreating, setIsCreating] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  type CategoryApiResult<T = unknown> = ApiResponse<T> | ApiError | unknown;

  const fetchCategories = useCallback(async () => {
    setIsFetching(true);

    const cachedCategories = await getCachedCategories();
    if (cachedCategories && cachedCategories.length > 0) {
      setCategories(cachedCategories);
      setIsFetching(false);
      return cachedCategories;
    }

    try {
      const response =
        await CategoryService.getCategories<GetCategoriesResponse[]>();
      if (isApiResponse(response)) {
        const next = Array.isArray(response.data) ? response.data : [];
        setCategories(next);
        setCachedCategories(next);
        return response;
      } else {
        const err = response as ApiError;
        toast.error(
          err.errorResponse?.message ||
            err.errorMessage ||
            "Unable to fetch categories",
        );
        return response;
      }
    } catch (err) {
      toast.error((err as Error).message || "Unable to fetch categories");
      setCategories([]);
      return err;
    } finally {
      setIsFetching(false);
    }
  }, []);

  const refreshCategories = useCallback(async () => {
    clearCategoryCache();
    try {
      const response =
        await CategoryService.getCategories<GetCategoriesResponse[]>();
      if (isApiResponse(response)) {
        const next = Array.isArray(response.data) ? response.data : [];
        setCategories(next);
        setCachedCategories(next);
      }
    } catch {
      // Task mutations already succeeded; avoid extra toasts on background refresh.
    }
  }, []);

  useEffect(() => {
    fetchCategories();
  }, [fetchCategories]);

  const createCategory = useCallback(
    async (name: string): Promise<CategoryApiResult<Category>> => {
      setIsCreating(true);
      try {
        const response = await CategoryService.createCategory<Category>(name);
        if (isApiResponse(response)) {
          const created: GetCategoriesResponse = {
            ...response.data,
            totalDoneTasks: 0,
            totalNonArchivedTasks: 0,
            completionPercentage: 0,
          };
          setCategories((prev) => [...prev, created]);
          clearCategoryCache();
          toast.success("Category created successfully");
          return response;
        } else {
          const err = response as ApiError;
          toast.error(
            err.errorResponse?.message ||
              err.errorMessage ||
              "Unable to create category",
          );
          return response;
        }
      } catch (err) {
        toast.error((err as Error).message || "Unable to create category");
        return err;
      } finally {
        setIsCreating(false);
      }
    },
    [],
  );

  const updateCategory = useCallback(
    async (
      categoryId: string,
      name: string,
    ): Promise<CategoryApiResult<Category>> => {
      setIsUpdating(true);
      clearCategoryCache();
      try {
        const response = await CategoryService.updateCategory<Category>(
          categoryId,
          name,
        );
        if (isApiResponse(response)) {
          setCategories((prev) =>
            prev.map((category) =>
              category.id === categoryId
                ? { ...category, ...response.data }
                : category,
            ),
          );
          toast.success("Category updated successfully");
          return response;
        } else {
          const err = response as ApiError;
          toast.error(
            err.errorResponse?.message ||
              err.errorMessage ||
              "Unable to update category",
          );
          return response;
        }
      } catch (err) {
        toast.error((err as Error).message || "Unable to update category");
        return err;
      } finally {
        setIsUpdating(false);
      }
    },
    [],
  );

  const deleteCategories = useCallback(
    async (
      categoryIds: string[],
    ): Promise<CategoryApiResult<{ count: number }>> => {
      setIsDeleting(true);
      clearCategoryCache();
      try {
        const response = await CategoryService.deleteCategories<{
          count: number;
        }>(categoryIds);
        if (isApiResponse(response)) {
          setCategories((prev) =>
            prev.filter((category) => !categoryIds.includes(category.id)),
          );
          toast.success("Categories deleted successfully");
          return response;
        } else {
          const err = response as ApiError;
          toast.error(
            err.errorResponse?.message ||
              err.errorMessage ||
              "Unable to delete categories",
          );
          return response;
        }
      } catch (err) {
        toast.error((err as Error).message || "Unable to delete categories");
        return err;
      } finally {
        setIsDeleting(false);
      }
    },
    [],
  );

  return (
    <CategoryContext.Provider
      value={{
        categories,
        isFetching,
        isCreating,
        isUpdating,
        isDeleting,
        currentCategoryId,
        setCurrentCategoryId,
        fetchCategories,
        refreshCategories,
        createCategory,
        updateCategory,
        deleteCategories,
      }}
    >
      {children}
    </CategoryContext.Provider>
  );
}

export function useCategoryContext() {
  const context = useContext(CategoryContext);
  if (!context) {
    throw new Error("useCategoryContext must be used within CategoryProvider");
  }
  return context;
}
