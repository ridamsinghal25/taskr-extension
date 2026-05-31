import z from "zod";

export type CreateCategoryFormValues = {
  name: string;
};

export const createCategoryFormSchema = z.object({
  name: z
    .string()
    .trim()
    .min(4, { message: "Category name must be at least 4 characters long" }),
});