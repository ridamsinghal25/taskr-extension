import { useCallback, useState } from "react";
import { useCategoryContext } from "@/context/CategoryContext/CategoryContextProvider";
import { isApiResponse } from "@/lib/typeGuard";

export function useEditCategory() {
  const { updateCategory } = useCategoryContext();
  const [editingCategoryId, setEditingCategoryId] = useState<string | null>(
    null,
  );
  const [renameDraft, setRenameDraft] = useState("");

  const cancelRename = useCallback(() => {
    setEditingCategoryId(null);
    setRenameDraft("");
  }, []);

  const startRename = useCallback((category: { id: string; name: string }) => {
    setEditingCategoryId(category.id);
    setRenameDraft(category.name);
  }, []);

  const commitRename = useCallback(
    async (categoryId: string) => {
      const next = renameDraft.trim();
      if (!next) return;
      const response = await updateCategory(categoryId, next);
      if (isApiResponse(response) && response.success) {
        cancelRename();
      }
    },
    [renameDraft, updateCategory, cancelRename],
  );

  const isEditing = useCallback(
    (categoryId: string) => editingCategoryId === categoryId,
    [editingCategoryId],
  );

  return {
    editingCategoryId,
    renameDraft,
    isEditing,
    startRename,
    cancelRename,
    commitRename,
    onRenameDraftChange: setRenameDraft,
  };
}
