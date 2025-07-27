import React, { createContext, useContext, useState, useEffect } from 'react';
import { dataPersistence } from '@/services/DataPersistence';
import { contextSynchronizer } from '@/services/ContextSynchronizer';
import { eventBus } from '@/services/EventBus';
import { useWorkspace } from '@/contexts/WorkspaceContext';
import { AvailabilityCalculationService, ResourceAvailability } from '@/services/AvailabilityCalculationService';
import { supabase } from '@/integrations/supabase/client';

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

  // Helper function to transform database resource to Resource interface
  const transformResource = (dbResource: any): Resource => {
    return {
      id: dbResource.id,
      name: dbResource.name || '',
      role: dbResource.role || '',
      department: dbResource.department || '',
      email: dbResource.email || '',
      phone: dbResource.phone || '',
      location: dbResource.location || '',
      skills: Array.isArray(dbResource.skills) ? dbResource.skills : [],
      availability: dbResource.availability || 100,
      currentProjects: Array.isArray(dbResource.current_projects) ? dbResource.current_projects : [],
      hourlyRate: dbResource.hourly_rate ? `$${dbResource.hourly_rate}/hr` : '$0/hr',
      utilization: dbResource.utilization || 0,
      status: dbResource.status || 'Available',
      workspaceId: dbResource.workspace_id || currentWorkspace?.id || '',
      createdAt: dbResource.created_at,
      updatedAt: dbResource.updated_at,
      lastActive: dbResource.last_active || new Date().toISOString()
    };
  };

  // Load resources from Supabase database
  const loadResourcesFromDatabase = async () => {
    if (!currentWorkspace) {
      console.log('[Resource] No current workspace, skipping resource fetch');
      return;
    }

    console.log('[Resource] Loading resources from Supabase database for workspace:', currentWorkspace.id);
    setLoading(true);

    try {
      const { data: resourcesData, error } = await supabase
        .from('resources')
        .select('*')
        .eq('workspace_id', currentWorkspace.id);

      if (error) {
        console.error('[Resource] Database error:', error);
        throw error;
      }

      console.log('[Resource] Fetched', resourcesData?.length || 0, 'resources from database');

      if (resourcesData && resourcesData.length > 0) {
        const transformedResources = resourcesData.map(transformResource);
        setAllResources(transformedResources);
      } else {
        console.log('[Resource] No resources found in database, initializing sample data');
        await initializeSampleData();
      }
    } catch (error) {
      console.error('[Resource] Error loading resources:', error);
      // Fallback to sample data on error
      await initializeSampleData();
    } finally {
      setLoading(false);
    }
  };

  // Load resources on mount and workspace change
  useEffect(() => {
    loadResourcesFromDatabase();
  }, [currentWorkspace]);

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

  const initializeSampleData = async () => {
    const workspaceId = currentWorkspace?.id || 'ws-1';
    const sampleResources = [
      {
        name: 'Sarah Johnson',
        role: 'Senior Frontend Developer',
        department: 'Engineering',
        email: 'sarah.johnson@company.com',
        phone: '+1 (555) 123-4567',
        location: 'San Francisco, CA',
        skills: ['React', 'TypeScript', 'Node.js', 'UI/UX'],
        availability: 100,
        current_projects: ['Project Alpha'],
        hourly_rate: 85,
        utilization: 75,
        status: 'Busy',
        workspace_id: workspaceId
      },
      {
        name: 'Mike Chen',
        role: 'Backend Developer',
        department: 'Engineering',
        email: 'mike.chen@company.com',
        phone: '+1 (555) 234-5678',
        location: 'Austin, TX',
        skills: ['Python', 'Django', 'PostgreSQL', 'AWS'],
        availability: 100,
        current_projects: ['Project Beta'],
        hourly_rate: 80,
        utilization: 60,
        status: 'Available',
        workspace_id: workspaceId
      },
      {
        name: 'Emma Rodriguez',
        role: 'Product Manager',
        department: 'Product',
        email: 'emma.rodriguez@company.com',
        phone: '+1 (555) 345-6789',
        location: 'New York, NY',
        skills: ['Product Strategy', 'Agile', 'User Research', 'Analytics'],
        availability: 100,
        current_projects: ['Project Alpha', 'Project Beta'],
        hourly_rate: 90,
        utilization: 90,
        status: 'Busy',
        workspace_id: workspaceId
      },
      {
        name: 'David Kim',
        role: 'UX Designer',
        department: 'Design',
        email: 'david.kim@company.com',
        phone: '+1 (555) 456-7890',
        location: 'Seattle, WA',
        skills: ['Figma', 'Sketch', 'Prototyping', 'User Testing'],
        availability: 100,
        current_projects: ['Project Gamma'],
        hourly_rate: 75,
        utilization: 45,
        status: 'Available',
        workspace_id: workspaceId
      },
      {
        name: 'Lisa Thompson',
        role: 'DevOps Engineer',
        department: 'Engineering',
        email: 'lisa.thompson@company.com',
        phone: '+1 (555) 567-8901',
        location: 'Denver, CO',
        skills: ['Docker', 'Kubernetes', 'CI/CD', 'AWS'],
        availability: 100,
        current_projects: ['Project Alpha'],
        hourly_rate: 85,
        utilization: 110,
        status: 'Overallocated',
        workspace_id: workspaceId
      }
    ];

    try {
      const { data, error } = await supabase
        .from('resources')
        .insert(sampleResources)
        .select();

      if (error) {
        console.error('[Resource] Error inserting sample data:', error);
        return;
      }

      console.log('[Resource] Inserted', data?.length || 0, 'sample resources to database');
      
      if (data) {
        const transformedResources = data.map(transformResource);
        setAllResources(transformedResources);
      }
    } catch (error) {
      console.error('[Resource] Error initializing sample data:', error);
    }
  };

  const getResource = (id: string): Resource | null => {
    return resources.find(r => r.id === id) || null;
  };

  const updateResource = (id: string, updates: Partial<Resource>) => {
    setAllResources(prev => {
      const updated = prev.map(r => r.id === id ? transformResource({ 
        ...r, 
        ...updates,
        updatedAt: new Date().toISOString()
      }) : r);
      
      // Persist updated data
      dataPersistence.persistData('resources', updated, 'resource_update');
      return updated;
    });

    // Emit update event
    eventBus.emit('resource_availability_changed', {
      type: 'resource_updated',
      resourceId: id,
      updates
    }, 'resource_context');
  };

  const addResource = (resource: Omit<Resource, 'id'>) => {
    const newResource: Resource = transformResource({
      ...resource,
      id: `resource-${Date.now()}`,
      workspaceId: currentWorkspace?.id || 'ws-1'
    });
    setAllResources(prev => {
      const updated = [...prev, newResource];
      
      // Persist updated data
      dataPersistence.persistData('resources', updated, 'resource_add');
      return updated;
    });

    // Emit creation event
    eventBus.emit('context_updated', {
      type: 'resource_created',
      resource: newResource
    }, 'resource_context');
  };

  const assignToProject = (resourceId: string, projectId: string) => {
    setAllResources(prev => {
      const updated = prev.map(r => 
        r.id === resourceId 
          ? { 
            ...r, 
            currentProjects: [...r.currentProjects, projectId],
            lastActive: new Date().toISOString(),
            updatedAt: new Date().toISOString()
          }
          : r
      );
      
      // Persist updated data
      dataPersistence.persistData('resources', updated, 'resource_assignment');
      return updated;
    });

    // Emit assignment event
    eventBus.emit('resource_assigned', {
      resourceId,
      projectId,
      timestamp: new Date()
    }, 'resource_context');
  };

  const removeFromProject = (resourceId: string, projectId: string) => {
    setAllResources(prev => {
      const updated = prev.map(r => 
        r.id === resourceId 
          ? { 
            ...r, 
            currentProjects: r.currentProjects.filter(p => p !== projectId),
            updatedAt: new Date().toISOString()
          }
          : r
      );
      
      // Persist updated data
      dataPersistence.persistData('resources', updated, 'resource_unassignment');
      return updated;
    });

    // Emit removal event
    eventBus.emit('context_updated', {
      type: 'resource_unassigned',
      resourceId,
      projectId
    }, 'resource_context');
  };

  const updateUtilization = (resourceId: string, utilization: number) => {
    setAllResources(prev => {
      const updated = prev.map(r => 
        r.id === resourceId 
          ? { 
              ...r, 
              utilization,
              status: utilization > 100 ? 'Overallocated' : utilization > 80 ? 'Busy' : 'Available',
              lastActive: new Date().toISOString(),
              updatedAt: new Date().toISOString()
            }
          : r
      );
      
      // Persist updated data
      dataPersistence.persistData('resources', updated, 'utilization_update');
      return updated;
    });

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
      refreshResourceAvailability,
      getResourceAvailability
    }}>
      {children}
    </ResourceContext.Provider>
  );
};
