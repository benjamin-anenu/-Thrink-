
import React, { createContext, useContext, useState, useEffect } from 'react';

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
    const savedStakeholders = localStorage.getItem('stakeholders');
    if (savedStakeholders) {
      setStakeholders(JSON.parse(savedStakeholders));
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
          status: 'Active'
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
          status: 'Active'
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
          status: 'Active'
        }
      ];
      setStakeholders(sampleStakeholders);
      localStorage.setItem('stakeholders', JSON.stringify(sampleStakeholders));
    }
  }, []);

  // Save stakeholders to localStorage whenever stakeholders change
  useEffect(() => {
    if (stakeholders.length > 0) {
      localStorage.setItem('stakeholders', JSON.stringify(stakeholders));
    }
  }, [stakeholders]);

  const getStakeholder = (id: string): Stakeholder | null => {
    return stakeholders.find(s => s.id === id) || null;
  };

  const updateStakeholder = (id: string, updates: Partial<Stakeholder>) => {
    setStakeholders(prev => prev.map(s => s.id === id ? { ...s, ...updates } : s));
  };

  const addStakeholder = (stakeholder: Omit<Stakeholder, 'id'>) => {
    const newStakeholder: Stakeholder = {
      ...stakeholder,
      id: `stakeholder-${Date.now()}`
    };
    setStakeholders(prev => [...prev, newStakeholder]);
  };

  const assignToProject = (stakeholderId: string, projectId: string) => {
    setStakeholders(prev => prev.map(s => 
      s.id === stakeholderId 
        ? { ...s, projects: [...s.projects, projectId] }
        : s
    ));
  };

  const removeFromProject = (stakeholderId: string, projectId: string) => {
    setStakeholders(prev => prev.map(s => 
      s.id === stakeholderId 
        ? { ...s, projects: s.projects.filter(p => p !== projectId) }
        : s
    ));
  };

  const getStakeholdersByProject = (projectId: string): Stakeholder[] => {
    return stakeholders.filter(s => s.projects.includes(projectId));
  };

  const updateLastContact = (stakeholderId: string) => {
    const today = new Date().toISOString().split('T')[0];
    setStakeholders(prev => prev.map(s => 
      s.id === stakeholderId 
        ? { ...s, lastContact: today }
        : s
    ));
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
