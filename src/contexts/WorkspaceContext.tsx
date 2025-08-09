import React, { createContext, useContext, useState, useEffect } from 'react';
import { Workspace, WorkspaceMember, WorkspaceSettings } from '@/types/workspace';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './AuthContext';

interface WorkspaceContextType {
  currentWorkspace: Workspace | null;
  workspaces: Workspace[];
  loading: boolean;
  error: string | null;
  setCurrentWorkspace: (workspace: Workspace | null) => void;
  addWorkspace: (name: string, description?: string) => Promise<string>;
  updateWorkspace: (workspaceId: string, updates: Partial<Workspace>) => void;
  removeWorkspace: (workspaceId: string) => void;
  inviteMember: (workspaceId: string, email: string, role: 'admin' | 'member' | 'viewer') => Promise<void>;
  removeMember: (workspaceId: string, memberId: string) => void;
  updateMemberRole: (workspaceId: string, memberId: string, role: 'admin' | 'member' | 'viewer') => void;
  refreshWorkspaces: () => Promise<void>;
}

const WorkspaceContext = createContext<WorkspaceContextType | undefined>(undefined);

export const WorkspaceProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user, loading: authLoading, isSystemOwner, permissionsContext } = useAuth()
  const [workspaces, setWorkspaces] = useState<Workspace[]>([]);
  const [currentWorkspace, setCurrentWorkspace] = useState<Workspace | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Helper function to safely parse workspace settings
  const parseWorkspaceSettings = (settings: any): WorkspaceSettings => {
    const defaultSettings: WorkspaceSettings = {
      allowGuestAccess: false,
      defaultProjectVisibility: 'private' as const,
      currency: 'USD',
      timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone,
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
      currency: settings.currency || defaultSettings.currency,
      timeZone: settings.timeZone || defaultSettings.timeZone,
      notificationSettings: {
        emailNotifications: Boolean(settings.notificationSettings?.emailNotifications ?? true),
        projectUpdates: Boolean(settings.notificationSettings?.projectUpdates ?? true),
        taskAssignments: Boolean(settings.notificationSettings?.taskAssignments ?? true),
        deadlineReminders: Boolean(settings.notificationSettings?.deadlineReminders ?? true)
      }
    };
  };

  // Fetch workspaces from Supabase - enhanced for system owner
  const fetchWorkspaces = async () => {
    if (!user) {
      console.log('[Workspace] No user, clearing workspaces')
      setWorkspaces([])
      setCurrentWorkspace(null)
      setLoading(false)
      setError(null)
      return
    }

    // Wait for permissions context to be loaded before making decisions
    if (!permissionsContext) {
      console.log('[Workspace] Permissions context not loaded yet, waiting...')
      return
    }

    console.log('[Workspace] Fetching workspaces for user:', user.id, 'System owner:', isSystemOwner, 'Permissions loaded:', !!permissionsContext)
    setLoading(true)
    setError(null)

    try {
      let workspaceQuery;

      if (isSystemOwner) {
        // System owners can see all workspaces
        workspaceQuery = supabase
          .from('workspaces')
          .select(`
            *,
            workspace_members!inner(
              id,
              user_id,
              role,
              status,
              joined_at
            )
          `);
      } else {
        // Regular users only see workspaces where they are members
        workspaceQuery = supabase
          .from('workspaces')
          .select(`
            *,
            workspace_members!inner(
              id,
              user_id,
              role,
              status,
              joined_at
            )
          `)
          .eq('workspace_members.user_id', user.id)
          .eq('workspace_members.status', 'active');
      }

      const { data: workspaceData, error: workspaceError } = await workspaceQuery;

      if (workspaceError) {
        console.error('[Workspace] Error fetching workspaces:', workspaceError);
        setError('Failed to load workspaces')
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
          email: user.email || '',
          name: user.user_metadata?.full_name || user.email?.split('@')[0] || 'User',
          role: member.role,
          joinedAt: member.joined_at,
          status: member.status
        })),
        settings: parseWorkspaceSettings(ws.settings)
      })) || [];

      console.log('[Workspace] Loaded', transformedWorkspaces.length, 'workspaces')
      setWorkspaces(transformedWorkspaces);
      
      // Only auto-select workspace for confirmed non-system owners
      // System owners can manually select workspaces when they want to view them
      if (
        transformedWorkspaces.length > 0 &&
        !currentWorkspace &&
        !isSystemOwner &&
        permissionsContext
      ) {
        setCurrentWorkspace(transformedWorkspaces[0]);
        console.log('[Workspace] Auto-selected workspace for regular user:', transformedWorkspaces[0].name)
      } else if (isSystemOwner && permissionsContext) {
        console.log('[Workspace] System owner - workspaces loaded but no auto-selection')
      }
    } catch (error) {
      console.error('[Workspace] Exception in fetchWorkspaces:', error);
      setError('An error occurred while loading workspaces')
    } finally {
      setLoading(false);
    }
  };

  // Load workspaces when user is available and auth loading is complete
  useEffect(() => {
    if (authLoading) {
      console.log('[Workspace] Auth still loading, waiting...')
      return
    }

    if (!user) {
      console.log('[Workspace] No user, clearing workspaces')
      setWorkspaces([])
      setCurrentWorkspace(null)
      setLoading(false)
      return
    }

    // Wait for permissions context to be available
    if (!permissionsContext) {
      console.log('[Workspace] Permissions context not ready, waiting...')
      return
    }

    console.log('[Workspace] Auth and permissions ready, fetching workspaces...', {
      isSystemOwner,
      permissionsLoaded: !!permissionsContext
    })
    fetchWorkspaces();
  }, [user, authLoading, isSystemOwner, permissionsContext])

  // Clear workspace selection when system owner status changes to true (but allow manual selection)
  useEffect(() => {
    if (isSystemOwner && currentWorkspace && permissionsContext) {
      console.log('[Workspace] System owner status confirmed, allowing manual workspace selection')
      // Don't automatically clear - let system owners choose
    }
  }, [isSystemOwner, permissionsContext])

  const addWorkspace = async (name: string, description?: string): Promise<string> => {
    try {
      const { data: workspaceId, error } = await supabase.rpc('create_workspace_with_owner', {
        workspace_name: name,
        workspace_description: description
      });

      if (error) throw error;

      // Refresh workspaces to include the new one
      await fetchWorkspaces();
      
      console.log('[Workspace] Created workspace:', name, 'with ID:', workspaceId);
      return workspaceId;
    } catch (error) {
      console.error('Error creating workspace:', error);
      throw error;
    }
  };

  const updateWorkspace = (workspaceId: string, updates: Partial<Workspace>) => {
    const updatedWorkspaces = workspaces.map(ws => 
      ws.id === workspaceId ? { ...ws, ...updates } : ws
    );
    
    setWorkspaces(updatedWorkspaces);
    
    if (currentWorkspace?.id === workspaceId) {
      setCurrentWorkspace(prev => prev ? { ...prev, ...updates } : null);
    }

    console.log('[Workspace] Updated workspace:', workspaceId)
  };

  const removeWorkspace = (workspaceId: string) => {
    setWorkspaces(prev => prev.filter(ws => ws.id !== workspaceId));
    
    if (currentWorkspace?.id === workspaceId) {
      const remainingWorkspaces = workspaces.filter(ws => ws.id !== workspaceId);
      setCurrentWorkspace(remainingWorkspaces[0] || null);
    }

    console.log('[Workspace] Removed workspace:', workspaceId)
  };

  const inviteMember = async (workspaceId: string, email: string, role: 'admin' | 'member' | 'viewer') => {
    if (!workspaceId) throw new Error('Workspace ID is required');

    // Call edge function to create invite, create temp user, and send email
    const { data, error } = await supabase.functions.invoke('send-workspace-invite', {
      body: {
        workspaceId,
        emails: [email],
        role,
      },
    });

    if (error) {
      console.error('[Workspace] Error sending invite via edge function:', error);
      throw new Error(error.message || 'Failed to send invitation');
    }

    // Check result payload for per-email failures
    const sent = (data as any)?.results?.[0]?.sent ?? true;
    if (!sent) {
      const errMsg = (data as any)?.results?.[0]?.error || 'Failed to send invitation';
      throw new Error(errMsg);
    }

    // Optimistically reflect pending invite in UI
    const newMember: WorkspaceMember = {
      id: `invite-${Date.now()}`,
      userId: '',
      email,
      name: email.split('@')[0],
      role,
      joinedAt: new Date().toISOString(),
      status: 'pending',
    };

    updateWorkspace(workspaceId, {
      members: [...(workspaces.find(ws => ws.id === workspaceId)?.members || []), newMember],
    });

    console.log('[Workspace] Invited member (pending):', email, 'to workspace:', workspaceId, 'edge data:', data);
  };

  const removeMember = (workspaceId: string, memberId: string) => {
    const workspace = workspaces.find(ws => ws.id === workspaceId);
    if (workspace) {
      updateWorkspace(workspaceId, {
        members: workspace.members.filter(member => member.id !== memberId)
      });
      console.log('[Workspace] Removed member:', memberId, 'from workspace:', workspaceId)
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
      console.log('[Workspace] Updated member role:', memberId, 'to', role)
    }
  };

  return (
    <WorkspaceContext.Provider value={{
      currentWorkspace,
      workspaces,
      loading,
      error,
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
