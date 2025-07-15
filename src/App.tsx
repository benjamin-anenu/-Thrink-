import { Suspense, lazy } from 'react';
import { Toaster } from '@/components/ui/sonner';
import { TooltipProvider } from '@/components/ui/tooltip';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { ThemeProvider } from 'next-themes';
import { ProjectProvider } from '@/contexts/ProjectContext';
import { ResourceProvider } from '@/contexts/ResourceContext';
import { StakeholderProvider } from '@/contexts/StakeholderContext';
import { WorkspaceProvider } from '@/contexts/WorkspaceContext';
import { initializeNotificationIntegration } from '@/services/NotificationIntegrationService';
import { startEmailReminderService } from '@/services/EmailReminderService';
import { initializePerformanceTracking } from '@/services/PerformanceTracker';

// Lazy load components
const Index = lazy(() => import('@/pages/Index'));
const Login = lazy(() => import('@/pages/Login'));
const Dashboard = lazy(() => import('@/pages/Dashboard'));
const Projects = lazy(() => import('@/pages/Projects'));
const ProjectManagement = lazy(() => import('@/pages/ProjectManagement'));
const Resources = lazy(() => import('@/pages/Resources'));
const Stakeholders = lazy(() => import('@/pages/Stakeholders'));
const Analytics = lazy(() => import('@/pages/Analytics'));
const Workspaces = lazy(() => import('@/pages/Workspaces'));
const NotFound = lazy(() => import('@/pages/NotFound'));

// Create a client
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5, // 5 minutes
      retry: 1,
    },
  },
});

// Initialize services
initializeNotificationIntegration();
startEmailReminderService();
initializePerformanceTracking();

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
        <TooltipProvider>
          <WorkspaceProvider>
            <ResourceProvider>
              <StakeholderProvider>
                <ProjectProvider>
                  <BrowserRouter>
                    <div className="min-h-screen bg-background font-sans antialiased">
                      <Suspense fallback={
                        <div className="flex items-center justify-center h-screen">
                          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div>
                        </div>
                      }>
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
                          <Route path="/404" element={<NotFound />} />
                          <Route path="*" element={<Navigate to="/404" replace />} />
                        </Routes>
                      </Suspense>
                      <Toaster />
                    </div>
                  </BrowserRouter>
                </ProjectProvider>
              </StakeholderProvider>
            </ResourceProvider>
          </WorkspaceProvider>
        </TooltipProvider>
      </ThemeProvider>
    </QueryClientProvider>
  );
}

export default App;
