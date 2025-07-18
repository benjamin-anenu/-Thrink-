
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import type { Milestone } from '@/types/milestone';

export const useMilestones = (projectId?: string) => {
  const [milestones, setMilestones] = useState<Milestone[]>([]);
  const [loading, setLoading] = useState(true);

  const loadMilestones = async () => {
    try {
      setLoading(true);
      let query = supabase
        .from('milestones')
        .select('*');
      if (projectId) {
        query = query.eq('project_id', projectId);
      }
      const { data, error } = await query.order('due_date');
      if (error) throw error;
      
      // Map database fields to interface fields
      const mappedData = (data || []).map(item => ({
        ...item,
        date: item.due_date, // Map due_date to date
      }));
      
      setMilestones(mappedData);
    } catch (error) {
      console.error('Error loading milestones:', error);
      toast.error('Failed to load milestones');
    } finally {
      setLoading(false);
    }
  };

  const createMilestone = async (milestone: Omit<Milestone, 'id' | 'created_at' | 'updated_at'>) => {
    try {
      const { data, error } = await supabase
        .from('milestones')
        .insert([{ 
          ...milestone,
          due_date: milestone.date, // Map date to due_date for database
        }])
        .select();
      if (error) throw error;
      toast.success('Milestone created');
      loadMilestones();
      
      // Map response back to interface
      const mappedResult = data?.[0] ? {
        ...data[0],
        date: data[0].due_date,
      } : null;
      
      return mappedResult as Milestone;
    } catch (error) {
      console.error('Error creating milestone:', error);
      toast.error('Failed to create milestone');
      return null;
    }
  };

  const updateMilestone = async (id: string, updates: Partial<Milestone>) => {
    try {
      const dbUpdates = { ...updates };
      if (updates.date) {
        dbUpdates.due_date = updates.date;
        delete dbUpdates.date;
      }
      
      const { error } = await supabase
        .from('milestones')
        .update(dbUpdates)
        .eq('id', id);
      if (error) throw error;
      toast.success('Milestone updated');
      loadMilestones();
      return true;
    } catch (error) {
      console.error('Error updating milestone:', error);
      toast.error('Failed to update milestone');
      return false;
    }
  };

  const deleteMilestone = async (id: string) => {
    try {
      const { error } = await supabase
        .from('milestones')
        .delete()
        .eq('id', id);
      if (error) throw error;
      toast.success('Milestone deleted');
      loadMilestones();
      return true;
    } catch (error) {
      console.error('Error deleting milestone:', error);
      toast.error('Failed to delete milestone');
      return false;
    }
  };

  useEffect(() => {
    loadMilestones();
    const subscription = supabase
      .channel('milestones_changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'milestones'
        },
        () => {
          loadMilestones();
        }
      )
      .subscribe();
    return () => {
      supabase.removeChannel(subscription);
    };
  }, [projectId]);

  return {
    milestones,
    loading,
    refreshMilestones: loadMilestones,
    createMilestone,
    updateMilestone,
    deleteMilestone
  };
};
