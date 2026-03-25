import {
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Textarea } from "@/components/ui/textarea";
import type { TextareaHTMLAttributes } from "react";
import type { UseFormReturn } from "react-hook-form";

type TextareaProps = {
  form: UseFormReturn<any>;
  label?: string;
  name: string;
  description?: string;
  placeholder?: string;
} & Omit<TextareaHTMLAttributes<HTMLTextAreaElement>, "form" | "name" | "onChange" | "type" | "placeholder" | "label">;

function FormFieldTextarea({
  form,
  label,
  name,
  description,
  placeholder,
  ...props
}: TextareaProps) {
  return (
    <>
      <FormField
        control={form.control}
        name={name}
        render={({ field, fieldState }) => (
          <FormItem>
            <FormLabel className={fieldState.error && "dark:text-red-500"}>
              {label}
            </FormLabel>
            <FormControl>
              <Textarea
                placeholder={placeholder}
                {...field}
                {...props}
              />
            </FormControl>
            {description && <FormDescription>{description}</FormDescription>}
            <FormMessage className={fieldState.error && "dark:text-red-500"} />
          </FormItem>
        )}
      />
    </>
  );
}

export default FormFieldTextarea;