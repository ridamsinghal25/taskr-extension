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
        className="gap-0 overflow-hidden rounded-xl border border-white/6 bg-[#09090f] p-0 text-zinc-300 shadow-xl shadow-black/60 sm:max-w-md"
      >
        <div className="border-b border-white/6 bg-[#0a0a14] px-5 py-4">
          <AlertDialogHeader className="gap-0 space-y-0 text-left sm:text-left">
            <AlertDialogTitle className="text-sm font-semibold text-zinc-100">
              {title}
            </AlertDialogTitle>
            {description ? (
              <AlertDialogDescription className="mt-1.5 text-balance text-xs leading-relaxed text-zinc-500 [&_span]:font-medium [&_span]:text-zinc-200">
                {description}
              </AlertDialogDescription>
            ) : null}
          </AlertDialogHeader>
        </div>
        <AlertDialogFooter className="flex flex-col-reverse gap-2 border-t border-white/6 bg-[#09090f] px-4 py-2 sm:flex-row sm:justify-end">
          <AlertDialogCancel
            disabled={pending}
            type="button"
            className="h-9 rounded-lg border-white/10 bg-white/6 px-4 text-xs font-semibold text-zinc-300 hover:border-white/15 hover:bg-white/10 hover:text-zinc-100"
          >
            {cancelLabel}
          </AlertDialogCancel>
          <Button
            type="button"
            variant={confirmVariant}
            disabled={pending}
            className={cn(
              "h-9 gap-2 rounded-lg px-4 text-xs font-semibold",
              confirmVariant === "destructive" &&
                "border-0 bg-red-500 text-white hover:bg-red-600",
            )}
            onClick={handleConfirm}
            autoFocus
          >
            {pending ? (
              <Loader2 className="size-3.5 shrink-0 animate-spin" aria-hidden />
            ) : null}
            <span>{confirmLabel}</span>
          </Button>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
