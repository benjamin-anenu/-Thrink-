
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import type { Resource } from '@/types/resource';

export const useResources = () => {
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
      
      // Map database fields to interface fields
      const mappedData = (data || []).map(item => ({
        ...item,
        type: 'human' as 'human' | 'ai' | 'external', // Map to correct type
        status: 'active' as 'active' | 'inactive' | 'pending', // Map to correct status
        skills: [] as string[], // Default empty array
        availability: '100%', // Default availability string
        cost: 0, // Default cost
        workspace_id: item.workspace_id || '',
        name: item.name || '',
        email: item.email || '',
        role: item.role || '',
        department: item.department || '',
        created_at: item.created_at || '',
        updated_at: item.updated_at || '',
      }));
      
      setResources(mappedData);
    } catch (error) {
      console.error('Error loading resources:', error);
      toast.error('Failed to load resources');
    } finally {
      setLoading(false);
    }
  };

  const createResource = async (resource: Omit<Resource, 'id' | 'created_at' | 'updated_at'>) => {
    try {
      // Map to database fields - only include fields that exist in DB
      const dbData = {
        name: resource.name,
        email: resource.email,
        role: resource.role,
        workspace_id: resource.workspace_id,
      };
      
      const { data, error } = await supabase
        .from('resources')
        .insert([dbData])
        .select();
      if (error) throw error;
      toast.success('Resource created');
      loadResources();
      
      // Map response back to interface
      const mappedResult = data?.[0] ? {
        ...data[0],
        type: 'human' as 'human' | 'ai' | 'external',
        status: 'active' as 'active' | 'inactive' | 'pending',
        skills: [] as string[],
        availability: '100%',
        cost: 0,
        department: data[0].department || '',
      } : null;
      
      return mappedResult as Resource;
    } catch (error) {
      console.error('Error creating resource:', error);
      toast.error('Failed to create resource');
      return null;
    }
  };

  const updateResource = async (id: string, updates: Partial<Resource>) => {
    try {
      // Only update fields that exist in database
      const dbUpdates = {
        name: updates.name,
        email: updates.email,
        role: updates.role,
      };
      
      // Remove undefined values
      Object.keys(dbUpdates).forEach(key => {
        if (dbUpdates[key] === undefined) {
          delete dbUpdates[key];
        }
      });
      
      const { error } = await supabase
        .from('resources')
        .update(dbUpdates)
        .eq('id', id);
      if (error) throw error;
      toast.success('Resource updated');
      loadResources();
      return true;
    } catch (error) {
      console.error('Error updating resource:', error);
      toast.error('Failed to update resource');
      return false;
    }
  };

  const deleteResource = async (id: string) => {
    try {
      const { error } = await supabase
        .from('resources')
        .delete()
        .eq('id', id);
      if (error) throw error;
      toast.success('Resource deleted');
      loadResources();
      return true;
    } catch (error) {
      console.error('Error deleting resource:', error);
      toast.error('Failed to delete resource');
      return false;
    }
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

  return {
    resources,
    loading,
    refreshResources: loadResources,
    createResource,
    updateResource,
    deleteResource
  };
};
