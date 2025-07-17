
import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export interface Resource {
  id: string;
  name: string;
  email?: string;
  role?: string;
  department?: string;
  availability?: number;
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

      setResources(data || []);
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
        .insert([resourceData])
        .select()
        .single();

      if (error) throw error;

      setResources(prev => [...prev, data]);
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
        .update(resourceData)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;

      setResources(prev => prev.map(resource => 
        resource.id === id ? { ...resource, ...data } : resource
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
    refreshResources: loadResources
  };

  return (
    <ResourceContext.Provider value={value}>
      {children}
    </ResourceContext.Provider>
  );
};
