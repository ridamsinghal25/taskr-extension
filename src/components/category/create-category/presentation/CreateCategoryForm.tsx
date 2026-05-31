import { Loader2 } from "lucide-react";
import type { UseFormReturn } from "react-hook-form";
import { Button } from "@/components/ui/button";
import { Form } from "@/components/ui/form";
import FormFieldInput from "@/components/basic/FormFieldInput";
import type { CreateCategoryFormValues } from "@/components/category/create-category/types";

type Props = {
  form: UseFormReturn<CreateCategoryFormValues>;
  isCreating: boolean;
  onSubmit: (values: CreateCategoryFormValues) => Promise<void>;
  onCancel: () => void;
};

export function CreateCategoryForm({
  form,
  isCreating,
  onSubmit,
  onCancel,
}: Props) {
  return (
    <div className="px-2.5 pb-2">
      <Form {...form}>
        <form
          onSubmit={form.handleSubmit(onSubmit)}
          className="flex flex-col gap-1.5"
        >
          <FormFieldInput
            form={form}
            name="name"
            placeholder="Category name…"
            disabled={isCreating}
            className="h-7 rounded-md border-white/10 bg-white/4 px-2.5 text-xs text-zinc-100 placeholder:text-zinc-700 focus-visible:border-white/20 focus-visible:ring-0"
            aria-label="New category name"
            autoFocus
          />
          <div className="flex gap-1.5">
            <Button
              type="submit"
              size="sm"
              className="h-7 flex-1 rounded-md bg-indigo-500 px-2 text-[11px] font-semibold text-white hover:bg-indigo-600"
              disabled={isCreating}
            >
              {isCreating ? (
                <Loader2 className="h-3 w-3 animate-spin" aria-hidden />
              ) : (
                "Add"
              )}
            </Button>
            <Button
              type="button"
              size="sm"
              variant="ghost"
              className="h-7 flex-1 rounded-md bg-white/6 px-2 text-[11px] font-semibold text-zinc-400 hover:bg-white/10 hover:text-zinc-200"
              onClick={onCancel}
            >
              Cancel
            </Button>
          </div>
        </form>
      </Form>
    </div>
  );
}
