import { Outlet } from "react-router-dom";
import { AppSidebar } from "@/components/sidebar/AppSidebar";

export function MainLayout() {
  return (
    <div className="h-screen w-full flex overflow-hidden">
      <AppSidebar />
      <main className="flex-1 overflow-hidden h-full md:ml-16">
        <Outlet />
      </main>
    </div>
  );
}
