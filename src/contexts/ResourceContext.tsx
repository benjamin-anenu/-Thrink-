
import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { supabase } from '@/integrations/supabase/client';

export interface Resource {
  id: string;
  name: string;
  email?: string;
  role?: string;
  department?: string;
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

      setResources(data || []);
    } catch (err) {
      console.error('Error fetching resources:', err);
      setError(err instanceof Error ? err.message : 'Failed to fetch resources');
    } finally {
      setLoading(false);
    }
  };

  const createResource = async (resourceData: Omit<Resource, 'id' | 'created_at' | 'updated_at'>): Promise<Resource> => {
    try {
      const { data, error: createError } = await supabase
        .from('resources')
        .insert([resourceData])
        .select()
        .single();

      if (createError) {
        throw createError;
      }

      const newResource = data as Resource;
      setResources(prev => [newResource, ...prev]);
      return newResource;
    } catch (err) {
      console.error('Error creating resource:', err);
      throw err;
    }
  };

  const updateResource = async (id: string, updates: Partial<Resource>): Promise<void> => {
    try {
      const { error: updateError } = await supabase
        .from('resources')
        .update(updates)
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
    refreshResources
  };

  return (
    <ResourceContext.Provider value={contextValue}>
      {children}
    </ResourceContext.Provider>
  );
};
