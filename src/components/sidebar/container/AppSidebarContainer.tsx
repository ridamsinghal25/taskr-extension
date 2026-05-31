import { useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useCategoryContext } from "@/context/CategoryContext/CategoryContextProvider";
import { useTaskContext } from "@/context/TaskContext/TaskContextProvider";
import { getCategoryBgClass } from "@/lib/utils";
import { TaskStatus } from "@/types/task";
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
  const { tasks: activeTasks } = useTaskContext();

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

  const activeCounts = useMemo(() => {
    const total = activeTasks.length;
    const done = activeTasks.filter((t) => t.status === TaskStatus.Done).length;
    return { total, done };
  }, [activeTasks]);

  const busy = isUpdating || isDeleting;

  const categoryItems = useMemo((): AppSidebarCategoryItem[] => {
    return categories.map((category) => {
      const isActive = currentCategoryId === category.id;
      const total = isActive ? activeCounts.total : 0;
      const done = isActive ? activeCounts.done : 0;
      const progressPct = total > 0 ? Math.round((done / total) * 100) : 0;

      return {
        id: category.id,
        name: category.name,
        isActive,
        isEditing: isEditing(category.id),
        colorClass: getCategoryBgClass(category.id),
        progressPct,
        doneCount: done,
        totalCount: total,
      };
    });
  }, [
    categories,
    currentCategoryId,
    editingCategoryId,
    activeCounts.total,
    activeCounts.done,
  ]);

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
