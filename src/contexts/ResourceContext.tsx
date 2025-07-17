
import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

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
  created_at: string;
  updated_at: string;
}

interface ResourceContextType {
  resources: Resource[];
  loading: boolean;
  addResource: (resourceData: Omit<Resource, 'id' | 'created_at' | 'updated_at'>) => Promise<void>;
  updateResource: (id: string, resourceData: Partial<Resource>) => Promise<void>;
  deleteResource: (id: string) => Promise<void>;
  refreshResources: () => Promise<void>;
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

export const ResourceProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
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

      // Transform database data to match our interface with default values
      const transformedResources: Resource[] = (data || []).map(resource => ({
        ...resource,
        phone: resource.phone || '',
        location: resource.location || '',
        skills: resource.skills || [],
        currentProjects: resource.current_projects || [],
        hourlyRate: resource.hourly_rate || '$0/hr',
        utilization: resource.utilization || 0,
        status: resource.status || 'Available',
        availability: resource.availability || 100
      }));

      setResources(transformedResources);
    } catch (error) {
      console.error('Error loading resources:', error);
      toast.error('Failed to load resources');
    } finally {
      setLoading(false);
    }
  };

  const addResource = async (resourceData: Omit<Resource, 'id' | 'created_at' | 'updated_at'>) => {
    try {
      const { data, error } = await supabase
        .from('resources')
        .insert([{
          name: resourceData.name,
          email: resourceData.email,
          role: resourceData.role,
          department: resourceData.department
        }])
        .select()
        .single();

      if (error) throw error;

      const transformedResource: Resource = {
        ...data,
        phone: '',
        location: '',
        skills: [],
        currentProjects: [],
        hourlyRate: '$0/hr',
        utilization: 0,
        status: 'Available',
        availability: 100
      };

      setResources(prev => [...prev, transformedResource]);
      toast.success('Resource added successfully');
    } catch (error) {
      console.error('Error adding resource:', error);
      toast.error('Failed to add resource');
      throw error;
    }
  };

  const updateResource = async (id: string, resourceData: Partial<Resource>) => {
    try {
      const { data, error } = await supabase
        .from('resources')
        .update({
          name: resourceData.name,
          email: resourceData.email,
          role: resourceData.role,
          department: resourceData.department
        })
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;

      const transformedResource: Resource = {
        ...data,
        phone: resourceData.phone || '',
        location: resourceData.location || '',
        skills: resourceData.skills || [],
        currentProjects: resourceData.currentProjects || [],
        hourlyRate: resourceData.hourlyRate || '$0/hr',
        utilization: resourceData.utilization || 0,
        status: resourceData.status || 'Available',
        availability: 100
      };

      setResources(prev => prev.map(resource => 
        resource.id === id ? { ...resource, ...transformedResource } : resource
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
    return resources.filter(resource => 
      resource.currentProjects?.includes(projectId)
    );
  };

  useEffect(() => {
    loadResources();

    // Set up real-time subscription
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
