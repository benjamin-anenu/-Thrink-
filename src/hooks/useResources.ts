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
      setResources(data || []);
    } catch (error) {
      console.error('Error loading resources:', error);
      toast.error('Failed to load resources');
    } finally {
      setLoading(false);
    }
  };

  const createResource = async (resource: Omit<Resource, 'id' | 'created_at' | 'updated_at'>) => {
    try {
      const { data, error } = await supabase
        .from('resources')
        .insert([{ ...resource }])
        .select();
      if (error) throw error;
      toast.success('Resource created');
      loadResources();
      return data?.[0] as Resource;
    } catch (error) {
      console.error('Error creating resource:', error);
      toast.error('Failed to create resource');
      return null;
    }
  };

  const updateResource = async (id: string, updates: Partial<Resource>) => {
    try {
      const { error } = await supabase
        .from('resources')
        .update({ ...updates })
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