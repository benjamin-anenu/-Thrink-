
import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { ThemeProvider } from "next-themes";
import { WorkspaceProvider } from "@/contexts/WorkspaceContext";
import { ProjectProvider } from "@/contexts/ProjectContext";
import Index from "./pages/Index";
import Dashboard from "./pages/Dashboard";
import Projects from "./pages/Projects";
import ProjectManagement from "./pages/ProjectManagement";
import Resources from "./pages/Resources";
import Stakeholders from "./pages/Stakeholders";
import Analytics from "./pages/Analytics";
import Workspaces from "./pages/Workspaces";
import Login from "./pages/Login";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider
        attribute="class"
        defaultTheme="dark"
        enableSystem={true}
        disableTransitionOnChange={false}
      >
        <TooltipProvider>
          <WorkspaceProvider>
            <ProjectProvider>
              <Toaster />
              <BrowserRouter>
                <Routes>
                  <Route path="/" element={<Index />} />
                  <Route path="/login" element={<Login />} />
                  <Route path="/dashboard" element={<Dashboard />} />
                  <Route path="/projects" element={<Projects />} />
                  <Route path="/project/:id" element={<ProjectManagement />} />
                  <Route path="/resources" element={<Resources />} />
                  <Route path="/stakeholders" element={<Stakeholders />} />
                  <Route path="/analytics" element={<Analytics />} />
                  <Route path="/workspaces" element={<Workspaces />} />
                  <Route path="*" element={<NotFound />} />
                </Routes>
              </BrowserRouter>
            </ProjectProvider>
          </WorkspaceProvider>
        </TooltipProvider>
      </ThemeProvider>
    </QueryClientProvider>
  );
}

export default App;
