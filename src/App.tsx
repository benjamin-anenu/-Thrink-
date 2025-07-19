
import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { ProjectProvider } from "@/contexts/ProjectContext";
import { ResourceProvider } from "@/contexts/ResourceContext";
import { WorkspaceProvider } from "@/contexts/WorkspaceContext";
import Dashboard from "./pages/Dashboard";
import Projects from "./pages/Projects";
import Resources from "./pages/Resources";
import Analytics from "./pages/Analytics";
import Stakeholders from "./pages/Stakeholders";
import RecycleBin from "./components/RecycleBin";
import ProjectManagement from "./pages/ProjectManagement";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <WorkspaceProvider>
        <ProjectProvider>
          <ResourceProvider>
            <Toaster />
            <BrowserRouter>
              <Routes>
                <Route path="/" element={<Dashboard />} />
                <Route path="/projects" element={<Projects />} />
                <Route path="/resources" element={<Resources />} />
                <Route path="/analytics" element={<Analytics />} />
                <Route path="/stakeholders" element={<Stakeholders />} />
                <Route path="/recycle-bin" element={<RecycleBin />} />
                <Route path="/project-management/:projectId" element={<ProjectManagement />} />
                <Route path="/project/:projectId" element={<ProjectManagement />} />
              </Routes>
            </BrowserRouter>
          </ResourceProvider>
        </ProjectProvider>
      </WorkspaceProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
