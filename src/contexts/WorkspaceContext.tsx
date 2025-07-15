
import React, { createContext, useContext, useState, useEffect } from 'react';
import { Workspace, WorkspaceMember } from '@/types/workspace';
import { dataPersistence } from '@/services/DataPersistence';
import { contextSynchronizer } from '@/services/ContextSynchronizer';
import { eventBus } from '@/services/EventBus';

interface WorkspaceContextType {
  currentWorkspace: Workspace | null;
  workspaces: Workspace[];
  setCurrentWorkspace: (workspace: Workspace) => void;
  addWorkspace: (workspace: Workspace) => void;
  updateWorkspace: (workspaceId: string, updates: Partial<Workspace>) => void;
  removeWorkspace: (workspaceId: string) => void;
  inviteMember: (workspaceId: string, email: string, role: 'admin' | 'member' | 'viewer') => void;
  removeMember: (workspaceId: string, memberId: string) => void;
  updateMemberRole: (workspaceId: string, memberId: string, role: 'admin' | 'member' | 'viewer') => void;
}

const WorkspaceContext = createContext<WorkspaceContextType | undefined>(undefined);

export const WorkspaceProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [workspaces, setWorkspaces] = useState<Workspace[]>([]);
  const [currentWorkspace, setCurrentWorkspace] = useState<Workspace | null>(null);

  // Load workspaces from persistent storage on mount
  useEffect(() => {
    const savedWorkspaces = dataPersistence.getData<Workspace[]>('workspaces');
    if (savedWorkspaces && savedWorkspaces.length > 0) {
      setWorkspaces(savedWorkspaces);
      setCurrentWorkspace(savedWorkspaces[0]);
    } else {
      initializeDefaultWorkspaces();
    }
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

  // Save workspaces to persistent storage whenever workspaces change
  useEffect(() => {
    if (workspaces.length > 0) {
      dataPersistence.persistData('workspaces', workspaces, 'workspace_context');
    }
  }, [workspaces]);

  const initializeDefaultWorkspaces = () => {
    const initialWorkspaces: Workspace[] = [
      {
        id: 'ws-1',
        name: 'Personal Workspace',
        description: 'Your personal project space',
        createdAt: '2024-01-01T00:00:00Z',
        ownerId: 'user-1',
        members: [
          {
            id: 'member-1',
            userId: 'user-1',
            email: 'you@company.com',
            name: 'You',
            role: 'owner',
            joinedAt: '2024-01-01T00:00:00Z',
            status: 'active'
          }
        ],
        settings: {
          allowGuestAccess: false,
          defaultProjectVisibility: 'private',
          notificationSettings: {
            emailNotifications: true,
            projectUpdates: true,
            taskAssignments: true,
            deadlineReminders: true
          }
        }
      },
      {
        id: 'ws-2',
        name: 'Team Alpha',
        description: 'Cross-functional product development team',
        createdAt: '2024-01-15T00:00:00Z',
        ownerId: 'user-1',
        members: [
          {
            id: 'member-2',
            userId: 'user-1',
            email: 'you@company.com',
            name: 'You',
            role: 'owner',
            joinedAt: '2024-01-15T00:00:00Z',
            status: 'active'
          },
          {
            id: 'member-3',
            userId: 'user-2',
            email: 'sarah@company.com',
            name: 'Sarah Chen',
            role: 'admin',
            joinedAt: '2024-01-16T00:00:00Z',
            status: 'active'
          },
          {
            id: 'member-4',
            userId: 'user-3',
            email: 'mike@company.com',
            name: 'Mike Rodriguez',
            role: 'member',
            joinedAt: '2024-01-20T00:00:00Z',
            status: 'active'
          }
        ],
        settings: {
          allowGuestAccess: true,
          defaultProjectVisibility: 'workspace',
          notificationSettings: {
            emailNotifications: true,
            projectUpdates: true,
            taskAssignments: true,
            deadlineReminders: false
          }
        }
      }
    ];

    setWorkspaces(initialWorkspaces);
    setCurrentWorkspace(initialWorkspaces[0]);
    dataPersistence.persistData('workspaces', initialWorkspaces, 'workspace_context');
  };

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
      setCurrentWorkspace,
      addWorkspace,
      updateWorkspace,
      removeWorkspace,
      inviteMember,
      removeMember,
      updateMemberRole
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
