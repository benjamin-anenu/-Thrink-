
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
      const mappedData: Resource[] = (data || []).map(item => ({
        id: item.id,
        workspace_id: item.workspace_id || '',
        name: item.name || '',
        email: item.email || '',
        role: item.role || '',
        department: item.department || '',
        status: 'active' as const,
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
      if (data?.[0]) {
        const mappedResult: Resource = {
          id: data[0].id,
          workspace_id: data[0].workspace_id || '',
          name: data[0].name || '',
          email: data[0].email || '',
          role: data[0].role || '',
          department: data[0].department || '',
          status: 'active' as const,
          created_at: data[0].created_at || '',
          updated_at: data[0].updated_at || '',
        };
        return mappedResult;
      }
      return null;
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
        if (dbUpdates[key as keyof typeof dbUpdates] === undefined) {
          delete dbUpdates[key as keyof typeof dbUpdates];
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
