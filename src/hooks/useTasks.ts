
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import type { Task } from '@/types/task';

export interface Task {
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
  const [tasks, setTasks] = useState<Task[]>([]);
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
        setTasks(data);
      }
      setLoading(false);
    }
    fetchTasks();
  }, [projectId]);

  return { tasks, loading };
}
