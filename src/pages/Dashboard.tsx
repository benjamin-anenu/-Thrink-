
import React from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useWorkspace } from '@/contexts/WorkspaceContext';
import Header from '@/components/Header';
import WorkspaceBanner from '@/components/WorkspaceBanner';
import SimpleDashboard from '@/components/dashboard/SimpleDashboard';
import SystemOwnerDashboard from '@/components/dashboard/SystemOwnerDashboard';
import FirstUserOnboarding from '@/components/FirstUserOnboarding';

const Dashboard: React.FC = () => {
  const { user, isFirstUser, isSystemOwner, loading: authLoading } = useAuth();
  const { currentWorkspace, loading: workspaceLoading } = useWorkspace();

  // Show loading state while authentication is loading
  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center space-y-2">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  // Show first user onboarding if this is the first user without any workspaces
  if (user && isFirstUser && !currentWorkspace) {
    return <FirstUserOnboarding />;
  }

  // Regular dashboard for users with workspaces
  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/20">
      <Header />
      <WorkspaceBanner />
      
      <div className="container mx-auto px-4 pt-32 pb-8 max-w-7xl">
        <div className="space-y-8">
          {/* Show loading state for workspace data */}
          {workspaceLoading && (
            <div className="text-center py-8">
              <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary mx-auto mb-2"></div>
              <p className="text-sm text-muted-foreground">Loading workspace data...</p>
            </div>
          )}
          
          {/* Show workspace selection prompt if no current workspace and not system owner */}
          {!workspaceLoading && !currentWorkspace && !isSystemOwner && (
            <div className="text-center py-12">
              <div className="space-y-4">
                <h2 className="text-xl font-semibold text-foreground">No Workspace Selected</h2>
                <p className="text-muted-foreground">
                  Please select or create a workspace to view your dashboard.
                </p>
              </div>
            </div>
          )}
          
          {/* Show appropriate dashboard based on user role */}
          {!workspaceLoading && (isSystemOwner || currentWorkspace) && (
            <>
              {isSystemOwner ? (
                <SystemOwnerDashboard />
              ) : (
                <SimpleDashboard />
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
