import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import App from "./App.tsx";
import { HashRouter } from "react-router-dom";
import { ThemeProvider } from "@/components/basic/theme-provider.tsx";
import { TooltipProvider } from "./components/ui/tooltip.tsx";
import { SidebarProvider } from "./components/ui/sidebar.tsx";
import ToastConfig from "./components/basic/ToastConfig.tsx";

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <HashRouter>
      <ThemeProvider defaultTheme="dark" storageKey="vite-ui-theme">
        <SidebarProvider>
          <TooltipProvider>
            <App />
            <ToastConfig />
          </TooltipProvider>
        </SidebarProvider>
      </ThemeProvider>
    </HashRouter>
  </StrictMode>,
);
