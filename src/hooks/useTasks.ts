
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
      console.log('Fetching tasks for project:', projectId);
      
      const { data, error } = await supabase
        .from('project_tasks')
        .select('*')
        .eq('project_id', projectId)
        .order('start_date');
      
      if (error) {
        console.error('Error fetching tasks:', error);
        toast.error('Failed to load tasks');
        setTasks([]);
      } else if (data) {
        console.log('Fetched tasks:', data);
        // Map database tasks to TaskType format
        const mappedTasks = data.map(dbTask => ({
          id: dbTask.id,
          project_id: dbTask.project_id,
          name: dbTask.name,
          description: dbTask.description || '',
          start_date: dbTask.start_date || '',
          end_date: dbTask.end_date || '',
          baseline_start_date: dbTask.baseline_start_date || dbTask.start_date || '',
          baseline_end_date: dbTask.baseline_end_date || dbTask.end_date || '',
          progress: dbTask.progress || 0,
          assigned_resources: dbTask.assigned_resources || [],
          assigned_stakeholders: dbTask.assigned_stakeholders || [],
          dependencies: dbTask.dependencies || [],
          priority: (dbTask.priority as 'Low' | 'Medium' | 'High' | 'Critical') || 'Medium',
          status: (dbTask.status as 'Not Started' | 'In Progress' | 'Completed' | 'On Hold' | 'Cancelled') || 'Not Started',
          milestone_id: dbTask.milestone_id,
          duration: dbTask.duration || 1,
          parent_task_id: dbTask.parent_task_id,
          hierarchy_level: dbTask.hierarchy_level || 0,
          sort_order: dbTask.sort_order || 0,
          created_at: dbTask.created_at,
          updated_at: dbTask.updated_at
        }));
        setTasks(mappedTasks as TaskType[]);
      } else {
        setTasks([]);
      }
      setLoading(false);
    }
    
    fetchTasks();
  }, [projectId]);

  return { tasks, loading };
}
