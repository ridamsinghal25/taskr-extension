import { getCachedCategories } from "@/lib/category/categoryChromeStorage";
import type { GetCategoriesResponse } from "@/types/category";
import { useEffect, useState } from "react";

export function useCategoriesCache() {
  const [categories, setCategories] = useState<GetCategoriesResponse[]>([]);

    useEffect(() => {
    void (async () => {
        const cached = await getCachedCategories();

        if (cached) {
        setCategories(cached);
        }
    })();
    }, []);

  return {
    categories,
    setCategories,
  };
}