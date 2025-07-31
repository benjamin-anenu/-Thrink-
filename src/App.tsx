import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { Toaster } from 'sonner';
import { QueryClient, QueryClientProvider } from 'react-query';

import { AuthProvider } from '@/contexts/AuthContext';
import { WorkspaceProvider } from '@/contexts/WorkspaceContext';
import { ProjectProvider } from '@/contexts/ProjectContext';
import { ResourceProvider } from '@/contexts/ResourceContext';
import { TaskProvider } from '@/contexts/TaskContext';
import { StakeholderProvider } from '@/contexts/StakeholderContext';

import { Dashboard } from '@/pages/Dashboard';
import { Projects } from '@/pages/Projects';
import { Resources } from '@/pages/Resources';
import { Tasks } from '@/pages/Tasks';
import { Stakeholders } from '@/pages/Stakeholders';
import { Settings } from '@/pages/Settings';
import { Auth } from '@/pages/Auth';
import { Unauthorized } from '@/pages/Unauthorized';
import { NotFound } from '@/pages/NotFound';
import { ErrorBoundary } from '@/components/ErrorBoundary';
import { SecurityDashboard } from '@/pages/SecurityDashboard';
import { ComplianceLogs } from '@/pages/ComplianceLogs';
import { Departments } from '@/pages/Departments';

import { CSPProvider } from '@/components/security/CSPProvider';
import { enhancedSecurity } from '@/services/EnhancedSecurityService';

function App() {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: {
        refetchOnWindowFocus: false,
        retry: false,
      },
    },
  });

  // Initialize security on app start
  React.useEffect(() => {
    // Initialize enhanced security
    enhancedSecurity;
    
    // Clean up on app unmount
    return () => {
      enhancedSecurity.destroy();
    };
  }, []);

  return (
    <QueryClientProvider client={queryClient}>
      <CSPProvider>
        <AuthProvider>
          <WorkspaceProvider>
            <ProjectProvider>
              <ResourceProvider>
                <TaskProvider>
                  <StakeholderProvider>
                    <div className="min-h-screen bg-background">
                      <Toaster />
                      <ErrorBoundary>
                        <BrowserRouter>
                          <Routes>
                            <Route path="/" element={<Dashboard />} />
                            <Route path="/projects" element={<Projects />} />
                            <Route path="/resources" element={<Resources />} />
                            <Route path="/tasks" element={<Tasks />} />
                            <Route path="/stakeholders" element={<Stakeholders />} />
                            <Route path="/settings" element={<Settings />} />
                            <Route path="/auth" element={<Auth />} />
                            <Route path="/unauthorized" element={<Unauthorized />} />
                            <Route path="/security" element={<SecurityDashboard />} />
                            <Route path="/compliance" element={<ComplianceLogs />} />
                            <Route path="/departments" element={<Departments />} />
                            <Route path="*" element={<NotFound />} />
                          </Routes>
                        </BrowserRouter>
                      </ErrorBoundary>
                    </div>
                  </StakeholderProvider>
                </TaskProvider>
              </ResourceProvider>
            </ProjectProvider>
          </WorkspaceProvider>
        </AuthProvider>
      </CSPProvider>
    </QueryClientProvider>
  );
}

export default App;
