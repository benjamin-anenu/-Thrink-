
import React from 'react';
import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { ThemeProvider } from "next-themes";
import Index from "./pages/Index";
import Dashboard from "./pages/Dashboard";
import AdminDashboard from "./pages/AdminDashboard";
import Projects from "./pages/Projects";
import Resources from "./pages/Resources";
import Stakeholders from "./pages/Stakeholders";
import Analytics from "./pages/Analytics";
import AIHub from "./pages/AIHub";
import ProjectManagement from "./pages/ProjectManagement";
import Auth from "./pages/Auth";
import Login from "./pages/Login";
import Workspaces from "./pages/Workspaces";
import NotFound from "./pages/NotFound";
import SystemHealth from "./pages/SystemHealth";
import SystemPerformance from "./pages/SystemPerformance";
import SystemEscalations from "./pages/SystemEscalations";
import SystemReports from "./pages/SystemReports";
import SystemPortfolio from "./pages/SystemPortfolio";
import { AuthProvider } from "./contexts/AuthContext";
import { EnterpriseProvider } from "./contexts/EnterpriseContext";
import { ProjectProvider } from "./contexts/ProjectContext";
import { ResourceProvider } from "./contexts/ResourceContext";
import { StakeholderProvider } from "./contexts/StakeholderContext";
import { WorkspaceProvider } from "./contexts/WorkspaceContext";
import { TaskProvider } from "./contexts/TaskContext";
import GlobalErrorHandler from "./components/GlobalErrorHandler";
import ErrorBoundary from "./components/ErrorBoundary";
import NetworkErrorHandler from "./components/NetworkErrorHandler";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000, // 5 minutes
      retry: (failureCount, error) => {
        // Don't retry on 404 errors or network failures that might cause loops
        if (error instanceof Error && (
          error.message.includes('404') || 
          error.message.includes('net::ERR_FAILED') ||
          error.message.includes('fetch')
        )) {
          console.log('[QueryClient] Not retrying due to network error:', error.message);
          return false;
        }
        return failureCount < 2; // Limit retries to prevent loops
      },
      retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
    },
  },
});

// Create a separate component for the main app content
const AppContent: React.FC = () => {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Index />} />
        <Route path="/auth" element={<Auth />} />
        <Route path="/login" element={<Login />} />
        <Route path="/dashboard" element={
          <ErrorBoundary fallback={
            <div className="p-8 text-center">
              <p>Unable to load dashboard. Please try refreshing the page.</p>
            </div>
          }>
            <Dashboard />
          </ErrorBoundary>
        } />
        <Route path="/admin" element={
          <ErrorBoundary fallback={
            <div className="p-8 text-center">
              <p>Unable to load admin dashboard. Please try refreshing the page.</p>
            </div>
          }>
            <AdminDashboard />
          </ErrorBoundary>
        } />
        <Route path="/projects" element={
          <ErrorBoundary fallback={
            <div className="p-8 text-center">
              <p>Unable to load projects. Please try refreshing the page.</p>
            </div>
          }>
            <Projects />
          </ErrorBoundary>
        } />
        <Route path="/resources" element={
          <ErrorBoundary>
            <Resources />
          </ErrorBoundary>
        } />
        <Route path="/stakeholders" element={
          <ErrorBoundary>
            <Stakeholders />
          </ErrorBoundary>
        } />
        <Route path="/analytics" element={
          <ErrorBoundary>
            <Analytics />
          </ErrorBoundary>
        } />
        <Route path="/ai-hub" element={
          <ErrorBoundary>
            <AIHub />
          </ErrorBoundary>
        } />
        <Route path="/system/portfolio" element={
          <ErrorBoundary>
            <SystemPortfolio />
          </ErrorBoundary>
        } />
        <Route path="/system/health" element={
          <ErrorBoundary>
            <SystemHealth />
          </ErrorBoundary>
        } />
        <Route path="/system/performance" element={
          <ErrorBoundary>
            <SystemPerformance />
          </ErrorBoundary>
        } />
        <Route path="/system/escalations" element={
          <ErrorBoundary>
            <SystemEscalations />
          </ErrorBoundary>
        } />
        <Route path="/system/reports" element={
          <ErrorBoundary>
            <SystemReports />
          </ErrorBoundary>
        } />
        <Route path="/project/:id" element={
          <ErrorBoundary>
            <ProjectManagement />
          </ErrorBoundary>
        } />
        <Route path="/workspaces" element={
          <ErrorBoundary>
            <Workspaces />
          </ErrorBoundary>
        } />
        <Route path="*" element={<NotFound />} />
      </Routes>
      <Toaster />
    </BrowserRouter>
  );
};

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider attribute="class" defaultTheme="dark" forcedTheme="dark" enableSystem={false}>
        <TooltipProvider>
          <ErrorBoundary>
            <NetworkErrorHandler>
              <GlobalErrorHandler>
                <AuthProvider>
                  <EnterpriseProvider>
                    <WorkspaceProvider>
                      <ProjectProvider>
                        <TaskProvider>
                          <ResourceProvider>
                            <StakeholderProvider>
                              <AppContent />
                            </StakeholderProvider>
                          </ResourceProvider>
                        </TaskProvider>
                      </ProjectProvider>
                    </WorkspaceProvider>
                  </EnterpriseProvider>
                </AuthProvider>
              </GlobalErrorHandler>
            </NetworkErrorHandler>
          </ErrorBoundary>
        </TooltipProvider>
      </ThemeProvider>
    </QueryClientProvider>
  );
}

export default App;
