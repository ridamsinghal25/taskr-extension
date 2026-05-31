import { useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useCategoryContext } from "@/context/CategoryContext/CategoryContextProvider";
import { getCategoryBgClass } from "@/lib/utils";
import {
  AppSidebar,
  type AppSidebarCategoryItem,
} from "@/components/sidebar/presentation/AppSidebar";
import { useEditCategory } from "@/hooks/useEditCategory";

export function AppSidebarContainer() {
  const navigate = useNavigate();
  const { categoryId: currentCategoryId } = useParams<{ categoryId?: string }>();
  const { categories, isFetching, isUpdating, isDeleting, deleteCategories } =
    useCategoryContext();

  const {
    editingCategoryId,
    renameDraft,
    isEditing,
    startRename,
    cancelRename,
    commitRename,
    onRenameDraftChange,
  } = useEditCategory();

  const [categoryIdToDelete, setCategoryIdToDelete] = useState<string | null>(
    null,
  );

  const categoryPendingDelete = useMemo(
    () =>
      categoryIdToDelete
        ? categories.find((c) => c.id === categoryIdToDelete)
        : undefined,
    [categoryIdToDelete, categories],
  );

  const busy = isUpdating || isDeleting;

  const categoryItems = useMemo((): AppSidebarCategoryItem[] => {
    return categories.map((category) => ({
      id: category.id,
      name: category.name,
      isActive: currentCategoryId === category.id,
      isEditing: isEditing(category.id),
      colorClass: getCategoryBgClass(category.id),
      progressPct: category.completionPercentage,
      doneCount: category.totalDoneTasks,
      totalCount: category.totalNonArchivedTasks,
    }));
  }, [categories, currentCategoryId, editingCategoryId, isEditing]);

  const handleCategoryRowClick = (
    categoryId: string,
    categoryIsEditing: boolean,
  ) => {
    if (categoryIsEditing || busy) return;
    navigate(`/workspace/categories/${categoryId}`);
  };

  const handleConfirmDelete = async () => {
    if (!categoryIdToDelete) return;
    const id = categoryIdToDelete;
    await deleteCategories([id]);
    if (currentCategoryId === id) {
      navigate("/workspace");
    }
  };

  return (
    <AppSidebar
      categories={categoryItems}
      isFetching={isFetching}
      busy={busy}
      renameDraft={renameDraft}
      onRenameDraftChange={onRenameDraftChange}
      onCategoryRowClick={handleCategoryRowClick}
      onStartRename={startRename}
      onCommitRename={commitRename}
      onCancelRename={cancelRename}
      onRequestDelete={setCategoryIdToDelete}
      deleteDialogOpen={categoryIdToDelete !== null}
      onDeleteDialogOpenChange={(open) => {
        if (!open) setCategoryIdToDelete(null);
      }}
      categoryPendingDeleteName={categoryPendingDelete?.name}
      onConfirmDelete={handleConfirmDelete}
    />
  );
}
