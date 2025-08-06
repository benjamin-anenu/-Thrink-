
import React from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useWorkspace } from '@/contexts/WorkspaceContext';
import Layout from '@/components/Layout';
import SimpleDashboard from '@/components/dashboard/SimpleDashboard';
import SystemOwnerDashboard from '@/components/dashboard/SystemOwnerDashboard';
import FirstUserOnboarding from '@/components/FirstUserOnboarding';
import { AppInitializationLoader } from '@/components/AppInitializationLoader';
import { useAppInitialization } from '@/hooks/useAppInitialization';
import { MobileViewportHandler } from '@/components/mobile/MobileViewportHandler';
import { MobilePullToRefresh } from '@/components/mobile/MobilePullToRefresh';
import { useMobileEnhancements } from '@/hooks/useMobileEnhancements';

const Dashboard: React.FC = () => {
  const { user, isFirstUser, isSystemOwner } = useAuth();
  const { currentWorkspace } = useWorkspace();
  const { isFullyLoaded, hasWorkspaces } = useAppInitialization();
  const { parallaxOffset } = useMobileEnhancements();

  const handleRefresh = async () => {
    // Trigger data refresh
    window.location.reload();
  };

  return (
    <>
      <MobileViewportHandler />
      <AppInitializationLoader>
        {/* Show first user onboarding if this is the first user without any workspaces */}
        {user && isFirstUser && !hasWorkspaces ? (
          <FirstUserOnboarding />
        ) : (
          <Layout>
            <MobilePullToRefresh onRefresh={handleRefresh}>
              <div 
                className="min-h-screen bg-gradient-to-br from-background via-background to-muted/20 mobile-parallax-container"
                style={{ transform: `translateY(${parallaxOffset * 0.5}px)` }}
              >
                <div className="container mx-auto mobile-container mobile-spacing">
                  <div className="space-y-8 mobile-content-spacing">
                    {/* Show workspace selection prompt if no current workspace and not system owner */}
                    {isFullyLoaded && !currentWorkspace && !isSystemOwner && (
                      <div className="text-center py-12 mobile-entrance-animation">
                        <div className="space-y-4">
                          <h2 className="text-xl font-semibold text-foreground mobile-heading">No Workspace Selected</h2>
                          <p className="text-muted-foreground mobile-text">
                            Please select or create a workspace to view your dashboard.
                          </p>
                        </div>
                      </div>
                    )}
                    
                    {/* Show appropriate dashboard based on user role */}
                    {isFullyLoaded && (isSystemOwner || currentWorkspace) && (
                      <div className="mobile-entrance-animation">
                        {isSystemOwner ? (
                          <SystemOwnerDashboard />
                        ) : (
                          <SimpleDashboard />
                        )}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </MobilePullToRefresh>
          </Layout>
        )}
      </AppInitializationLoader>
    </>
  );
};

export default Dashboard;
