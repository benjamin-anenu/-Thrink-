
import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { Toaster } from 'sonner';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

import { AuthProvider } from '@/contexts/AuthContext';
import { WorkspaceProvider } from '@/contexts/WorkspaceContext';
import { ProjectProvider } from '@/contexts/ProjectContext';
import { ResourceProvider } from '@/contexts/ResourceContext';
import { TaskProvider } from '@/contexts/TaskContext';
import { StakeholderProvider } from '@/contexts/StakeholderContext';

import Dashboard from '@/pages/Dashboard';
import Projects from '@/pages/Projects';
import Resources from '@/pages/Resources';
import Stakeholders from '@/pages/Stakeholders';
import Auth from '@/pages/Auth';
import NotFound from '@/pages/NotFound';
import ErrorBoundary from '@/components/ErrorBoundary';

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
                            <Route path="/stakeholders" element={<Stakeholders />} />
                            <Route path="/auth" element={<Auth />} />
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
