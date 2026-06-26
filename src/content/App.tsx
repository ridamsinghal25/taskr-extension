import { useEffect, useState } from "react";
import AddTaskDialog from "./TaskDialog/container/TaskDialogContainer";

type AppProps = {
  container: HTMLElement;
};

export default function App({ container }: AppProps) {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      const isMac = navigator.platform.toUpperCase().includes("MAC");

      const modifierPressed = isMac ? event.metaKey : event.ctrlKey;

      if (modifierPressed && event.shiftKey && event.code === "Space") {
        event.preventDefault();
        setOpen(true);
      }
    };

    window.addEventListener("keydown", handleKeyDown, true);

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, []);

  return (
    <AddTaskDialog
      open={open}
      onOpenChange={setOpen}
      container={container}
    />
  );
}
