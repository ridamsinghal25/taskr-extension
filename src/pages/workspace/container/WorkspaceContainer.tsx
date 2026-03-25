import { useEffect } from "react";
import { useParams } from "react-router-dom";
import { Workspace  } from "../presentation/Workspace";
import { useTaskContext } from "@/context/TaskContext/TaskContextProvider";
import { useNoteContext } from "@/context/NoteContext/NoteContextProvider";
import { useCategoryContext } from "@/context/CategoryContext/CategoryContextProvider";

export function WorkspaceContainer() {
  let { categoryId } = useParams<{ categoryId?: string }>();

  const { setCurrentCategoryId } = useCategoryContext();

  const {
    tasks,
    isFetching: isTaskFetching,
    isTaskMode,
    setIsTaskMode,
  } = useTaskContext();

  const { notes, isFetching: isNoteFetching } = useNoteContext();

  const { categories } = useCategoryContext();

  useEffect(() => {
    if (categoryId) {
      setCurrentCategoryId(categoryId);
    } else {
      setCurrentCategoryId(null);
    }
  }, [categoryId, setCurrentCategoryId]);

  return (
    <>
      <Workspace
        categoryId={categoryId as string}
        categories={categories}
        tasks={tasks}
        notes={notes}
        isTaskFetching={isTaskFetching}
        isNoteFetching={isNoteFetching}
        isTaskMode={isTaskMode}
        setIsTaskMode={setIsTaskMode}
      />
    </>
  );
}
