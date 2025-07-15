
import React, { createContext, useContext, useState, useEffect } from 'react';
import { dataPersistence } from '@/services/DataPersistence';
import { contextSynchronizer } from '@/services/ContextSynchronizer';
import { eventBus } from '@/services/EventBus';

export interface Resource {
  id: string;
  name: string;
  role: string;
  department: string;
  email: string;
  phone: string;
  location: string;
  skills: string[];
  availability: number;
  currentProjects: string[];
  hourlyRate: string;
  utilization: number;
  status: 'Available' | 'Busy' | 'Overallocated';
  createdAt?: string;
  updatedAt?: string;
  lastActive?: string;
}

interface ResourceContextType {
  resources: Resource[];
  loading: boolean;
  getResource: (id: string) => Resource | null;
  updateResource: (id: string, updates: Partial<Resource>) => void;
  addResource: (resource: Omit<Resource, 'id'>) => void;
  assignToProject: (resourceId: string, projectId: string) => void;
  removeFromProject: (resourceId: string, projectId: string) => void;
  updateUtilization: (resourceId: string, utilization: number) => void;
  getAvailableResources: () => Resource[];
  getResourcesByProject: (projectId: string) => Resource[];
}

const ResourceContext = createContext<ResourceContextType | undefined>(undefined);

export const useResources = () => {
  const context = useContext(ResourceContext);
  if (!context) {
    throw new Error('useResources must be used within a ResourceProvider');
  }
  return context;
};

export const ResourceProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [resources, setResources] = useState<Resource[]>([]);
  const [loading, setLoading] = useState(false);

  // Helper function to ensure resource has required array properties
  const sanitizeResource = (resource: any): Resource => {
    return {
      ...resource,
      skills: Array.isArray(resource.skills) ? resource.skills : [],
      currentProjects: Array.isArray(resource.currentProjects) ? resource.currentProjects : [],
      createdAt: resource.createdAt || new Date().toISOString(),
      updatedAt: resource.updatedAt || new Date().toISOString(),
      lastActive: resource.lastActive || new Date().toISOString()
    };
  };

  // Load resources from persistent storage on mount
  useEffect(() => {
    const savedResources = dataPersistence.getData<Resource[]>('resources');
    if (savedResources) {
      const sanitizedResources = savedResources.map(sanitizeResource);
      setResources(sanitizedResources);
    } else {
      initializeSampleData();
    }
  }, []);

  // Register with context synchronizer
  useEffect(() => {
    const unregister = contextSynchronizer.registerContext('resources', (updatedResources: Resource[]) => {
      setResources(updatedResources);
    });

    return unregister;
  }, []);

  const initializeSampleData = () => {
    const sampleResources: Resource[] = [
      {
        id: 'sarah',
        name: 'Sarah Johnson',
        role: 'Senior Frontend Developer',
        department: 'Engineering',
        email: 'sarah.johnson@company.com',
        phone: '+1 (555) 123-4567',
        location: 'New York, NY',
        skills: ['React', 'TypeScript', 'CSS', 'UI/UX'],
        availability: 75,
        currentProjects: ['Project Alpha'],
        hourlyRate: '$85/hr',
        utilization: 85,
        status: 'Available',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        lastActive: new Date().toISOString()
      },
      {
        id: 'michael',
        name: 'Michael Chen',
        role: 'Backend Developer',
        department: 'Engineering',
        email: 'michael.chen@company.com',
        phone: '+1 (555) 234-5678',
        location: 'San Francisco, CA',
        skills: ['Node.js', 'Python', 'PostgreSQL', 'AWS'],
        availability: 40,
        currentProjects: ['Project Alpha'],
        hourlyRate: '$90/hr',
        utilization: 95,
        status: 'Busy',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        lastActive: new Date().toISOString()
      },
      {
        id: 'emily',
        name: 'Emily Rodriguez',
        role: 'UX Designer',
        department: 'Design',
        email: 'emily.rodriguez@company.com',
        phone: '+1 (555) 345-6789',
        location: 'Austin, TX',
        skills: ['Figma', 'User Research', 'Prototyping', 'Design Systems'],
        availability: 90,
        currentProjects: ['Project Alpha'],
        hourlyRate: '$75/hr',
        utilization: 60,
        status: 'Available',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        lastActive: new Date().toISOString()
      },
      {
        id: 'david',
        name: 'David Kim',
        role: 'Project Manager',
        department: 'Operations',
        email: 'david.kim@company.com',
        phone: '+1 (555) 456-7890',
        location: 'Seattle, WA',
        skills: ['Agile', 'Scrum', 'Risk Management', 'Stakeholder Management'],
        availability: 60,
        currentProjects: ['Project Alpha'],
        hourlyRate: '$70/hr',
        utilization: 80,
        status: 'Available',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        lastActive: new Date().toISOString()
      },
      {
        id: 'james',
        name: 'James Wilson',
        role: 'DevOps Engineer',
        department: 'Engineering',
        email: 'james.wilson@company.com',
        phone: '+1 (555) 678-9012',
        location: 'Denver, CO',
        skills: ['Docker', 'Kubernetes', 'AWS', 'CI/CD'],
        availability: 20,
        currentProjects: ['Project Alpha'],
        hourlyRate: '$95/hr',
        utilization: 100,
        status: 'Overallocated',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        lastActive: new Date().toISOString()
      }
    ];
    setResources(sampleResources);
    dataPersistence.persistData('resources', sampleResources, 'resource_context');
  };

  // Save resources to persistent storage whenever resources change
  useEffect(() => {
    if (resources.length > 0) {
      dataPersistence.persistData('resources', resources, 'resource_context');
    }
  }, [resources]);

  const getResource = (id: string): Resource | null => {
    return resources.find(r => r.id === id) || null;
  };

  const updateResource = (id: string, updates: Partial<Resource>) => {
    setResources(prev => prev.map(r => r.id === id ? sanitizeResource({ 
      ...r, 
      ...updates,
      updatedAt: new Date().toISOString()
    }) : r));

    // Emit update event
    eventBus.emit('resource_availability_changed', {
      type: 'resource_updated',
      resourceId: id,
      updates
    }, 'resource_context');
  };

  const addResource = (resource: Omit<Resource, 'id'>) => {
    const newResource: Resource = sanitizeResource({
      ...resource,
      id: `resource-${Date.now()}`
    });
    setResources(prev => [...prev, newResource]);

    // Emit creation event
    eventBus.emit('context_updated', {
      type: 'resource_created',
      resource: newResource
    }, 'resource_context');
  };

  const assignToProject = (resourceId: string, projectId: string) => {
    setResources(prev => prev.map(r => 
      r.id === resourceId 
        ? { 
          ...r, 
          currentProjects: [...r.currentProjects, projectId],
          lastActive: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        }
        : r
    ));

    // Emit assignment event
    eventBus.emit('resource_assigned', {
      resourceId,
      projectId,
      timestamp: new Date()
    }, 'resource_context');
  };

  const removeFromProject = (resourceId: string, projectId: string) => {
    setResources(prev => prev.map(r => 
      r.id === resourceId 
        ? { 
          ...r, 
          currentProjects: r.currentProjects.filter(p => p !== projectId),
          updatedAt: new Date().toISOString()
        }
        : r
    ));

    // Emit removal event
    eventBus.emit('context_updated', {
      type: 'resource_unassigned',
      resourceId,
      projectId
    }, 'resource_context');
  };

  const updateUtilization = (resourceId: string, utilization: number) => {
    setResources(prev => prev.map(r => 
      r.id === resourceId 
        ? { 
            ...r, 
            utilization,
            status: utilization > 100 ? 'Overallocated' : utilization > 80 ? 'Busy' : 'Available',
            lastActive: new Date().toISOString(),
            updatedAt: new Date().toISOString()
          }
        : r
    ));

    // Emit utilization update event
    eventBus.emit('resource_availability_changed', {
      resourceId,
      utilization,
      status: utilization > 100 ? 'Overallocated' : utilization > 80 ? 'Busy' : 'Available'
    }, 'resource_context');
  };

  const getAvailableResources = (): Resource[] => {
    return resources.filter(r => r.status === 'Available');
  };

  const getResourcesByProject = (projectId: string): Resource[] => {
    return resources.filter(r => r.currentProjects.includes(projectId));
  };

  return (
    <ResourceContext.Provider value={{
      resources,
      loading,
      getResource,
      updateResource,
      addResource,
      assignToProject,
      removeFromProject,
      updateUtilization,
      getAvailableResources,
      getResourcesByProject
    }}>
      {children}
    </ResourceContext.Provider>
  );
};
