
import { Suspense, lazy } from 'react';
import { Toaster } from '@/components/ui/sonner';
import { TooltipProvider } from '@/components/ui/tooltip';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { ThemeProvider } from 'next-themes';
import { AuthProvider } from '@/contexts/AuthContext';
import { ProjectProvider } from '@/contexts/ProjectContext';
import { ResourceProvider } from '@/contexts/ResourceContext';
import { StakeholderProvider } from '@/contexts/StakeholderContext';
import { WorkspaceProvider } from '@/contexts/WorkspaceContext';
import { initializeNotificationIntegration } from '@/services/NotificationIntegrationService';
import { startEmailReminderService } from '@/services/EmailReminderService';
import { initializePerformanceTracking } from '@/services/PerformanceTracker';
import ErrorBoundary from '@/components/ErrorBoundary';
import GlobalErrorHandler from '@/components/GlobalErrorHandler';
import PerformanceMonitor from '@/components/PerformanceMonitor';
import { useOfflineStatus } from '@/hooks/useOfflineStatus';
import { ProtectedRoute } from '@/components/auth/ProtectedRoute';
import { SessionTimeoutProvider } from '@/components/auth/SessionTimeoutProvider';

// Lazy load components
const Index = lazy(() => import('@/pages/Index'));
const Login = lazy(() => import('@/pages/Login'));
const Register = lazy(() => import('@/pages/Register'));
const Dashboard = lazy(() => import('@/pages/Dashboard'));
const Projects = lazy(() => import('@/pages/Projects'));
const ProjectManagement = lazy(() => import('@/pages/ProjectManagement'));
const Resources = lazy(() => import('@/pages/Resources'));
const Stakeholders = lazy(() => import('@/pages/Stakeholders'));
const Analytics = lazy(() => import('@/pages/Analytics'));
const Workspaces = lazy(() => import('@/pages/Workspaces'));
const NotFound = lazy(() => import('@/pages/NotFound'));
const Settings = lazy(() => import('@/pages/Settings'));

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

function AppContent() {
  const offlineStatus = useOfflineStatus();

  return (
    <div id="main-content" className="min-h-screen bg-background font-sans antialiased">
      <Suspense fallback={
        <div className="flex items-center justify-center h-screen">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div>
        </div>
      }>
        <Routes>
          {/* Public routes */}
          <Route path="/" element={<Index />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/404" element={<NotFound />} />
          
          {/* Protected routes */}
          <Route path="/dashboard" element={
            <ProtectedRoute>
              <Dashboard />
            </ProtectedRoute>
          } />
          <Route path="/projects" element={
            <ProtectedRoute>
              <Projects />
            </ProtectedRoute>
          } />
          <Route path="/project/:id" element={
            <ProtectedRoute>
              <ProjectManagement />
            </ProtectedRoute>
          } />
          <Route path="/resources" element={
            <ProtectedRoute>
              <Resources />
            </ProtectedRoute>
          } />
          <Route path="/stakeholders" element={
            <ProtectedRoute>
              <Stakeholders />
            </ProtectedRoute>
          } />
          <Route path="/analytics" element={
            <ProtectedRoute>
              <Analytics />
            </ProtectedRoute>
          } />
          <Route path="/workspaces" element={
            <ProtectedRoute>
              <Workspaces />
            </ProtectedRoute>
          } />
          <Route path="/settings" element={
            <ProtectedRoute>
              <Settings />
            </ProtectedRoute>
          } />
          
          {/* Catch all */}
          <Route path="*" element={<Navigate to="/404" replace />} />
        </Routes>
      </Suspense>
      <Toaster />
      <PerformanceMonitor />
      {offlineStatus.isOnline === false && (
        <div className="fixed top-4 right-4 z-50 bg-orange-100 dark:bg-orange-900 border border-orange-300 dark:border-orange-700 rounded-lg p-3">
          <p className="text-sm text-orange-800 dark:text-orange-200">You are offline</p>
        </div>
      )}
    </div>
  );
}

function App() {
  return (
    <ErrorBoundary>
      <QueryClientProvider client={queryClient}>
        <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
          <TooltipProvider>
            <GlobalErrorHandler>
              <AuthProvider>
                <SessionTimeoutProvider>
                  <WorkspaceProvider>
                    <ResourceProvider>
                      <StakeholderProvider>
                        <ProjectProvider>
                          <BrowserRouter>
                            <AppContent />
                          </BrowserRouter>
                        </ProjectProvider>
                      </StakeholderProvider>
                    </ResourceProvider>
                  </WorkspaceProvider>
                </SessionTimeoutProvider>
              </AuthProvider>
            </GlobalErrorHandler>
          </TooltipProvider>
        </ThemeProvider>
      </QueryClientProvider>
    </ErrorBoundary>
  );
}

export default App;
