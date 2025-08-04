import { useEffect, useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useWorkspace } from '@/contexts/WorkspaceContext';
import { useProject } from '@/contexts/ProjectContext';

export interface AppInitializationState {
  authReady: boolean;
  workspacesReady: boolean;
  projectsReady: boolean;
  isFullyLoaded: boolean;
  isInitializing: boolean;
  hasWorkspaces: boolean;
  hasProjects: boolean;
}

export const useAppInitialization = (): AppInitializationState => {
  const { user, loading: authLoading, isFirstUser } = useAuth();
  const { workspaces, loading: workspaceLoading, currentWorkspace } = useWorkspace();
  const { projects, loading: projectLoading } = useProject();
  
  const [initializationState, setInitializationState] = useState<AppInitializationState>({
    authReady: false,
    workspacesReady: false,
    projectsReady: false,
    isFullyLoaded: false,
    isInitializing: true,
    hasWorkspaces: false,
    hasProjects: false,
  });

  useEffect(() => {
    const authReady = !authLoading;
    const workspacesReady = authReady && !workspaceLoading;
    const projectsReady = workspacesReady && !projectLoading && currentWorkspace !== undefined;
    
    const hasWorkspaces = workspaces.length > 0;
    const hasProjects = projects.length > 0;
    
    // Consider app fully loaded when:
    // 1. Auth is complete
    // 2. Workspaces are loaded (even if empty for first user)
    // 3. Projects are loaded if there's a workspace
    const isFullyLoaded = authReady && workspacesReady && (
      isFirstUser || // First user doesn't need workspace/project data
      !currentWorkspace || // No workspace selected is a valid state
      projectsReady // Projects are loaded for current workspace
    );
    
    const isInitializing = !isFullyLoaded;

    setInitializationState({
      authReady,
      workspacesReady,
      projectsReady,
      isFullyLoaded,
      isInitializing,
      hasWorkspaces,
      hasProjects,
    });

    console.log('[AppInitialization]', {
      authReady,
      authLoading,
      workspacesReady,
      workspaceLoading,
      projectsReady,
      projectLoading,
      isFullyLoaded,
      hasWorkspaces,
      hasProjects,
      currentWorkspace: !!currentWorkspace,
      isFirstUser
    });
  }, [
    authLoading,
    workspaceLoading,
    projectLoading,
    user,
    workspaces.length,
    projects.length,
    currentWorkspace,
    isFirstUser
  ]);

  return initializationState;
};