
import React, { createContext, useContext, useState, useEffect } from 'react';
import { Workspace, WorkspaceMember } from '@/types/workspace';

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

// Mock data for initial workspaces
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

export const WorkspaceProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [workspaces, setWorkspaces] = useState<Workspace[]>(initialWorkspaces);
  const [currentWorkspace, setCurrentWorkspace] = useState<Workspace | null>(initialWorkspaces[0]);

  const addWorkspace = (workspace: Workspace) => {
    setWorkspaces(prev => [...prev, workspace]);
  };

  const updateWorkspace = (workspaceId: string, updates: Partial<Workspace>) => {
    setWorkspaces(prev => 
      prev.map(ws => ws.id === workspaceId ? { ...ws, ...updates } : ws)
    );
    if (currentWorkspace?.id === workspaceId) {
      setCurrentWorkspace(prev => prev ? { ...prev, ...updates } : null);
    }
  };

  const removeWorkspace = (workspaceId: string) => {
    setWorkspaces(prev => prev.filter(ws => ws.id !== workspaceId));
    if (currentWorkspace?.id === workspaceId) {
      setCurrentWorkspace(workspaces.find(ws => ws.id !== workspaceId) || null);
    }
  };

  const inviteMember = (workspaceId: string, email: string, role: 'admin' | 'member' | 'viewer') => {
    // In a real app, this would send an invitation email
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
  };

  const removeMember = (workspaceId: string, memberId: string) => {
    const workspace = workspaces.find(ws => ws.id === workspaceId);
    if (workspace) {
      updateWorkspace(workspaceId, {
        members: workspace.members.filter(member => member.id !== memberId)
      });
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
