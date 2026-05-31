import { Pencil, X } from "lucide-react";
import {
  Sidebar,
  SidebarContent,
  SidebarHeader,
  SidebarRail,
} from "@/components/ui/sidebar";
import { Button } from "@/components/ui/button";
import CategoriesSkeleton from "@/components/sidebar/CategoriesSkeleton";
import { cn } from "@/lib/utils";
import { Progress } from "@/components/ui/progress";
import { ConfirmActionDialog } from "@/components/dialog/ConfirmActionDialog";
import { CreateCategory } from "@/components/category/create-category/CreateCategory";
import { EditCategoryForm } from "@/components/category/edit-category/EditCategory";

export type AppSidebarCategoryItem = {
  id: string;
  name: string;
  isActive: boolean;
  isEditing: boolean;
  colorClass: string;
  progressPct: number;
  doneCount: number;
  totalCount: number;
};

export type AppSidebarProps = {
  categories: AppSidebarCategoryItem[];
  isFetching: boolean;
  busy: boolean;
  renameDraft: string;
  onRenameDraftChange: (value: string) => void;
  onCategoryRowClick: (categoryId: string, isEditing: boolean) => void;
  onStartRename: (category: { id: string; name: string }) => void;
  onCommitRename: (categoryId: string) => void;
  onCancelRename: () => void;
  onRequestDelete: (categoryId: string) => void;
  deleteDialogOpen: boolean;
  onDeleteDialogOpenChange: (open: boolean) => void;
  categoryPendingDeleteName: string | undefined;
  onConfirmDelete: () => Promise<void>;
};

export function AppSidebar({
  categories,
  isFetching,
  busy,
  renameDraft,
  onRenameDraftChange,
  onCategoryRowClick,
  onStartRename,
  onCommitRename,
  onCancelRename,
  onRequestDelete,
  deleteDialogOpen,
  onDeleteDialogOpenChange,
  categoryPendingDeleteName,
  onConfirmDelete,
}: AppSidebarProps) {
  return (
    <Sidebar className="w-72 border-r-0">
      <div className="flex h-full w-full flex-col bg-[#09090f] text-zinc-300">
        <SidebarHeader className="flex flex-row items-center gap-2 border-b border-white/6 bg-[#0a0a14] px-4 py-3">
          <div className="flex h-7 w-7 items-center justify-center rounded-md bg-linear-to-br from-indigo-500 to-cyan-500 text-xs font-bold text-white">
            T
          </div>
          <h1 className="text-sm font-bold tracking-tight text-zinc-100">
            Taskr
          </h1>
        </SidebarHeader>

        <SidebarContent className="bg-transparent">
          <CreateCategory />

          <div className="flex flex-col gap-2 px-1.5 pb-2">
            {isFetching ? (
              <CategoriesSkeleton />
            ) : categories.length > 0 ? (
              categories.map((category) => (
                <div
                  key={category.id}
                  onClick={() =>
                    onCategoryRowClick(category.id, category.isEditing)
                  }
                  className={cn(
                    "group/row relative cursor-pointer rounded-lg px-3 py-3 transition",
                    "hover:bg-white/4",
                    category.isActive && "bg-white/7",
                    busy && "pointer-events-none opacity-60",
                  )}
                >
                  {category.isActive && (
                    <span
                      className={cn(
                        "absolute top-1/2 left-0 h-[70%] w-0.5 -translate-y-1/2 rounded-r-sm",
                        category.colorClass,
                      )}
                      aria-hidden
                    />
                  )}

                  {category.isEditing ? (
                    <EditCategoryForm
                      categoryId={category.id}
                      colorClass={category.colorClass}
                      draft={renameDraft}
                      busy={busy}
                      onDraftChange={onRenameDraftChange}
                      onCommit={onCommitRename}
                      onCancel={onCancelRename}
                    />
                  ) : (
                    <>
                      <div className="flex items-center gap-2">
                        <span
                          className={cn(
                            "h-1.5 w-1.5 shrink-0 rounded-full",
                            category.colorClass,
                          )}
                          aria-hidden
                        />
                        <span
                          className={cn(
                            "min-w-0 flex-1 truncate text-sm transition-colors",
                            category.isActive
                              ? "font-semibold text-zinc-100"
                              : "font-medium text-zinc-400 group-hover/row:text-zinc-200",
                          )}
                        >
                          {category.name}
                        </span>
                        <div className="hidden shrink-0 gap-0.5 group-hover/row:flex">
                          <Button
                            type="button"
                            variant="ghost"
                            size="icon-xs"
                            className="size-5 text-zinc-500 hover:bg-white/10 hover:text-zinc-100"
                            disabled={busy}
                            onClick={(e) => {
                              e.stopPropagation();
                              onStartRename({
                                id: category.id,
                                name: category.name,
                              });
                            }}
                            aria-label={`Rename ${category.name}`}
                          >
                            <Pencil className="size-3" />
                          </Button>
                          <Button
                            type="button"
                            variant="ghost"
                            size="icon-xs"
                            className="size-5 text-zinc-500 hover:bg-red-500/15 hover:text-red-500"
                            disabled={busy}
                            onClick={(e) => {
                              e.stopPropagation();
                              onRequestDelete(category.id);
                            }}
                            aria-label={`Delete ${category.name}`}
                          >
                            <X className="size-3.5" />
                          </Button>
                        </div>
                      </div>
                      <div className="mt-1.5 flex items-center gap-2 pl-3.5">
                        <Progress
                          value={category.progressPct}
                          className="h-[2px] flex-1 bg-white/5"
                          indicatorClassName={cn(
                            "opacity-65",
                            category.colorClass,
                          )}
                        />
                        <span className="font-mono text-[9px] whitespace-nowrap text-zinc-700">
                          {category.doneCount}/{category.totalCount}
                        </span>
                      </div>
                    </>
                  )}
                </div>
              ))
            ) : (
              <div className="mx-1.5 rounded-lg border border-white/5 bg-white/2 px-3 py-6 text-center text-xs text-zinc-600">
                No categories yet
              </div>
            )}
          </div>
        </SidebarContent>

        <SidebarRail />
      </div>

      <ConfirmActionDialog
        open={deleteDialogOpen}
        onOpenChange={onDeleteDialogOpenChange}
        title="Delete this category?"
        description={
          categoryPendingDeleteName ? (
            <>
              <span className="font-medium text-foreground">
                {categoryPendingDeleteName}
              </span>{" "}
              will be removed permanently. This cannot be undone.
            </>
          ) : null
        }
        onConfirm={onConfirmDelete}
      />
    </Sidebar>
  );
}
