
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import type { Task as TaskType } from '@/types/task';

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
  const [tasks, setTasks] = useState<TaskType[]>([]);
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
        .from('tasks')
        .select('*')
        .eq('project_id', projectId)
        .order('start_date');
      if (!error && data) {
        // Map database tasks to TaskType format
        const mappedTasks = (data || []).map(dbTask => ({
          ...dbTask,
          priority: (dbTask.priority as 'Low' | 'Medium' | 'High' | 'Critical') || 'Medium',
          status: (dbTask.status as 'Not Started' | 'In Progress' | 'Completed' | 'On Hold' | 'Cancelled') || 'Not Started'
        }));
        setTasks(mappedTasks as TaskType[]);
      }
      setLoading(false);
    }
    fetchTasks();
  }, [projectId]);

  return { tasks, loading };
}
