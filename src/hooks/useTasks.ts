
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

interface Task {
  id: string;
  name: string;
  startDate?: string;
  endDate?: string;
  status?: string;
  assignedResources?: string[];
}

export const useTasks = (projectId: string) => {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!projectId) {
      setTasks([]);
      setLoading(false);
      return;
    }

    const fetchTasks = async () => {
      try {
        const { data, error } = await supabase
          .from('project_tasks')
          .select('*')
          .eq('project_id', projectId)
          .order('created_at');

        if (error) throw error;
        
        const transformedTasks = (data || []).map(task => ({
          id: task.id,
          name: task.name,
          startDate: task.start_date,
          endDate: task.end_date,
          status: task.status,
          assignedResources: task.assigned_resources || []
        }));

        setTasks(transformedTasks);
      } catch (error) {
        console.error('Error fetching tasks:', error);
        setTasks([]);
      } finally {
        setLoading(false);
      }
    };

    fetchTasks();
  }, [projectId]);

  return { tasks, loading };
};
