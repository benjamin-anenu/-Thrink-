import React, { createContext, useContext, useState, useEffect } from 'react';
import { dataPersistence } from '@/services/DataPersistence';
import { contextSynchronizer } from '@/services/ContextSynchronizer';
import { eventBus } from '@/services/EventBus';
import { useWorkspace } from '@/contexts/WorkspaceContext';

export interface Stakeholder {
  id: string;
  name: string;
  role: string;
  department: string;
  email: string;
  phone: string;
  influence: 'Low' | 'Medium' | 'High';
  interest: 'Low' | 'Medium' | 'High';
  communicationPreference: 'Email' | 'Phone' | 'Slack' | 'In-person';
  projects: string[];
  lastContact: string;
  status: 'Active' | 'Inactive';
  workspaceId: string;
  createdAt?: string;
  updatedAt?: string;
}

interface StakeholderContextType {
  stakeholders: Stakeholder[];
  loading: boolean;
  getStakeholder: (id: string) => Stakeholder | null;
  updateStakeholder: (id: string, updates: Partial<Stakeholder>) => void;
  addStakeholder: (stakeholder: Omit<Stakeholder, 'id'>) => void;
  assignToProject: (stakeholderId: string, projectId: string) => void;
  removeFromProject: (stakeholderId: string, projectId: string) => void;
  getStakeholdersByProject: (projectId: string) => Stakeholder[];
  updateLastContact: (stakeholderId: string) => void;
}

const StakeholderContext = createContext<StakeholderContextType | undefined>(undefined);

export const useStakeholders = () => {
  const context = useContext(StakeholderContext);
  if (!context) {
    throw new Error('useStakeholders must be used within a StakeholderProvider');
  }
  return context;
};

export const StakeholderProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [allStakeholders, setAllStakeholders] = useState<Stakeholder[]>([]);
  const [loading, setLoading] = useState(false);
  const { currentWorkspace } = useWorkspace();

  // Filter stakeholders by current workspace
  const stakeholders = allStakeholders.filter(stakeholder => 
    currentWorkspace ? stakeholder.workspaceId === currentWorkspace.id : true
  );

  // Load stakeholders from localStorage on mount
  useEffect(() => {
    const savedStakeholders = dataPersistence.getData<Stakeholder[]>('stakeholders');
    if (savedStakeholders) {
      // Ensure workspace association
      const workspaceAwareStakeholders = savedStakeholders.map(s => ({
        ...s,
        workspaceId: s.workspaceId || currentWorkspace?.id || 'ws-1'
      }));
      setAllStakeholders(workspaceAwareStakeholders);
    } else {
      // Initialize with sample data
      initializeSampleData();
    }
  }, []);

  // Register with context synchronizer
  useEffect(() => {
    const unregister = contextSynchronizer.registerContext('stakeholders', (updatedStakeholders: Stakeholder[]) => {
      setAllStakeholders(updatedStakeholders);
    });

    return unregister;
  }, []);

  const initializeSampleData = () => {
    const workspaceId = currentWorkspace?.id || 'ws-1';
    const sampleStakeholders: Stakeholder[] = [
      {
        id: 'john-doe',
        name: 'John Doe',
        role: 'Product Manager',
        department: 'Product',
        email: 'john.doe@company.com',
        phone: '+1 (555) 111-1111',
        influence: 'High',
        interest: 'High',
        communicationPreference: 'Email',
        projects: ['proj-ecommerce-2024'],
        lastContact: '2024-07-10',
        status: 'Active',
        workspaceId,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      },
      {
        id: 'jane-smith',
        name: 'Jane Smith',
        role: 'Design Director',
        department: 'Design',
        email: 'jane.smith@company.com',
        phone: '+1 (555) 222-2222',
        influence: 'High',
        interest: 'Medium',
        communicationPreference: 'Slack',
        projects: ['proj-ecommerce-2024'],
        lastContact: '2024-07-08',
        status: 'Active',
        workspaceId,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      }
    ];
    setAllStakeholders(sampleStakeholders);
    dataPersistence.persistData('stakeholders', sampleStakeholders, 'stakeholder_context');
  };

  // Save stakeholders to localStorage whenever stakeholders change
  useEffect(() => {
    if (allStakeholders.length > 0) {
      dataPersistence.persistData('stakeholders', allStakeholders, 'stakeholder_context');
    }
  }, [allStakeholders]);

  const getStakeholder = (id: string): Stakeholder | null => {
    return stakeholders.find(s => s.id === id) || null;
  };

  const updateStakeholder = (id: string, updates: Partial<Stakeholder>) => {
    setAllStakeholders(prev => prev.map(s => s.id === id ? { 
      ...s, 
      ...updates,
      updatedAt: new Date().toISOString()
    } : s));

    // Emit update event
    eventBus.emit('context_updated', {
      type: 'stakeholder_updated',
      stakeholderId: id,
      updates
    }, 'stakeholder_context');
  };

  const addStakeholder = (stakeholder: Omit<Stakeholder, 'id'>) => {
    const newStakeholder: Stakeholder = {
      ...stakeholder,
      id: `stakeholder-${Date.now()}`,
      workspaceId: currentWorkspace?.id || 'ws-1',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    setAllStakeholders(prev => [...prev, newStakeholder]);

    // Emit creation event
    eventBus.emit('context_updated', {
      type: 'stakeholder_created',
      stakeholder: newStakeholder
    }, 'stakeholder_context');
  };

  const assignToProject = (stakeholderId: string, projectId: string) => {
    setAllStakeholders(prev => prev.map(s => 
      s.id === stakeholderId 
        ? { 
          ...s, 
          projects: [...s.projects, projectId],
          updatedAt: new Date().toISOString()
        }
        : s
    ));

    // Emit assignment event
    eventBus.emit('context_updated', {
      type: 'stakeholder_assigned',
      stakeholderId,
      projectId
    }, 'stakeholder_context');
  };

  const removeFromProject = (stakeholderId: string, projectId: string) => {
    setAllStakeholders(prev => prev.map(s => 
      s.id === stakeholderId 
        ? { 
          ...s, 
          projects: s.projects.filter(p => p !== projectId),
          updatedAt: new Date().toISOString()
        }
        : s
    ));

    // Emit removal event
    eventBus.emit('context_updated', {
      type: 'stakeholder_unassigned',
      stakeholderId,
      projectId
    }, 'stakeholder_context');
  };

  const getStakeholdersByProject = (projectId: string): Stakeholder[] => {
    return stakeholders.filter(s => s.projects.includes(projectId));
  };

  const updateLastContact = (stakeholderId: string) => {
    const today = new Date().toISOString().split('T')[0];
    setAllStakeholders(prev => prev.map(s => 
      s.id === stakeholderId 
        ? { 
          ...s, 
          lastContact: today,
          updatedAt: new Date().toISOString()
        }
        : s
    ));

    // Emit contact update event
    eventBus.emit('context_updated', {
      type: 'stakeholder_contact_updated',
      stakeholderId,
      lastContact: today
    }, 'stakeholder_context');
  };

  return (
    <StakeholderContext.Provider value={{
      stakeholders,
      loading,
      getStakeholder,
      updateStakeholder,
      addStakeholder,
      assignToProject,
      removeFromProject,
      getStakeholdersByProject,
      updateLastContact
    }}>
      {children}
    </StakeholderContext.Provider>
  );
};
