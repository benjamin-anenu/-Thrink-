import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "./contexts/AuthContext";
import { WorkspaceProvider } from "./contexts/WorkspaceContext";
import { ProjectProvider } from "./contexts/ProjectContext";
import { ResourceProvider } from "./contexts/ResourceContext";
import { StakeholderProvider } from "./contexts/StakeholderContext";
import { TaskProvider } from "./contexts/TaskContext";
import Index from "./pages/Index";
import Dashboard from "./pages/Dashboard";
import Projects from "./pages/Projects";
import ProjectManagement from "./pages/ProjectManagement";
import Resources from "./pages/Resources";
import Stakeholders from "./pages/Stakeholders";
import Analytics from "./pages/Analytics";
import Auth from "./pages/Auth";
import AIHub from "./pages/AIHub";
import NotFound from "./pages/NotFound";
import Workspaces from "./pages/Workspaces";
import { AuthGuard } from "./components/auth/AuthGuard";
import Layout from "./components/Layout";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <BrowserRouter>
        <AuthProvider>
          <WorkspaceProvider>
            <ProjectProvider>
              <ResourceProvider>
                <StakeholderProvider>
                  <TaskProvider>
                    <div className="min-h-screen bg-background font-sans antialiased">
                      <Routes>
                        {/* Public routes */}
                        <Route path="/" element={<Index />} />
                        <Route path="/auth" element={<Auth />} />
                        
                        {/* Protected routes with Layout wrapper */}
                        <Route path="/dashboard" element={
                          <AuthGuard>
                            <Layout>
                              <Dashboard />
                            </Layout>
                          </AuthGuard>
                        } />
                        <Route path="/workspaces" element={
                          <AuthGuard>
                            <Layout>
                              <Workspaces />
                            </Layout>
                          </AuthGuard>
                        } />
                        <Route path="/projects" element={
                          <AuthGuard>
                            <Layout>
                              <Projects />
                            </Layout>
                          </AuthGuard>
                        } />
                        <Route path="/projects/:projectId" element={
                          <AuthGuard>
                            <Layout>
                              <ProjectManagement />
                            </Layout>
                          </AuthGuard>
                        } />
                        <Route path="/resources" element={
                          <AuthGuard>
                            <Layout>
                              <Resources />
                            </Layout>
                          </AuthGuard>
                        } />
                        <Route path="/stakeholders" element={
                          <AuthGuard>
                            <Layout>
                              <Stakeholders />
                            </Layout>
                          </AuthGuard>
                        } />
                        <Route path="/analytics" element={
                          <AuthGuard>
                            <Layout>
                              <Analytics />
                            </Layout>
                          </AuthGuard>
                        } />
                        <Route path="/ai-hub" element={
                          <AuthGuard>
                            <Layout>
                              <AIHub />
                            </Layout>
                          </AuthGuard>
                        } />
                        
                        {/* Fallback route */}
                        <Route path="*" element={<NotFound />} />
                      </Routes>
                    </div>
                    <Toaster />
                    <Sonner />
                  </TaskProvider>
                </StakeholderProvider>
              </ResourceProvider>
            </ProjectProvider>
          </WorkspaceProvider>
        </AuthProvider>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
