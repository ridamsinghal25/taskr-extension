import DraggableCardDemo from "@/components/home/DraggableCards";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import TaskrIcon from "../../../public/taskr.svg";

export function HomePage() {

  return (
    <div className="relative flex min-h-screen w-full flex-col overflow-hidden bg-[#f7f7f5] dark:bg-neutral-950">

      {/* ── Top nav bar ────────────────────────────────────────────────── */}
      <header className="relative z-20 flex items-center justify-between px-6 py-4 md:px-10">
        {/* Logo / wordmark */}
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg bg-neutral-900 dark:bg-white flex items-center justify-center">
            <img src={TaskrIcon} alt="Taskr" className="w-full h-full" />
          </div>
          <span className="text-sm font-semibold tracking-tight text-neutral-900 dark:text-white">
            Taskr
          </span>
        </div>

        {/* Nav CTA */}
        <Button
          asChild
          variant="outline"
          size="sm"
          className="rounded-full border-neutral-300 dark:border-neutral-700 text-neutral-700 dark:text-neutral-300 hover:bg-neutral-100 dark:hover:bg-neutral-800 text-xs font-medium"
        >
          <Link to="/workspace">Open workspace →</Link>
        </Button>
      </header>

       {/* ── Draggable cards — fills the rest of the viewport ───────────── */}
      <div className="relative flex-1 w-full">
        {/* Soft vignette so cards fade into the page at top */}
        <div className="pointer-events-none absolute inset-x-0 top-0 h-24 z-10
          bg-linear-to-b from-[#f7f7f5] dark:from-neutral-950 to-transparent" />

        <DraggableCardDemo />

        {/* Vignette bottom */}
        <div className="pointer-events-none absolute inset-x-0 bottom-0 h-32 z-10
          bg-linear-to-t from-[#f7f7f5] dark:from-neutral-950 to-transparent" />
      </div>

    </div>
  );
}