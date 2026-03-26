import {
  Check,
  Loader2,
  Pencil,
  Plus,
  Trash2,
  X,
} from "lucide-react";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarRail,
} from "@/components/ui/sidebar";
import { useNavigate, useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useCategoryContext } from "@/context/CategoryContext/CategoryContextProvider";
import CategoriesSkeleton from "@/components/sidebar/CategoriesSkeleton";
import { abbreviate, cn } from "@/lib/utils";
import { ConfirmActionDialog } from "@/components/dialog/ConfirmActionDialog";
import { Form } from "@/components/ui/form";
import FormFieldInput from "@/components/basic/FormFieldInput";
import { useForm } from "react-hook-form";
import { useState, useMemo } from "react";

const chatShellClass =
  "flex h-full w-full flex-col bg-linear-to-b from-primary/7 from-0% via-background via-45% to-blue-500/4 to-100% dark:from-primary/12 dark:via-background dark:to-blue-950/35";
const chatHeaderClass =
  "flex items-center gap-3 border-b border-primary/20 bg-linear-to-r from-primary/8 via-primary/4 to-blue-500/6 px-3 py-3 shadow-sm shadow-primary/5 backdrop-blur-md dark:from-primary/15 dark:via-primary/8 dark:to-blue-950/40 dark:border-primary/25";

type NewCategoryFormValues = {
  name: string;
};

export function AppSidebar() {
  const navigate = useNavigate();
  const location = useLocation();
  const {
    categories,
    isFetching,
    isCreating,
    isUpdating,
    isDeleting,
    createCategory,
    updateCategory,
    deleteCategories,
  } = useCategoryContext();

  const createCategoryForm = useForm<NewCategoryFormValues>({
    defaultValues: { name: "" },
  });

  const [categoryIdToDelete, setCategoryIdToDelete] = useState<string | null>(null);
  const [editingCategoryId, setEditingCategoryId] = useState<string | null>(null);
  const [renameDraft, setRenameDraft] = useState("");

  const currentCategoryId = useMemo(() => {
    const match = location.pathname.match(/\/workspace\/categories\/([^/]+)/);
    return match ? match[1] : null;
  }, [location.pathname]);

  const categoryPendingDelete = useMemo(
    () =>
      categoryIdToDelete
        ? categories.find((c) => c.id === categoryIdToDelete)
        : undefined,
    [categoryIdToDelete, categories],
  );

  const handleCategoryNavigate = (categoryId: string) => {
    navigate(`/workspace/categories/${categoryId}`);
  };

  const startRename = (category: { id: string; name: string }) => {
    setEditingCategoryId(category.id);
    setRenameDraft(category.name);
  };

  const cancelRename = () => {
    setEditingCategoryId(null);
    setRenameDraft("");
  };

  const commitRename = async (categoryId: string) => {
    const next = renameDraft.trim();
    if (!next) return;
    await updateCategory(categoryId, next);
    cancelRename();
  };

  const handleCreateCategory = async (values: { name: string }) => {
    const name = values.name.trim();

    if (!name) return;

    await createCategory(name);

    createCategoryForm.reset({ name: "" });
  };

  const busy = isUpdating || isDeleting;

  return (
    <Sidebar className="w-80">
      <div className={cn(chatShellClass, "flex min-h-0 flex-1 flex-col")}>
        <SidebarHeader className={cn(chatHeaderClass, "border-sidebar-border")}>
          <div className="flex w-full items-center justify-between gap-2">
            <div className="flex h-12 min-w-0 items-center gap-2">
              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border border-primary/30 bg-primary/15 text-sm font-bold text-primary shadow-sm shadow-primary/10">
                T
              </div>
              <h1 className="truncate text-lg font-semibold tracking-tight text-foreground">
                Taskr
              </h1>
            </div>
          </div>
        </SidebarHeader>

        <SidebarContent className="gap-0 bg-transparent px-2">
          <SidebarGroup className="gap-2 py-2">
            <SidebarGroupLabel className="px-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
              New category
            </SidebarGroupLabel>
            <SidebarGroupContent>
              <Form {...createCategoryForm}>
                <form
                  onSubmit={createCategoryForm.handleSubmit(handleCreateCategory)}
                  className="flex flex-col gap-2 rounded-xl border border-primary/20 bg-primary/5 p-2 shadow-sm shadow-primary/5 backdrop-blur-sm dark:bg-primary/10"
                >
                  <FormFieldInput
                    form={createCategoryForm}
                    name="name"
                    placeholder="Name"
                    disabled={isCreating}
                    className="h-9 border-primary/20 bg-background/85 text-sm shadow-inner shadow-primary/5 focus-visible:ring-primary/25"
                    aria-label="New category name"
                  />
                  <Button
                    type="submit"
                    size="sm"
                    className="w-full gap-1.5"
                    disabled={
                      isCreating ||
                      !(createCategoryForm.watch("name") ?? "").trim().length
                    }
                  >
                    {isCreating ? (
                      <Loader2 className="h-4 w-4 animate-spin" aria-hidden />
                    ) : (
                      <Plus className="h-4 w-4" aria-hidden />
                    )}
                    Add
                  </Button>
                </form>
              </Form>
            </SidebarGroupContent>
          </SidebarGroup>

          <SidebarGroup className="gap-2 py-0">
            <SidebarGroupLabel className="px-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
              Categories
            </SidebarGroupLabel>
            <SidebarGroupContent>
              <div className="flex flex-col gap-2">
                {isFetching ? (
                  <CategoriesSkeleton />
                ) : categories.length > 0 ? (
                  categories.map((category) => {
                    const isActive = currentCategoryId === category.id;
                    const isEditing = editingCategoryId === category.id;

                    return (
                      <div
                        key={category.id}
                        className={cn(
                          "flex items-center gap-1 rounded-xl border px-1.5 py-1 shadow-sm transition",
                          "border-primary/20 bg-primary/5 backdrop-blur-sm dark:bg-primary/10",
                          isActive &&
                            "border-primary/35 bg-primary/70 shadow-md shadow-primary/10 dark:bg-primary/15",
                        )}
                      >
                        {isEditing ? (
                          <>
                            <div className="flex min-w-0 flex-1 items-center gap-2 px-1">
                              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border border-primary/30 bg-primary/15 text-xs font-bold text-primary">
                                {abbreviate(category.name)}
                              </div>
                              <Input
                                value={renameDraft}
                                onChange={(e) => setRenameDraft(e.target.value)}
                                onKeyDown={(e) => {
                                  if (e.key === "Enter") {
                                    e.preventDefault();
                                    void commitRename(category.id);
                                  }
                                  if (e.key === "Escape") cancelRename();
                                }}
                                className="h-9 min-w-0 flex-1 border-primary/20 bg-background/85 text-sm shadow-inner shadow-primary/5 focus-visible:ring-primary/25"
                                autoFocus
                                disabled={busy}
                                aria-label="Category name"
                              />
                            </div>
                            <div className="flex shrink-0 gap-0.5">
                              <Button
                                type="button"
                                size="icon"
                                variant="ghost"
                                className="h-8 w-8 text-primary"
                                disabled={busy}
                                onClick={() => void commitRename(category.id)}
                                aria-label="Save name"
                              >
                                {
                                  busy ? <Loader2 className="h-4 w-4 animate-spin" /> : 
                                  <Check className="h-4 w-4" />
                                }
                              </Button>
                              <Button
                                type="button"
                                size="icon"
                                variant="ghost"
                                className="h-8 w-8"
                                disabled={busy}
                                onClick={cancelRename}
                                aria-label="Cancel rename"
                              >
                                <X className="h-4 w-4" />
                              </Button>
                            </div>
                          </>
                        ) : (
                          <>
                            <button
                              type="button"
                              disabled={busy}
                              onClick={() => handleCategoryNavigate(category.id)}
                              className={cn(
                                "flex min-w-0 flex-1 items-center gap-2 rounded-lg px-1 py-1 text-left transition",
                                "hover:bg-primary/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/25",
                                busy && "pointer-events-none opacity-60",
                              )}
                            >
                              <div
                                className={cn(
                                  "flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border text-xs font-bold",
                                  isActive
                                    ? "border-primary/40 bg-primary/20 text-primary"
                                    : "border-primary/25 bg-primary/10 text-primary",
                                )}
                              >
                                {abbreviate(category.name)}
                              </div>
                              <span
                                className={cn(
                                  "truncate text-sm font-medium",
                                  isActive
                                    ? "text-foreground"
                                    : "text-foreground/90",
                                )}
                              >
                                {category.name}
                              </span>
                            </button>
                            <div className="flex shrink-0 gap-0.5">
                              <Button
                                type="button"
                                size="icon"
                                variant="ghost"
                                className="h-8 w-8 text-foreground hover:bg-primary/15"
                                disabled={busy}
                                onClick={(e) => {
                                  e.preventDefault();
                                  e.stopPropagation();
                                  startRename(category);
                                }}
                                aria-label={`Rename ${category.name}`}
                              >
                                <Pencil className="h-3.5 w-3.5" />
                              </Button>
                              <Button
                                type="button"
                                size="icon"
                                variant="ghost"
                                className="h-8 w-8 text-destructive hover:bg-destructive/10 hover:text-destructive"
                                disabled={busy}
                                onClick={(e) => {
                                  e.preventDefault();
                                  e.stopPropagation();
                                  setCategoryIdToDelete(category.id);
                                }}
                                aria-label={`Delete ${category.name}`}
                              >
                                <Trash2 className="h-3.5 w-3.5" />
                              </Button>
                            </div>
                          </>
                        )}
                      </div>
                    );
                  })
                ) : (
                  <div className="rounded-xl border border-primary/15 bg-primary/5 px-3 py-6 text-center text-xs text-muted-foreground shadow-sm shadow-primary/5">
                    No categories yet
                  </div>
                )}
              </div>
            </SidebarGroupContent>
          </SidebarGroup>
        </SidebarContent>

        <SidebarRail />
      </div>

      <ConfirmActionDialog
        open={categoryIdToDelete !== null}
        onOpenChange={(open) => {
          if (!open) setCategoryIdToDelete(null);
        }}
        title="Delete this category?"
        description={
          categoryPendingDelete ? (
            <>
              <span className="font-medium text-foreground">
                {categoryPendingDelete.name}
              </span>{" "}
              will be removed permanently. This cannot be undone.
            </>
          ) : null
        }
        onConfirm={async () => {
          if (!categoryIdToDelete) return;
          const id = categoryIdToDelete;
          await deleteCategories([id]);
          if (currentCategoryId === id) {
            navigate("/workspace");
          }
        }}
      />
    </Sidebar>
  );
}
