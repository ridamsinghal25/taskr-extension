import {
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import type { InputHTMLAttributes } from "react";
import type { UseFormReturn } from "react-hook-form";

type Props = {
  form: UseFormReturn<any>;
  label?: string;
  name: string;
  description?: string;
  placeholder?: string;
  type?: "text" | "password" | "email" | "number" | "file";
  onChange?: (value: any) => void;
} & Omit<
    InputHTMLAttributes<HTMLInputElement>,
    "form" | "name" | "onChange" | "type" | "placeholder"
  >;

function FormFieldInput({
  form,
  label,
  name,
  description,
  placeholder,
  type = "text",
  ...props
}: Props) {
  return (
    <>
      <FormField
        control={form.control}
        name={name}
        render={({ field, fieldState }) => (
          <FormItem>
            {label && (
              <FormLabel className={fieldState.error && "dark:text-red-500"}>
                {label}
              </FormLabel>
            )}
            <FormControl>
              {type === "file" ? (
                <Input
                  type="file"
                  {...props}
                  onChange={(e) => {
                    const file = e.target.files;

                    field.onChange(file);

                    if (props.onChange) {
                      props.onChange(e);
                    }
                  }}
                />
              ) : (
                <Input
                  placeholder={placeholder}
                  type={type}
                  {...field}
                  {...props}
                />
              )}
            </FormControl>
            {description && <FormDescription>{description}</FormDescription>}
            <FormMessage className={fieldState.error && "dark:text-red-500"} />
          </FormItem>
        )}
      />
    </>
  );
}

export default FormFieldInput;