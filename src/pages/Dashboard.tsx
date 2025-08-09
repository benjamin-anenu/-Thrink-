
import React from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useWorkspace } from '@/contexts/WorkspaceContext';
import { useNavigate } from 'react-router-dom';
import Layout from '@/components/Layout';
import SimpleDashboard from '@/components/dashboard/SimpleDashboard';
import SystemOwnerDashboard from '@/components/dashboard/SystemOwnerDashboard';
import FirstUserOnboarding from '@/components/FirstUserOnboarding';
import { AppInitializationLoader } from '@/components/AppInitializationLoader';
import { useAppInitialization } from '@/hooks/useAppInitialization';

const Dashboard: React.FC = () => {
  const { user, isFirstUser, isSystemOwner, role } = useAuth();
  const { currentWorkspace } = useWorkspace();
  const { isFullyLoaded, hasWorkspaces } = useAppInitialization();
  const navigate = useNavigate();

  return (
    <AppInitializationLoader>
      {/* Show first user onboarding if this is the first user without any workspaces */}
      {user && isFirstUser && !hasWorkspaces ? (
        <FirstUserOnboarding />
      ) : (
        <Layout>
          <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/20">
            <div className="container mx-auto px-4 py-8 max-w-7xl">
              <div className="space-y-8">
                {/* Show workspace selection prompt if no current workspace and not system owner */}
                {isFullyLoaded && !currentWorkspace && !(isSystemOwner || role === 'owner' || role === 'admin') && (
                  <div className="text-center py-12">
                    <div className="space-y-4">
                      <h2 className="text-xl font-semibold text-foreground">No Workspace Selected</h2>
                      <p className="text-muted-foreground">
                        Please select or create a workspace to view your dashboard.
                      </p>
                    </div>
                  </div>
                )}
                
                {/* Workspace dashboard when a workspace is selected */}
                {isFullyLoaded && currentWorkspace && (
                  <SimpleDashboard />
                )}

                {/* System owner/administrative portfolio view when no workspace is selected */}
                {isFullyLoaded && !currentWorkspace && (isSystemOwner || role === 'owner' || role === 'admin') && (
                  <div className="text-center py-4">
                    <p className="text-muted-foreground mb-4">
                      Redirecting to your system portfolio...
                    </p>
                    {setTimeout(() => navigate('/system/portfolio'), 100) && null}
                  </div>
                )}
              </div>
            </div>
          </div>
        </Layout>
      )}
    </AppInitializationLoader>
  );
};

export default Dashboard;
