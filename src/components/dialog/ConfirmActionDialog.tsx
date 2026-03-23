import { useState, type ReactNode } from "react";
import {
  AlertDialog,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { Loader2 } from "lucide-react";

export type ConfirmActionDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  description?: ReactNode;
  /** Label for the primary action (e.g. Delete, Remove) */
  confirmLabel?: string;
  cancelLabel?: string;
  confirmVariant?: React.ComponentProps<typeof Button>["variant"];
  /** Async work to run when the user confirms (e.g. API call). Dialog closes after success. */
  onConfirm: () => Promise<void>;
};

export function ConfirmActionDialog({
  open,
  onOpenChange,
  title,
  description,
  confirmLabel = "Confirm",
  cancelLabel = "Cancel",
  confirmVariant = "destructive",
  onConfirm,
}: ConfirmActionDialogProps) {
  const [pending, setPending] = useState(false);

  const handleConfirm = async () => {
    setPending(true);
    try {
      await onConfirm();
      onOpenChange(false);
    } finally {
      setPending(false);
    }
  };

  return (
    <AlertDialog
      open={open}
      onOpenChange={(next) => {
        if (pending) return;
        onOpenChange(next);
      }}
    >
      <AlertDialogContent
        className={cn(
          "overflow-hidden border-primary/25 bg-linear-to-b from-primary/10 from-0% via-background via-45% to-blue-500/5 to-100% p-0 shadow-lg shadow-primary/15 backdrop-blur-md sm:max-w-md",
          "dark:from-primary/14 dark:via-background dark:to-blue-950/35",
        )}
      >
        <div className="border-b border-primary/15 bg-linear-to-r from-primary/8 via-primary/4 to-blue-500/6 px-6 py-4 dark:from-primary/12 dark:via-primary/6 dark:to-blue-950/30">
          <AlertDialogHeader className="gap-1 space-y-0 text-left sm:text-left">
            <AlertDialogTitle className="text-foreground">
              {title}
            </AlertDialogTitle>
            {description ? (
              <AlertDialogDescription className="text-balance text-muted-foreground">
                {description}
              </AlertDialogDescription>
            ) : null}
          </AlertDialogHeader>
        </div>
        <AlertDialogFooter className="flex flex-col-reverse gap-2 bg-linear-to-t from-primary/5 to-transparent px-2 py-2 sm:flex-row sm:justify-end dark:from-primary/8">
          <AlertDialogCancel disabled={pending} type="button">
            {cancelLabel}
          </AlertDialogCancel>
          <Button
            type="button"
            variant={confirmVariant}
            disabled={pending}
            className="gap-2"
            onClick={handleConfirm}
          >
            {pending ? (
              <Loader2 className="size-4 shrink-0 animate-spin" aria-hidden />
            ) : null}
            <span>{confirmLabel}</span>
          </Button>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
