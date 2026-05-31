import { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Workspace } from "../presentation/Workspace";
import { useTaskContext } from "@/context/TaskContext/TaskContextProvider";
import { useCategoryContext } from "@/context/CategoryContext/CategoryContextProvider";
import { getCategoryColor } from "@/lib/utils";
import { ConfirmActionDialog } from "@/components/dialog/ConfirmActionDialog";

export function WorkspaceContainer() {
  const { categoryId } = useParams<{ categoryId?: string }>();
  const navigate = useNavigate();

  const { setCurrentCategoryId, categories, deleteCategories } =
    useCategoryContext();

  const { isFetching: isTaskFetching } = useTaskContext();

  const [deleteCategoryOpen, setDeleteCategoryOpen] = useState(false);

  useEffect(() => {
    setCurrentCategoryId(categoryId ?? null);
  }, [categoryId, setCurrentCategoryId]);

  const category = useMemo(
    () => categories.find((c) => c.id === categoryId),
    [categories, categoryId],
  );

  const accentColor = categoryId ? getCategoryColor(categoryId) : "#6366f1";

  const handleConfirmDeleteCategory = async () => {
    if (!categoryId) return;
    await deleteCategories([categoryId]);
    setDeleteCategoryOpen(false);
    navigate("/workspace");
  };

  return (
    <>
      <Workspace
        categoryId={categoryId as string}
        categoryName={category?.name ?? ""}
        isTaskFetching={isTaskFetching}
        donePct={category?.completionPercentage ?? 0}
        accentColor={accentColor}
        onDeleteCategory={() => setDeleteCategoryOpen(true)}
      />
      <ConfirmActionDialog
        open={deleteCategoryOpen}
        onOpenChange={setDeleteCategoryOpen}
        title="Delete this category?"
        description={
          category ? (
            <>
              <span className="font-medium text-foreground">
                {category.name}
              </span>{" "}
              and all its tasks will be removed permanently. This cannot be
              undone.
            </>
          ) : null
        }
        onConfirm={handleConfirmDeleteCategory}
      />
    </>
  );
}
