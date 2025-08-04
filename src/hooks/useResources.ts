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
        type: 'human' as 'human' | 'ai' | 'external',
        status: 'active' as 'active' | 'inactive' | 'pending',
        skills: [] as string[],
        availability: item.availability ? `${item.availability}%` : '100%',
        cost: 0,
        utilization: 0, // This will be calculated elsewhere
        workspace_id: item.workspace_id || '',
        name: item.name || '',
        email: item.email || '',
        role: item.role || '',
        department: item.department || '',
        phone: item.phone || '',
        location: item.location || '',
        employment_type: item.employment_type || '',
        seniority_level: item.seniority_level || '',
        mentorship_capacity: item.mentorship_capacity || false,
        notes: item.notes || '',
        hourly_rate: (item as any).hourly_rate || 0,
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
        department: resource.department,
        phone: resource.phone,
        location: resource.location,
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
        availability: data[0].availability ? `${data[0].availability}%` : '100%',
        cost: 0,
        utilization: 0,
        department: data[0].department || '',
        phone: data[0].phone || '',
        location: data[0].location || '',
        employment_type: data[0].employment_type || '',
        seniority_level: data[0].seniority_level || '',
        mentorship_capacity: data[0].mentorship_capacity || false,
        notes: data[0].notes || '',
        hourly_rate: (data[0] as any).hourly_rate || 0,
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
      // Map to database fields - include ALL editable fields
      const dbUpdates: any = {};
      
      // Map only fields that exist in the database schema
      if (updates.name !== undefined) dbUpdates.name = updates.name;
      if (updates.email !== undefined) dbUpdates.email = updates.email;
      if (updates.role !== undefined) dbUpdates.role = updates.role;
      if (updates.department !== undefined) dbUpdates.department = updates.department;
      if (updates.phone !== undefined) dbUpdates.phone = updates.phone;
      if (updates.location !== undefined) dbUpdates.location = updates.location;
      if (updates.availability !== undefined) {
        // Convert percentage string to number
        const availabilityValue = typeof updates.availability === 'string' 
          ? parseInt(updates.availability.replace('%', '')) 
          : updates.availability;
        dbUpdates.availability = availabilityValue;
      }
      if (updates.employment_type !== undefined) dbUpdates.employment_type = updates.employment_type;
      if (updates.seniority_level !== undefined) dbUpdates.seniority_level = updates.seniority_level;
      if (updates.mentorship_capacity !== undefined) dbUpdates.mentorship_capacity = updates.mentorship_capacity;
      if (updates.notes !== undefined) dbUpdates.notes = updates.notes;
      
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