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
import type { Category } from "@/types/category";
import {
  clearCategoryCache,
  getCachedCategories,
  setCachedCategories,
} from "@/lib/category/categoryLocalStorage";
import ApiError from "@/services/ApiError";
import type ApiResponse from "@/services/ApiResponse";
import { CategoryContext } from "./CategoryContext";

export function CategoryProvider({ children }: { children: ReactNode }) {
  const [categories, setCategories] = useState<Category[]>(() => {
    return getCachedCategories() ?? [];
  });
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

    const cachedCategories = getCachedCategories();
    if (cachedCategories && cachedCategories.length > 0) {
      setCategories(cachedCategories);
      setIsFetching(false);
      return cachedCategories;
    }

    try {
      const response = await CategoryService.getCategories<Category[]>();
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

  useEffect(() => {
    fetchCategories();
  }, [fetchCategories]);

  const createCategory = useCallback(
    async (name: string): Promise<CategoryApiResult<Category>> => {
      setIsCreating(true);
      try {
        const response = await CategoryService.createCategory<Category>(name);
        if (isApiResponse(response)) {
          setCategories((prev) => [...prev, response.data]);
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
              category.id === categoryId ? response.data : category,
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

  const getCategoriesByIds = useCallback(async (categoryIds: string[]) => {
    setIsFetching(true);
    try {
      const response =
        await CategoryService.getCategoriesByIds<Category[]>(categoryIds);
      if (isApiResponse(response)) {
        setCategories(Array.isArray(response.data) ? response.data : []);
        return response;
      } else {
        const err = response as ApiError;
        toast.error(
          err.errorResponse?.message ||
            err.errorMessage ||
            "Unable to get categories by ids",
        );
        return response;
      }
    } catch (err) {
      toast.error((err as Error).message || "Unable to get categories by ids");
      return err;
    } finally {
      setIsFetching(false);
    }
  }, []);

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
        createCategory,
        updateCategory,
        deleteCategories,
        getCategoriesByIds,
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
