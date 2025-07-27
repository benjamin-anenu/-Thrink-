import React, { createContext, useContext, useState, useEffect } from 'react';
import { dataPersistence } from '@/services/DataPersistence';
import { contextSynchronizer } from '@/services/ContextSynchronizer';
import { eventBus } from '@/services/EventBus';
import { useWorkspace } from '@/contexts/WorkspaceContext';
import { AvailabilityCalculationService, ResourceAvailability } from '@/services/AvailabilityCalculationService';

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
  workspaceId: string;
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
  refreshResourceAvailability: (resourceId?: string) => Promise<void>;
  getResourceAvailability: (resourceId: string) => Promise<ResourceAvailability | null>;
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
  const [allResources, setAllResources] = useState<Resource[]>([]);
  const [loading, setLoading] = useState(false);
  const { currentWorkspace } = useWorkspace();

  // Filter resources by current workspace
  const resources = allResources.filter(resource => 
    currentWorkspace ? resource.workspaceId === currentWorkspace.id : true
  );

  // Helper function to ensure resource has required array properties
  const sanitizeResource = (resource: any): Resource => {
    return {
      ...resource,
      skills: Array.isArray(resource.skills) ? resource.skills : [],
      currentProjects: Array.isArray(resource.currentProjects) ? resource.currentProjects : [],
      workspaceId: resource.workspaceId || currentWorkspace?.id || 'ws-1',
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
      setAllResources(sanitizedResources);
    } else {
      initializeSampleData();
    }
  }, []);

  // Register with context synchronizer
  useEffect(() => {
    const unregister = contextSynchronizer.registerContext('resources', (updatedResources: Resource[]) => {
      setAllResources(updatedResources);
    });

    return unregister;
  }, []);

  // Refresh resource availability when workspace changes
  useEffect(() => {
    if (currentWorkspace) {
      refreshResourceAvailability();
    }
  }, [currentWorkspace]);

  const initializeSampleData = () => {
    const workspaceId = currentWorkspace?.id || 'ws-1';
    const sampleResources: Resource[] = [
      {
        id: 'sarah',
        name: 'Sarah Johnson',
        role: 'Senior Frontend Developer',
        department: 'Engineering',
        email: 'sarah.johnson@company.com',
        phone: '+1 (555) 123-4567',
        location: 'San Francisco, CA',
        skills: ['React', 'TypeScript', 'Node.js', 'UI/UX'],
        availability: 100,
        currentProjects: ['Project Alpha'],
        hourlyRate: '$85/hr',
        utilization: 75,
        status: 'Busy',
        workspaceId
      },
      {
        id: 'mike',
        name: 'Mike Chen',
        role: 'Backend Developer',
        department: 'Engineering',
        email: 'mike.chen@company.com',
        phone: '+1 (555) 234-5678',
        location: 'Austin, TX',
        skills: ['Python', 'Django', 'PostgreSQL', 'AWS'],
        availability: 100,
        currentProjects: ['Project Beta'],
        hourlyRate: '$80/hr',
        utilization: 60,
        status: 'Available',
        workspaceId
      },
      {
        id: 'emma',
        name: 'Emma Rodriguez',
        role: 'Product Manager',
        department: 'Product',
        email: 'emma.rodriguez@company.com',
        phone: '+1 (555) 345-6789',
        location: 'New York, NY',
        skills: ['Product Strategy', 'Agile', 'User Research', 'Analytics'],
        availability: 100,
        currentProjects: ['Project Alpha', 'Project Beta'],
        hourlyRate: '$90/hr',
        utilization: 90,
        status: 'Busy',
        workspaceId
      },
      {
        id: 'david',
        name: 'David Kim',
        role: 'UX Designer',
        department: 'Design',
        email: 'david.kim@company.com',
        phone: '+1 (555) 456-7890',
        location: 'Seattle, WA',
        skills: ['Figma', 'Sketch', 'Prototyping', 'User Testing'],
        availability: 100,
        currentProjects: ['Project Gamma'],
        hourlyRate: '$75/hr',
        utilization: 45,
        status: 'Available',
        workspaceId
      },
      {
        id: 'lisa',
        name: 'Lisa Thompson',
        role: 'DevOps Engineer',
        department: 'Engineering',
        email: 'lisa.thompson@company.com',
        phone: '+1 (555) 567-8901',
        location: 'Denver, CO',
        skills: ['Docker', 'Kubernetes', 'CI/CD', 'AWS'],
        availability: 100,
        currentProjects: ['Project Alpha'],
        hourlyRate: '$85/hr',
        utilization: 110,
        status: 'Overallocated',
        workspaceId
      }
    ];

    setAllResources(sampleResources);
    dataPersistence.saveData('resources', sampleResources);
  };

  const getResource = (id: string): Resource | null => {
    return resources.find(r => r.id === id) || null;
  };

  const updateResource = (id: string, updates: Partial<Resource>) => {
    setAllResources(prev => prev.map(r => r.id === id ? sanitizeResource({ 
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
      id: `resource-${Date.now()}`,
      workspaceId: currentWorkspace?.id || 'ws-1'
    });
    setAllResources(prev => [...prev, newResource]);

    // Emit creation event
    eventBus.emit('context_updated', {
      type: 'resource_created',
      resource: newResource
    }, 'resource_context');
  };

  const assignToProject = (resourceId: string, projectId: string) => {
    setAllResources(prev => prev.map(r => 
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
    setAllResources(prev => prev.map(r => 
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
    setAllResources(prev => prev.map(r => 
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

  // New method to refresh resource availability using the calculation service
  const refreshResourceAvailability = async (resourceId?: string) => {
    if (!currentWorkspace) return;

    try {
      if (resourceId) {
        // Refresh single resource
        const availability = await AvailabilityCalculationService.calculateResourceAvailability(
          resourceId, 
          currentWorkspace.id
        );
        
        if (availability) {
          updateResource(resourceId, {
            utilization: availability.currentUtilization,
            availability: availability.calculatedAvailability,
            status: availability.status
          });
        }
      } else {
        // Refresh all resources in workspace
        const availabilities = await AvailabilityCalculationService.calculateWorkspaceAvailability(
          currentWorkspace.id
        );
        
        availabilities.forEach(availability => {
          updateResource(availability.resourceId, {
            utilization: availability.currentUtilization,
            availability: availability.calculatedAvailability,
            status: availability.status
          });
        });
      }
    } catch (error) {
      console.error('Error refreshing resource availability:', error);
    }
  };

  // New method to get resource availability
  const getResourceAvailability = async (resourceId: string): Promise<ResourceAvailability | null> => {
    if (!currentWorkspace) return null;
    
    try {
      return await AvailabilityCalculationService.calculateResourceAvailability(
        resourceId, 
        currentWorkspace.id
      );
    } catch (error) {
      console.error('Error getting resource availability:', error);
      return null;
    }
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
      getResourcesByProject,
      refreshResourceAvailability,
      getResourceAvailability
    }}>
      {children}
    </ResourceContext.Provider>
  );
};
