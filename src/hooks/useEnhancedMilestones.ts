
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export interface EnhancedMilestone {
  id: string;
  name: string;
  description: string;
  due_date: string;
  status: string;
  task_count: number;
  progress: number;
  computed_start_date: string | null;
  computed_end_date: string | null;
  phase_id: string | null;
}

export const useEnhancedMilestones = (projectId?: string) => {
  const [milestones, setMilestones] = useState<EnhancedMilestone[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchEnhancedMilestones = async () => {
      if (!projectId) {
        setMilestones([]);
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        console.log('Fetching enhanced milestones for project:', projectId);

        // Fetch milestones with computed data
        const { data: milestonesData, error: milestonesError } = await supabase
          .from('milestones')
          .select('*')
          .eq('project_id', projectId)
          .order('due_date');

        if (milestonesError) throw milestonesError;

        const enhancedMilestones = await Promise.all(
          (milestonesData || []).map(async (milestone) => {
            // Get task count for this milestone
            const { count: taskCount } = await supabase
              .from('project_tasks')
              .select('*', { count: 'exact', head: true })
              .eq('milestone_id', milestone.id);

            // Calculate progress using the database function
            const { data: progressData } = await supabase
              .rpc('calculate_milestone_progress', { milestone_id_param: milestone.id });

            // Get date range from tasks
            const { data: dateRange } = await supabase
              .rpc('get_milestone_date_range', { milestone_id_param: milestone.id });

            const computedDates = dateRange && dateRange.length > 0 
              ? { 
                  computed_start_date: dateRange[0].start_date,
                  computed_end_date: dateRange[0].end_date
                }
              : { computed_start_date: null, computed_end_date: null };

            return {
              id: milestone.id,
              name: milestone.name,
              description: milestone.description || '',
              due_date: milestone.due_date || '',
              status: milestone.status || 'upcoming',
              task_count: taskCount || 0,
              progress: progressData || 0,
              phase_id: milestone.phase_id,
              ...computedDates
            } as EnhancedMilestone;
          })
        );

        console.log('Enhanced milestones loaded:', enhancedMilestones);
        setMilestones(enhancedMilestones);

      } catch (error) {
        console.error('Error fetching enhanced milestones:', error);
        toast.error('Failed to load milestones');
        setMilestones([]);
      } finally {
        setLoading(false);
      }
    };

    fetchEnhancedMilestones();
  }, [projectId]);

  return { milestones, loading, refreshMilestones: () => {} };
};
