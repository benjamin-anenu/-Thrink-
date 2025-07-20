
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export interface TaskData {
  id: string;
  project_id: string;
  name: string;
  description?: string;
  start_date?: string;
  end_date?: string;
  status?: string;
  priority?: string;
  estimated_hours?: number;
  assigned_resource_id?: string;
}

export function useTasks(projectId?: string) {
  const [tasks, setTasks] = useState<TaskData[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!projectId) {
      setTasks([]);
      setLoading(false);
      return;
    }
    async function fetchTasks() {
      setLoading(true);
      const { data, error } = await supabase
        .from('project_tasks')
        .select('*')
        .eq('project_id', projectId)
        .order('start_date');
      if (!error && data) {
        // Map the data to ensure compatibility
        const mappedTasks = data.map(task => ({
          id: task.id,
          project_id: task.project_id,
          name: task.name,
          description: task.description || '',
          start_date: task.start_date || '',
          end_date: task.end_date || '',
          status: task.status || 'Pending',
          priority: task.priority || 'Medium',
          estimated_hours: task.duration || 0,
          assigned_resource_id: task.assigned_resources?.[0] || ''
        }));
        setTasks(mappedTasks);
      }
      setLoading(false);
    }
    fetchTasks();
  }, [projectId]);

  return { tasks, loading };
}
