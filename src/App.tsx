import "./App.css";
import { Route, Routes } from "react-router-dom";
import { MainLayout } from "./layout/MainLayout";
import { WorkspaceContainer } from "./pages/workspace/container/WorkspaceContainer";
import { HomePage } from "./pages/home/HomePage";
import { NoteProvider } from "@/context/NoteContext/NoteContextProvider";
import { TaskProvider } from "@/context/TaskContext/TaskContextProvider";
import { CategoryProvider } from "./context/CategoryContext/CategoryContextProvider";

function App() {
  return (
    <CategoryProvider>
      <TaskProvider>
        <NoteProvider>
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/workspace" element={<MainLayout />}>
              <Route index element={<WorkspaceContainer />} />
              <Route
                path="categories/:categoryId"
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
