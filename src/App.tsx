import "./App.css";
import { Route, Routes } from "react-router-dom";
import { MainLayout } from "./layout/MainLayout";
import { WorkspaceContainer } from "./pages/workspace/container/WorkspaceContainer";
import { HomePage } from "./pages/home/HomePage";
import { NoteProvider } from "@/context/NoteContext/NoteContextProvider";
import { TaskProvider } from "@/context/TaskContext/TaskContextProvider";
import { CategoryProvider } from "./context/CategoryContext/CategoryContextProvider";
import ROUTES from "./constants/routes";

function App() {
  return (
    <CategoryProvider>
      <TaskProvider>
        <NoteProvider>
          <Routes>
            <Route path={ROUTES.HOME} element={<HomePage />} />
            <Route path={ROUTES.WORKSPACE} element={<MainLayout />}>
              <Route index element={<WorkspaceContainer />} />
              <Route
                path={ROUTES.WORKSPACE_CATEGORIES}
                element={<WorkspaceContainer />}
              />
            </Route>
          </Routes>
        </NoteProvider>
      </TaskProvider>
    </CategoryProvider>
  );
}

export default App;
