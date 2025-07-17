
import React, { createContext, useContext, useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export interface Resource {
  id: string;
  name: string;
  email?: string;
  role?: string;
  department?: string;
  skills?: string[];
  availability?: number;
  phone?: string;
  location?: string;
  currentProjects?: string[];
  hourlyRate?: string;
  utilization?: number;
  status?: string;
  created_at: string;
  updated_at: string;
}

interface ResourceContextType {
  resources: Resource[];
  loading: boolean;
  addResource: (resource: Omit<Resource, 'id' | 'created_at' | 'updated_at'>) => Promise<void>;
  updateResource: (id: string, updates: Partial<Resource>) => Promise<void>;
  deleteResource: (id: string) => Promise<void>;
  refreshResources: () => Promise<void>;
  getResourcesByProject: (projectId: string) => Resource[];
}

const ResourceContext = createContext<ResourceContextType | undefined>(undefined);

export const useResource = () => {
  const context = useContext(ResourceContext);
  if (!context) {
    throw new Error('useResource must be used within a ResourceProvider');
  }
  return context;
};

// Also export as useResources for backward compatibility
export const useResources = useResource;

export const ResourceProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [resources, setResources] = useState<Resource[]>([]);
  const [loading, setLoading] = useState(true);

  const loadResources = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('resources')
        .select('*')
        .order('name');

      if (error) throw error;

      const transformedResources = (data || []).map(resource => ({
        id: resource.id,
        name: resource.name,
        email: resource.email || undefined,
        role: resource.role || undefined,
        department: resource.department || undefined,
        skills: [],
        availability: 100,
        phone: '',
        location: '',
        currentProjects: [],
        hourlyRate: '$50/hr',
        utilization: 75,
        status: 'Available',
        created_at: resource.created_at,
        updated_at: resource.updated_at
      }));

      setResources(transformedResources);
    } catch (error) {
      console.error('Error loading resources:', error);
      toast.error('Failed to load resources');
      setResources([]);
    } finally {
      setLoading(false);
    }
  };

  const addResource = async (resourceData: Omit<Resource, 'id' | 'created_at' | 'updated_at'>) => {
    try {
      const { data, error } = await supabase
        .from('resources')
        .insert({
          name: resourceData.name,
          email: resourceData.email,
          role: resourceData.role,
          department: resourceData.department
        })
        .select()
        .single();

      if (error) throw error;

      const newResource: Resource = {
        id: data.id,
        name: data.name,
        email: data.email || undefined,
        role: data.role || undefined,
        department: data.department || undefined,
        skills: resourceData.skills || [],
        availability: resourceData.availability || 100,
        phone: resourceData.phone || '',
        location: resourceData.location || '',
        currentProjects: resourceData.currentProjects || [],
        hourlyRate: resourceData.hourlyRate || '$50/hr',
        utilization: resourceData.utilization || 75,
        status: resourceData.status || 'Available',
        created_at: data.created_at,
        updated_at: data.updated_at
      };

      setResources(prev => [...prev, newResource]);
      toast.success('Resource added successfully');
    } catch (error) {
      console.error('Error adding resource:', error);
      toast.error('Failed to add resource');
      throw error;
    }
  };

  const updateResource = async (id: string, updates: Partial<Resource>) => {
    try {
      const { data, error } = await supabase
        .from('resources')
        .update({
          name: updates.name,
          email: updates.email,
          role: updates.role,
          department: updates.department
        })
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;

      const updatedResource: Resource = {
        id: data.id,
        name: data.name,
        email: data.email || undefined,
        role: data.role || undefined,
        department: data.department || undefined,
        skills: updates.skills || [],
        availability: updates.availability || 100,
        phone: updates.phone || '',
        location: updates.location || '',
        currentProjects: updates.currentProjects || [],
        hourlyRate: updates.hourlyRate || '$50/hr',
        utilization: updates.utilization || 75,
        status: updates.status || 'Available',
        created_at: data.created_at,
        updated_at: data.updated_at
      };

      setResources(prev => prev.map(resource => 
        resource.id === id ? updatedResource : resource
      ));
      toast.success('Resource updated successfully');
    } catch (error) {
      console.error('Error updating resource:', error);
      toast.error('Failed to update resource');
      throw error;
    }
  };

  const deleteResource = async (id: string) => {
    try {
      const { error } = await supabase
        .from('resources')
        .delete()
        .eq('id', id);

      if (error) throw error;

      setResources(prev => prev.filter(resource => resource.id !== id));
      toast.success('Resource deleted successfully');
    } catch (error) {
      console.error('Error deleting resource:', error);
      toast.error('Failed to delete resource');
      throw error;
    }
  };

  const getResourcesByProject = (projectId: string): Resource[] => {
    // For now, return all resources since we don't have project assignment logic yet
    return resources;
  };

  useEffect(() => {
    loadResources();

    const subscription = supabase
      .channel('resources_changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'resources'
        },
        () => {
          loadResources();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(subscription);
    };
  }, []);

  const value: ResourceContextType = {
    resources,
    loading,
    addResource,
    updateResource,
    deleteResource,
    refreshResources: loadResources,
    getResourcesByProject
  };

  return (
    <ResourceContext.Provider value={value}>
      {children}
    </ResourceContext.Provider>
  );
};
