
import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Toaster } from '@/components/ui/sonner';
import { ThemeProvider } from 'next-themes';
import { AuthProvider } from '@/contexts/AuthContext';
import { SecurityProvider } from '@/components/security/SecurityProvider';
import { WorkspaceProvider } from '@/contexts/WorkspaceContext';
import { ProjectProvider } from '@/contexts/ProjectContext';
import { ResourceProvider } from '@/contexts/ResourceContext';
import { TaskProvider } from '@/contexts/TaskContext';
import { StakeholderProvider } from '@/contexts/StakeholderContext';

import Index from '@/pages/Index';
import Dashboard from '@/pages/Dashboard';
import Projects from '@/pages/Projects';
import Resources from '@/pages/Resources';
import Stakeholders from '@/pages/Stakeholders';
import Analytics from '@/pages/Analytics';
import Auth from '@/pages/Auth';
import Workspaces from '@/pages/Workspaces';
import AIHub from '@/pages/AIHub';
import NotFound from '@/pages/NotFound';
import ErrorBoundary from '@/components/ErrorBoundary';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000,
      retry: (failureCount, error: any) => {
        // Don't retry on authentication errors
        if (error?.status === 401 || error?.status === 403) {
          return false;
        }
        return failureCount < 3;
      },
    },
    mutations: {
      retry: (failureCount, error: any) => {
        // Don't retry on authentication or validation errors
        if (error?.status === 401 || error?.status === 403 || error?.status === 400) {
          return false;
        }
        return failureCount < 2;
      },
    },
  },
});

function App() {
  return (
    <ErrorBoundary>
      <QueryClientProvider client={queryClient}>
        <ThemeProvider
          attribute="class"
          defaultTheme="dark"
          forcedTheme="dark"
          enableSystem={false}
          disableTransitionOnChange
        >
          <AuthProvider>
            <SecurityProvider>
              <WorkspaceProvider>
                <ProjectProvider>
                  <ResourceProvider>
                    <TaskProvider>
                      <StakeholderProvider>
                        <ErrorBoundary>
                          <BrowserRouter>
                            <Routes>
                              <Route path="/" element={<Index />} />
                              <Route path="/dashboard" element={<Dashboard />} />
                              <Route path="/projects" element={<Projects />} />
                              <Route path="/resources" element={<Resources />} />
                              <Route path="/stakeholders" element={<Stakeholders />} />
                              <Route path="/analytics" element={<Analytics />} />
                              <Route path="/workspaces" element={<Workspaces />} />
                              <Route path="/ai-hub" element={<AIHub />} />
                              <Route path="/auth" element={<Auth />} />
                              <Route path="*" element={<NotFound />} />
                            </Routes>
                          </BrowserRouter>
                        </ErrorBoundary>
                      </StakeholderProvider>
                    </TaskProvider>
                  </ResourceProvider>
                </ProjectProvider>
              </WorkspaceProvider>
            </Security Provider>
          </AuthProvider>
          <Toaster />
        </ThemeProvider>
      </QueryClientProvider>
    </ErrorBoundary>
  );
}

export default App;
