import React from 'react';
import { Loader2, Database, Users, FolderOpen } from 'lucide-react';
import { useAppInitialization } from '@/hooks/useAppInitialization';
import { useLocation } from 'react-router-dom';

interface AppInitializationLoaderProps {
  children: React.ReactNode;
}

export const AppInitializationLoader: React.FC<AppInitializationLoaderProps> = ({ children }) => {
  const location = useLocation();
  const isSystemRoute = location.pathname.startsWith('/system');
  const {
    authReady,
    workspacesReady,
    projectsReady,
    isFullyLoaded,
    isInitializing
  } = useAppInitialization({ mode: isSystemRoute ? 'system' : 'default' });

  if (!isInitializing) {
    return <>{children}</>;
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background via-background to-muted/20">
      <div className="text-center space-y-6 max-w-md mx-auto px-4">
        <div className="space-y-4">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
          <h2 className="text-xl font-semibold text-foreground">Loading Your Workspace</h2>
          <p className="text-sm text-muted-foreground">
            Please wait while we set up your dashboard...
          </p>
        </div>

        <div className="space-y-3">
          {/* Authentication Step */}
          <div className="flex items-center space-x-3 text-sm">
            {authReady ? (
              <div className="w-5 h-5 rounded-full bg-primary flex items-center justify-center">
                <div className="w-2 h-2 bg-primary-foreground rounded-full"></div>
              </div>
            ) : (
              <Loader2 className="w-5 h-5 animate-spin text-primary" />
            )}
            <span className={authReady ? 'text-foreground' : 'text-muted-foreground'}>
              Authenticating user
            </span>
          </div>

          {/* Workspace Step */}
          <div className="flex items-center space-x-3 text-sm">
            {workspacesReady ? (
              <div className="w-5 h-5 rounded-full bg-primary flex items-center justify-center">
                <div className="w-2 h-2 bg-primary-foreground rounded-full"></div>
              </div>
            ) : authReady ? (
              <Loader2 className="w-5 h-5 animate-spin text-primary" />
            ) : (
              <Users className="w-5 h-5 text-muted-foreground/50" />
            )}
            <span className={workspacesReady ? 'text-foreground' : 'text-muted-foreground'}>
              Loading workspaces
            </span>
          </div>

          {/* Projects Step */}
          <div className="flex items-center space-x-3 text-sm">
            {projectsReady ? (
              <div className="w-5 h-5 rounded-full bg-primary flex items-center justify-center">
                <div className="w-2 h-2 bg-primary-foreground rounded-full"></div>
              </div>
            ) : workspacesReady ? (
              <Loader2 className="w-5 h-5 animate-spin text-primary" />
            ) : (
              <FolderOpen className="w-5 h-5 text-muted-foreground/50" />
            )}
            <span className={projectsReady ? 'text-foreground' : 'text-muted-foreground'}>
              Loading projects
            </span>
          </div>
        </div>

        <div className="pt-4">
          <div className="w-full bg-muted rounded-full h-2">
            <div 
              className="bg-primary h-2 rounded-full transition-all duration-500 ease-out"
              style={{ 
                width: `${
                  authReady ? 33 : 0 + 
                  (workspacesReady ? 33 : 0) + 
                  (projectsReady ? 34 : 0)
                }%` 
              }}
            />
          </div>
        </div>
      </div>
    </div>
  );
};