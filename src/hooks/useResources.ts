
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
        .insert([{
          name: resource.name,
          email: resource.email,
          role: resource.role,
          department: resource.department,
          phone: resource.phone,
          location: resource.location,
          availability: resource.availability,
          employment_type: resource.employment_type,
          seniority_level: resource.seniority_level,
          mentorship_capacity: resource.mentorship_capacity,
          notes: resource.notes,
          workspace_id: resource.workspace_id,
          hourly_rate: resource.hourly_rate,
        }])
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
      const dbUpdates: any = {};
      
      // Map all possible updateable fields
      if (updates.name !== undefined) dbUpdates.name = updates.name;
      if (updates.email !== undefined) dbUpdates.email = updates.email;
      if (updates.role !== undefined) dbUpdates.role = updates.role;
      if (updates.department !== undefined) dbUpdates.department = updates.department;
      if (updates.phone !== undefined) dbUpdates.phone = updates.phone;
      if (updates.location !== undefined) dbUpdates.location = updates.location;
      if (updates.availability !== undefined) dbUpdates.availability = updates.availability;
      if (updates.employment_type !== undefined) dbUpdates.employment_type = updates.employment_type;
      if (updates.seniority_level !== undefined) dbUpdates.seniority_level = updates.seniority_level;
      if (updates.mentorship_capacity !== undefined) dbUpdates.mentorship_capacity = updates.mentorship_capacity;
      if (updates.notes !== undefined) dbUpdates.notes = updates.notes;
      if (updates.hourly_rate !== undefined) dbUpdates.hourly_rate = updates.hourly_rate;
      
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
