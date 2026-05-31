import { useState } from "react";
import { useForm } from "react-hook-form";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useCategoryContext } from "@/context/CategoryContext/CategoryContextProvider";
import { isApiResponse } from "@/lib/typeGuard";
import { CreateCategoryForm } from "@/components/category/create-category/presentation/CreateCategoryForm";
import type { CreateCategoryFormValues } from "@/components/category/create-category/types";
import { zodResolver } from "@hookform/resolvers/zod";
import { createCategoryFormSchema } from "@/components/category/create-category/types";

export function CreateCategoryContainer() {
  const { isCreating, createCategory } = useCategoryContext();

  const form = useForm<CreateCategoryFormValues>({
    defaultValues: { name: "" },
    resolver: zodResolver(createCategoryFormSchema),
  });

  const [showForm, setShowForm] = useState(false);

  const resetForm = () => {
    setShowForm(false);
    form.reset({ name: "" });
  };

  const handleSubmit = async (values: CreateCategoryFormValues) => {
    const trimmed = values.name.trim();
    if (!trimmed) return;
    const response = await createCategory(trimmed);
    if (isApiResponse(response) && response.success) {
      resetForm();
    }
  };

  return (
    <>
      <div className="flex items-center justify-between px-3 pt-3 pb-1.5">
        <span className="text-[10px] font-bold tracking-[0.18em] text-zinc-600 uppercase">
          Categories
        </span>
        <Button
          type="button"
          variant="ghost"
          size="icon-xs"
          onClick={() => setShowForm((v) => !v)}
          className="size-5 border border-white/10 text-zinc-500 hover:border-white/20 hover:bg-white/6 hover:text-zinc-200"
          aria-label="Toggle new category form"
        >
          <Plus className="size-3" />
        </Button>
      </div>
      {showForm && (
        <CreateCategoryForm
          form={form}
          isCreating={isCreating}
          onSubmit={handleSubmit}
          onCancel={resetForm}
        />
      )}
    </>
  );
}
