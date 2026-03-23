import "./App.css";
import { Route, Routes } from "react-router-dom";
import { MainLayout } from "./layout/MainLayout";
import { TaskContainer } from "./pages/task/container/TaskContainer";
import { NoteProvider } from "@/context/NoteContext/NoteContextProvider";
import { TaskProvider } from "@/context/TaskContext/TaskContextProvider";
import { CategoryProvider } from "./context/CategoryContext/CategoryContextProvider";
import Test from "./pages/Test";

function App() {
  return (
    <CategoryProvider>
      <TaskProvider>
        <NoteProvider>
        <Routes>
          <Route path="/" element={<MainLayout />}>
            <Route index element={<TaskContainer />} />
            <Route path="categories/:categoryId" element={<TaskContainer />} />
          </Route>
          <Route path="/test" element={<Test />} />
          <Route path="/t" element={<div>TEST</div>} />
        </Routes>
        </NoteProvider>
      </TaskProvider>
    </CategoryProvider>
  );
}

export default App;
