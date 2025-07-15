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
import { AuthGuard } from '@/components/auth/AuthGuard';
import { useMultiTabSync } from '@/hooks/useMultiTabSync';
import { useSessionTimeout } from '@/hooks/useSessionTimeout';
import { initializeNotificationIntegration } from '@/services/NotificationIntegrationService';
import { startEmailReminderService } from '@/services/EmailReminderService';
import { initializePerformanceTracking } from '@/services/PerformanceTracker';
import ErrorBoundary from '@/components/ErrorBoundary';
import GlobalErrorHandler from '@/components/GlobalErrorHandler';
import PerformanceMonitor from '@/components/PerformanceMonitor';
import { useOfflineStatus } from '@/hooks/useOfflineStatus';
import { useAccessibility } from '@/hooks/useAccessibility';

// Lazy load components
const Index = lazy(() => import('@/pages/Index'));
const Auth = lazy(() => import('@/pages/Auth'));
const Profile = lazy(() => import('@/pages/Profile'));
const EmailVerification = lazy(() => import('@/pages/EmailVerification'));
const ResetPassword = lazy(() => import('@/pages/ResetPassword'));
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

function AppContent() {
  const offlineStatus = useOfflineStatus();
  const { preferences } = useAccessibility();
  
  // Initialize multi-tab sync and session timeout
  useMultiTabSync();
  useSessionTimeout({ timeoutMinutes: 120, warningMinutes: 10 });

  return (
    <div id="main-content" className="min-h-screen bg-background font-sans antialiased">
      <Suspense fallback={
        <div className="flex items-center justify-center h-screen">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div>
        </div>
      }>
        <Routes>
          <Route path="/" element={<Index />} />
          <Route path="/auth" element={<Auth />} />
          <Route path="/profile" element={<AuthGuard><Profile /></AuthGuard>} />
          <Route path="/verify-email" element={<EmailVerification />} />
          <Route path="/reset-password" element={<ResetPassword />} />
          <Route path="/dashboard" element={<AuthGuard><Dashboard /></AuthGuard>} />
          <Route path="/projects" element={<AuthGuard><Projects /></AuthGuard>} />
          <Route path="/project/:id" element={<AuthGuard><ProjectManagement /></AuthGuard>} />
          <Route path="/resources" element={<AuthGuard><Resources /></AuthGuard>} />
          <Route path="/stakeholders" element={<AuthGuard><Stakeholders /></AuthGuard>} />
          <Route path="/analytics" element={<AuthGuard><Analytics /></AuthGuard>} />
          <Route path="/workspaces" element={<AuthGuard><Workspaces /></AuthGuard>} />
          <Route path="/404" element={<NotFound />} />
          <Route path="*" element={<Navigate to="/404" replace />} />
        </Routes>
      </Suspense>
      <Toaster />
      <PerformanceMonitor />
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
              </AuthProvider>
            </GlobalErrorHandler>
          </TooltipProvider>
        </ThemeProvider>
      </QueryClientProvider>
    </ErrorBoundary>
  );
}

export default App;
