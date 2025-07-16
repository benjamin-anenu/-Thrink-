
import React, { createContext, useContext, useState, useEffect } from 'react';
import { Workspace, WorkspaceMember, WorkspaceSettings } from '@/types/workspace';
import { supabase } from '@/integrations/supabase/client';
import { dataPersistence } from '@/services/DataPersistence';
import { contextSynchronizer } from '@/services/ContextSynchronizer';
import { eventBus } from '@/services/EventBus';

interface WorkspaceContextType {
  currentWorkspace: Workspace | null;
  workspaces: Workspace[];
  loading: boolean;
  setCurrentWorkspace: (workspace: Workspace) => void;
  addWorkspace: (workspace: Workspace) => void;
  updateWorkspace: (workspaceId: string, updates: Partial<Workspace>) => void;
  removeWorkspace: (workspaceId: string) => void;
  inviteMember: (workspaceId: string, email: string, role: 'admin' | 'member' | 'viewer') => void;
  removeMember: (workspaceId: string, memberId: string) => void;
  updateMemberRole: (workspaceId: string, memberId: string, role: 'admin' | 'member' | 'viewer') => void;
  refreshWorkspaces: () => Promise<void>;
}

const WorkspaceContext = createContext<WorkspaceContextType | undefined>(undefined);

export const WorkspaceProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [workspaces, setWorkspaces] = useState<Workspace[]>([]);
  const [currentWorkspace, setCurrentWorkspace] = useState<Workspace | null>(null);
  const [loading, setLoading] = useState(true);

  // Helper function to safely parse workspace settings
  const parseWorkspaceSettings = (settings: any): WorkspaceSettings => {
    const defaultSettings: WorkspaceSettings = {
      allowGuestAccess: false,
      defaultProjectVisibility: 'private' as const,
      notificationSettings: {
        emailNotifications: true,
        projectUpdates: true,
        taskAssignments: true,
        deadlineReminders: true
      }
    };

    if (!settings || typeof settings !== 'object') {
      return defaultSettings;
    }

    return {
      allowGuestAccess: Boolean(settings.allowGuestAccess),
      defaultProjectVisibility: settings.defaultProjectVisibility || 'private',
      notificationSettings: {
        emailNotifications: Boolean(settings.notificationSettings?.emailNotifications ?? true),
        projectUpdates: Boolean(settings.notificationSettings?.projectUpdates ?? true),
        taskAssignments: Boolean(settings.notificationSettings?.taskAssignments ?? true),
        deadlineReminders: Boolean(settings.notificationSettings?.deadlineReminders ?? true)
      }
    };
  };

  // Fetch workspaces from Supabase
  const fetchWorkspaces = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        setLoading(false);
        return;
      }

      // Fetch workspaces where user is a member
      const { data: workspaceData, error } = await supabase
        .from('workspaces')
        .select(`
          *,
          workspace_members!inner(
            id,
            user_id,
            role,
            status,
            joined_at,
            profiles(email, full_name)
          )
        `)
        .eq('workspace_members.user_id', user.id)
        .eq('workspace_members.status', 'active');

      if (error) {
        console.error('Error fetching workspaces:', error);
        setLoading(false);
        return;
      }

      // Transform the data to match our Workspace interface
      const transformedWorkspaces: Workspace[] = workspaceData?.map(ws => ({
        id: ws.id,
        name: ws.name,
        description: ws.description || '',
        createdAt: ws.created_at,
        ownerId: ws.owner_id,
        members: ws.workspace_members.map((member: any) => ({
          id: member.id,
          userId: member.user_id,
          email: member.profiles?.email || '',
          name: member.profiles?.full_name || member.profiles?.email || 'Unknown User',
          role: member.role,
          joinedAt: member.joined_at,
          status: member.status
        })),
        settings: parseWorkspaceSettings(ws.settings)
      })) || [];

      setWorkspaces(transformedWorkspaces);
      if (transformedWorkspaces.length > 0 && !currentWorkspace) {
        setCurrentWorkspace(transformedWorkspaces[0]);
      }
    } catch (error) {
      console.error('Error in fetchWorkspaces:', error);
    } finally {
      setLoading(false);
    }
  };

  // Load workspaces on mount and when auth state changes
  useEffect(() => {
    fetchWorkspaces();

    // Subscribe to auth state changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === 'SIGNED_IN' || event === 'SIGNED_OUT') {
        fetchWorkspaces();
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  // Register with context synchronizer
  useEffect(() => {
    const unregister = contextSynchronizer.registerContext('workspaces', (updatedWorkspaces: Workspace[]) => {
      setWorkspaces(updatedWorkspaces);
      // Update current workspace if it was modified
      if (currentWorkspace) {
        const updatedCurrent = updatedWorkspaces.find(ws => ws.id === currentWorkspace.id);
        if (updatedCurrent) {
          setCurrentWorkspace(updatedCurrent);
        }
      }
    });

    return unregister;
  }, [currentWorkspace]);

  const addWorkspace = (workspace: Workspace) => {
    const newWorkspace = {
      ...workspace,
      createdAt: workspace.createdAt || new Date().toISOString()
    };
    setWorkspaces(prev => [...prev, newWorkspace]);

    // Emit creation event
    eventBus.emit('context_updated', {
      type: 'workspace_created',
      workspace: newWorkspace
    }, 'workspace_context');
  };

  const updateWorkspace = (workspaceId: string, updates: Partial<Workspace>) => {
    const updatedWorkspaces = workspaces.map(ws => 
      ws.id === workspaceId ? { ...ws, ...updates } : ws
    );
    
    setWorkspaces(updatedWorkspaces);
    
    if (currentWorkspace?.id === workspaceId) {
      setCurrentWorkspace(prev => prev ? { ...prev, ...updates } : null);
    }

    // Emit update event
    eventBus.emit('context_updated', {
      type: 'workspace_updated',
      workspaceId,
      updates
    }, 'workspace_context');
  };

  const removeWorkspace = (workspaceId: string) => {
    setWorkspaces(prev => prev.filter(ws => ws.id !== workspaceId));
    
    if (currentWorkspace?.id === workspaceId) {
      const remainingWorkspaces = workspaces.filter(ws => ws.id !== workspaceId);
      setCurrentWorkspace(remainingWorkspaces[0] || null);
    }

    // Emit removal event
    eventBus.emit('context_updated', {
      type: 'workspace_removed',
      workspaceId
    }, 'workspace_context');
  };

  const inviteMember = (workspaceId: string, email: string, role: 'admin' | 'member' | 'viewer') => {
    const newMember: WorkspaceMember = {
      id: `member-${Date.now()}`,
      userId: `user-${Date.now()}`,
      email,
      name: email.split('@')[0],
      role,
      joinedAt: new Date().toISOString(),
      status: 'pending'
    };

    updateWorkspace(workspaceId, {
      members: [...(workspaces.find(ws => ws.id === workspaceId)?.members || []), newMember]
    });

    // Emit member invitation event
    eventBus.emit('context_updated', {
      type: 'member_invited',
      workspaceId,
      member: newMember
    }, 'workspace_context');
  };

  const removeMember = (workspaceId: string, memberId: string) => {
    const workspace = workspaces.find(ws => ws.id === workspaceId);
    if (workspace) {
      updateWorkspace(workspaceId, {
        members: workspace.members.filter(member => member.id !== memberId)
      });

      // Emit member removal event
      eventBus.emit('context_updated', {
        type: 'member_removed',
        workspaceId,
        memberId
      }, 'workspace_context');
    }
  };

  const updateMemberRole = (workspaceId: string, memberId: string, role: 'admin' | 'member' | 'viewer') => {
    const workspace = workspaces.find(ws => ws.id === workspaceId);
    if (workspace) {
      updateWorkspace(workspaceId, {
        members: workspace.members.map(member => 
          member.id === memberId ? { ...member, role } : member
        )
      });

      // Emit member role update event
      eventBus.emit('context_updated', {
        type: 'member_role_updated',
        workspaceId,
        memberId,
        role
      }, 'workspace_context');
    }
  };

  return (
    <WorkspaceContext.Provider value={{
      currentWorkspace,
      workspaces,
      loading,
      setCurrentWorkspace,
      addWorkspace,
      updateWorkspace,
      removeWorkspace,
      inviteMember,
      removeMember,
      updateMemberRole,
      refreshWorkspaces: fetchWorkspaces
    }}>
      {children}
    </WorkspaceContext.Provider>
  );
};

export const useWorkspace = () => {
  const context = useContext(WorkspaceContext);
  if (context === undefined) {
    throw new Error('useWorkspace must be used within a WorkspaceProvider');
  }
  return context;
};
