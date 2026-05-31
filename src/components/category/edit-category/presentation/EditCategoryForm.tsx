import { Check, Loader2, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

type Props = {
  categoryId: string;
  colorClass: string;
  draft: string;
  busy: boolean;
  onDraftChange: (value: string) => void;
  onCommit: (categoryId: string) => void;
  onCancel: () => void;
};

export function EditCategoryForm({
  categoryId,
  colorClass,
  draft,
  busy,
  onDraftChange,
  onCommit,
  onCancel,
}: Props) {
  return (
    <div className="flex items-center gap-2">
      <span
        className={cn("h-1.5 w-1.5 shrink-0 rounded-full", colorClass)}
        aria-hidden
      />
      <input
        value={draft}
        onChange={(e) => onDraftChange(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === "Enter") {
            e.preventDefault();
            void onCommit(categoryId);
          }
          if (e.key === "Escape") onCancel();
        }}
        onClick={(e) => e.stopPropagation()}
        className="min-w-0 flex-1 rounded border border-white/15 bg-white/8 px-1.5 py-0.5 text-xs font-medium text-zinc-100 outline-none focus:border-white/25"
        autoFocus
        disabled={busy}
        aria-label="Category name"
      />
      <div className="flex shrink-0 gap-0.5">
        <Button
          type="button"
          variant="ghost"
          size="icon-xs"
          className="size-5 text-zinc-400 hover:bg-white/10 hover:text-zinc-100"
          disabled={busy}
          onClick={(e) => {
            e.stopPropagation();
            void onCommit(categoryId);
          }}
          aria-label="Save name"
        >
          {busy ? (
            <Loader2 className="size-3 animate-spin" />
          ) : (
            <Check className="size-3" />
          )}
        </Button>
        <Button
          type="button"
          variant="ghost"
          size="icon-xs"
          className="size-5 text-zinc-400 hover:bg-white/10 hover:text-zinc-100"
          disabled={busy}
          onClick={(e) => {
            e.stopPropagation();
            onCancel();
          }}
          aria-label="Cancel rename"
        >
          <X className="size-3" />
        </Button>
      </div>
    </div>
  );
}
