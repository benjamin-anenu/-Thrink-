import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { Workspace, WorkspaceMember } from '@/types/enterprise';
import { WorkspaceService } from '@/services/WorkspaceService';
import { SessionTrackingService } from '@/services/SessionTrackingService';
import { useAuth } from './AuthContext';
import { toast } from 'sonner';

interface EnterpriseContextType {
  currentWorkspace: Workspace | null;
  workspaces: Workspace[];
  workspaceMembers: WorkspaceMember[];
  loading: boolean;
  setCurrentWorkspace: (workspace: Workspace | null) => void;
  refreshWorkspaces: () => Promise<void>;
  refreshMembers: () => Promise<void>;
  createWorkspace: (data: { name: string; description?: string }) => Promise<Workspace>;
  switchWorkspace: (workspaceId: string) => Promise<void>;
}

const EnterpriseContext = createContext<EnterpriseContextType | undefined>(undefined);

interface EnterpriseProviderProps {
  children: ReactNode;
}

export function EnterpriseProvider({ children }: EnterpriseProviderProps) {
  const [currentWorkspace, setCurrentWorkspace] = useState<Workspace | null>(null);
  const [workspaces, setWorkspaces] = useState<Workspace[]>([]);
  const [workspaceMembers, setWorkspaceMembers] = useState<WorkspaceMember[]>([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();

  useEffect(() => {
    if (user) {
      initializeWorkspaces();
      initializeSessionTracking();
    } else {
      setWorkspaces([]);
      setCurrentWorkspace(null);
      setWorkspaceMembers([]);
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    if (currentWorkspace) {
      loadWorkspaceMembers();
    }
  }, [currentWorkspace]);

  const initializeWorkspaces = async () => {
    try {
      setLoading(true);
      const workspaceList = await WorkspaceService.getWorkspaces();
      setWorkspaces(workspaceList);

      // Set current workspace from localStorage or first available
      const savedWorkspaceId = localStorage.getItem('currentWorkspaceId');
      let targetWorkspace = workspaceList.find(w => w.id === savedWorkspaceId);
      
      if (!targetWorkspace && workspaceList.length > 0) {
        targetWorkspace = workspaceList[0];
      }

      if (targetWorkspace) {
        setCurrentWorkspace(targetWorkspace);
        localStorage.setItem('currentWorkspaceId', targetWorkspace.id);
      }
    } catch (error) {
      console.error('Failed to load workspaces:', error);
      toast.error('Failed to load workspaces');
    } finally {
      setLoading(false);
    }
  };

  const initializeSessionTracking = async () => {
    try {
      const sessionId = SessionTrackingService.generateSessionId();
      await SessionTrackingService.trackSession({
        sessionId,
        workspaceId: currentWorkspace?.id,
        userAgent: navigator.userAgent
      });

      // End session on page unload
      window.addEventListener('beforeunload', () => {
        SessionTrackingService.endSession(sessionId);
      });
    } catch (error) {
      console.error('Failed to initialize session tracking:', error);
    }
  };

  const loadWorkspaceMembers = async () => {
    if (!currentWorkspace) return;
    
    try {
      const members = await WorkspaceService.getWorkspaceMembers(currentWorkspace.id);
      setWorkspaceMembers(members);
    } catch (error) {
      console.error('Failed to load workspace members:', error);
      toast.error('Failed to load workspace members');
    }
  };

  const refreshWorkspaces = async () => {
    await initializeWorkspaces();
  };

  const refreshMembers = async () => {
    await loadWorkspaceMembers();
  };

  const createWorkspace = async (data: { name: string; description?: string }): Promise<Workspace> => {
    try {
      const workspace = await WorkspaceService.createWorkspace(data);
      setWorkspaces(prev => [workspace, ...prev]);
      setCurrentWorkspace(workspace);
      localStorage.setItem('currentWorkspaceId', workspace.id);
      toast.success('Workspace created successfully');
      return workspace;
    } catch (error) {
      console.error('Failed to create workspace:', error);
      toast.error('Failed to create workspace');
      throw error;
    }
  };

  const switchWorkspace = async (workspaceId: string) => {
    try {
      const workspace = workspaces.find(w => w.id === workspaceId);
      if (workspace) {
        setCurrentWorkspace(workspace);
        localStorage.setItem('currentWorkspaceId', workspaceId);
        
        // Track workspace switch
        const sessionId = SessionTrackingService.generateSessionId();
        await SessionTrackingService.trackSession({
          sessionId,
          workspaceId,
          userAgent: navigator.userAgent
        });

        toast.success(`Switched to ${workspace.name}`);
      }
    } catch (error) {
      console.error('Failed to switch workspace:', error);
      toast.error('Failed to switch workspace');
    }
  };

  const value: EnterpriseContextType = {
    currentWorkspace,
    workspaces,
    workspaceMembers,
    loading,
    setCurrentWorkspace,
    refreshWorkspaces,
    refreshMembers,
    createWorkspace,
    switchWorkspace
  };

  return (
    <EnterpriseContext.Provider value={value}>
      {children}
    </EnterpriseContext.Provider>
  );
}

export function useEnterprise() {
  const context = useContext(EnterpriseContext);
  if (context === undefined) {
    throw new Error('useEnterprise must be used within an EnterpriseProvider');
  }
  return context;
}