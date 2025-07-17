
import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { supabase } from '@/integrations/supabase/client';

export interface Resource {
  id: string;
  name: string;
  email?: string;
  role?: string;
  department?: string;
  phone?: string;
  location?: string;
  skills?: string[];
  availability?: number;
  currentProjects?: string[];
  hourlyRate?: string;
  utilization?: number;
  status?: string;
  workspaceId?: string;
  created_at?: string;
  updated_at?: string;
}

interface ResourceContextType {
  resources: Resource[];
  loading: boolean;
  error: string | null;
  createResource: (resource: Omit<Resource, 'id' | 'created_at' | 'updated_at'>) => Promise<Resource>;
  updateResource: (id: string, updates: Partial<Resource>) => Promise<void>;
  deleteResource: (id: string) => Promise<void>;
  refreshResources: () => Promise<void>;
  addResource: (resource: Omit<Resource, 'id' | 'created_at' | 'updated_at'>) => Promise<Resource>;
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

interface ResourceProviderProps {
  children: ReactNode;
}

export const ResourceProvider: React.FC<ResourceProviderProps> = ({ children }) => {
  const [resources, setResources] = useState<Resource[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchResources = async () => {
    try {
      setLoading(true);
      setError(null);

      const { data, error: fetchError } = await supabase
        .from('resources')
        .select('*')
        .order('created_at', { ascending: false });

      if (fetchError) {
        throw fetchError;
      }

      // Map the basic database fields to the extended Resource interface
      const mappedResources: Resource[] = (data || []).map(resource => ({
        id: resource.id,
        name: resource.name,
        email: resource.email,
        role: resource.role,
        department: resource.department,
        phone: '',
        location: '',
        skills: [],
        availability: 80,
        currentProjects: [],
        hourlyRate: '$50/hr',
        utilization: 75,
        status: 'Available',
        workspaceId: '',
        created_at: resource.created_at,
        updated_at: resource.updated_at
      }));

      setResources(mappedResources);
    } catch (err) {
      console.error('Error fetching resources:', err);
      setError(err instanceof Error ? err.message : 'Failed to fetch resources');
    } finally {
      setLoading(false);
    }
  };

  const createResource = async (resourceData: Omit<Resource, 'id' | 'created_at' | 'updated_at'>): Promise<Resource> => {
    try {
      // Only send basic fields to the database
      const basicResourceData = {
        name: resourceData.name,
        email: resourceData.email,
        role: resourceData.role,
        department: resourceData.department
      };

      const { data, error: createError } = await supabase
        .from('resources')
        .insert([basicResourceData])
        .select()
        .single();

      if (createError) {
        throw createError;
      }

      // Map to full Resource interface
      const newResource: Resource = {
        id: data.id,
        name: data.name,
        email: data.email,
        role: data.role,
        department: data.department,
        phone: resourceData.phone || '',
        location: resourceData.location || '',
        skills: resourceData.skills || [],
        availability: resourceData.availability || 80,
        currentProjects: resourceData.currentProjects || [],
        hourlyRate: resourceData.hourlyRate || '$50/hr',
        utilization: resourceData.utilization || 75,
        status: resourceData.status || 'Available',
        workspaceId: resourceData.workspaceId || '',
        created_at: data.created_at,
        updated_at: data.updated_at
      };

      setResources(prev => [newResource, ...prev]);
      return newResource;
    } catch (err) {
      console.error('Error creating resource:', err);
      throw err;
    }
  };

  const updateResource = async (id: string, updates: Partial<Resource>): Promise<void> => {
    try {
      // Only send basic fields to the database
      const basicUpdates = {
        name: updates.name,
        email: updates.email,
        role: updates.role,
        department: updates.department
      };

      const { error: updateError } = await supabase
        .from('resources')
        .update(basicUpdates)
        .eq('id', id);

      if (updateError) {
        throw updateError;
      }

      setResources(prev => 
        prev.map(resource => 
          resource.id === id ? { ...resource, ...updates } : resource
        )
      );
    } catch (err) {
      console.error('Error updating resource:', err);
      throw err;
    }
  };

  const deleteResource = async (id: string): Promise<void> => {
    try {
      const { error: deleteError } = await supabase
        .from('resources')
        .delete()
        .eq('id', id);

      if (deleteError) {
        throw deleteError;
      }

      setResources(prev => prev.filter(resource => resource.id !== id));
    } catch (err) {
      console.error('Error deleting resource:', err);
      throw err;
    }
  };

  const refreshResources = async () => {
    await fetchResources();
  };

  const addResource = async (resourceData: Omit<Resource, 'id' | 'created_at' | 'updated_at'>): Promise<Resource> => {
    return createResource(resourceData);
  };

  const getResourcesByProject = (projectId: string): Resource[] => {
    return resources.filter(resource => 
      resource.currentProjects?.includes(projectId)
    );
  };

  useEffect(() => {
    fetchResources();
  }, []);

  const contextValue: ResourceContextType = {
    resources,
    loading,
    error,
    createResource,
    updateResource,
    deleteResource,
    refreshResources,
    addResource,
    getResourcesByProject
  };

  return (
    <ResourceContext.Provider value={contextValue}>
      {children}
    </ResourceContext.Provider>
  );
};
