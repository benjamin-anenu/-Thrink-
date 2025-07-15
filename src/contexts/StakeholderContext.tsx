
import React, { createContext, useContext, useState, useEffect } from 'react';
import { dataPersistence } from '@/services/DataPersistence';
import { contextSynchronizer } from '@/services/ContextSynchronizer';
import { eventBus } from '@/services/EventBus';

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
  const [stakeholders, setStakeholders] = useState<Stakeholder[]>([]);
  const [loading, setLoading] = useState(false);

  // Load stakeholders from localStorage on mount
  useEffect(() => {
    const savedStakeholders = dataPersistence.getData('stakeholders');
    if (savedStakeholders) {
      setStakeholders(savedStakeholders);
    } else {
      // Initialize with sample data
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
          projects: ['1'],
          lastContact: '2024-01-10',
          status: 'Active',
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
          projects: ['1'],
          lastContact: '2024-01-08',
          status: 'Active',
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        },
        {
          id: 'mike-wilson',
          name: 'Mike Wilson',
          role: 'Engineering Manager',
          department: 'Engineering',
          email: 'mike.wilson@company.com',
          phone: '+1 (555) 333-3333',
          influence: 'Medium',
          interest: 'High',
          communicationPreference: 'Email',
          projects: ['1'],
          lastContact: '2024-01-12',
          status: 'Active',
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        }
      ];
      setStakeholders(sampleStakeholders);
      dataPersistence.persistData('stakeholders', sampleStakeholders, 'stakeholder_context');
    }
  }, []);

  // Register with context synchronizer
  useEffect(() => {
    const unregister = contextSynchronizer.registerContext('stakeholders', (updatedStakeholders) => {
      setStakeholders(updatedStakeholders);
    });

    return unregister;
  }, []);

  // Save stakeholders to localStorage whenever stakeholders change
  useEffect(() => {
    if (stakeholders.length > 0) {
      dataPersistence.persistData('stakeholders', stakeholders, 'stakeholder_context');
    }
  }, [stakeholders]);

  const getStakeholder = (id: string): Stakeholder | null => {
    return stakeholders.find(s => s.id === id) || null;
  };

  const updateStakeholder = (id: string, updates: Partial<Stakeholder>) => {
    setStakeholders(prev => prev.map(s => s.id === id ? { 
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
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    setStakeholders(prev => [...prev, newStakeholder]);

    // Emit creation event
    eventBus.emit('context_updated', {
      type: 'stakeholder_created',
      stakeholder: newStakeholder
    }, 'stakeholder_context');
  };

  const assignToProject = (stakeholderId: string, projectId: string) => {
    setStakeholders(prev => prev.map(s => 
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
    setStakeholders(prev => prev.map(s => 
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
    setStakeholders(prev => prev.map(s => 
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
