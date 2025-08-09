
import React, { useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useWorkspace } from '@/contexts/WorkspaceContext';
import Layout from '@/components/Layout';
import SimpleDashboard from '@/components/dashboard/SimpleDashboard';
import FirstUserOnboarding from '@/components/FirstUserOnboarding';
import { AppInitializationLoader } from '@/components/AppInitializationLoader';
import { useAppInitialization } from '@/hooks/useAppInitialization';
import { useEnterpriseOwnerPersistence } from '@/hooks/useEnterpriseOwnerPersistence';
import { Navigate } from 'react-router-dom';

const Dashboard: React.FC = () => {
  const { user, isFirstUser, isSystemOwner, role, loading } = useAuth();
  const { currentWorkspace } = useWorkspace();
  const { isFullyLoaded, hasWorkspaces } = useAppInitialization();
  const { isEnterpriseOwner, preferences } = useEnterpriseOwnerPersistence();

  // Redirect enterprise owners to admin dashboard if they prefer system view
  if (!loading && isEnterpriseOwner && preferences.preferSystemView) {
    return <Navigate to="/admin" replace />;
  }

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
                {/* Show workspace selection prompt if no current workspace and not enterprise owner */}
                {isFullyLoaded && !currentWorkspace && !isEnterpriseOwner && (
                  <div className="text-center py-12">
                    <div className="space-y-4">
                      <h2 className="text-xl font-semibold text-foreground">No Workspace Selected</h2>
                      <p className="text-muted-foreground">
                        Please select or create a workspace to view your dashboard.
                      </p>
                    </div>
                  </div>
                )}
                
                {/* Workspace dashboard */}
                {isFullyLoaded && currentWorkspace && (
                  <SimpleDashboard />
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
