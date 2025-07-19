
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export interface Task {
  id: string;
  project_id: string;
  name: string;
  description?: string;
  start_date?: string;
  end_date?: string;
  status?: string;
  priority?: string;
  assignee_id?: string;
  assigned_resources?: string[];
  progress?: number;
  created_at: string;
  updated_at: string;
}

export function useTasks(projectId?: string) {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchTasks = async () => {
    if (!projectId) {
      setTasks([]);
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('project_tasks')
        .select('*')
        .eq('project_id', projectId)
        .order('created_at', { ascending: false });

      if (error) throw error;

      const mappedTasks = (data || []).map(task => ({
        id: task.id,
        project_id: task.project_id,
        name: task.name,
        description: task.description,
        start_date: task.start_date,
        end_date: task.end_date,
        status: task.status,
        priority: task.priority,
        assignee_id: task.assignee_id,
        assigned_resources: task.assigned_resources || [],
        progress: task.progress || 0,
        created_at: task.created_at,
        updated_at: task.updated_at
      }));

      setTasks(mappedTasks);
    } catch (error) {
      console.error('Error fetching tasks:', error);
      toast.error('Failed to load tasks');
    } finally {
      setLoading(false);
    }
  };

  const assignResourceToTask = async (taskId: string, resourceId: string) => {
    try {
      const { error } = await supabase
        .from('project_tasks')
        .update({ assignee_id: resourceId })
        .eq('id', taskId);

      if (error) throw error;

      toast.success('Resource assigned to task successfully');
      fetchTasks(); // Refresh tasks
      return true;
    } catch (error) {
      console.error('Error assigning resource to task:', error);
      toast.error('Failed to assign resource to task');
      return false;
    }
  };

  useEffect(() => {
    fetchTasks();
  }, [projectId]);

  return { 
    tasks, 
    loading, 
    refetch: fetchTasks,
    assignResourceToTask
  };
}
