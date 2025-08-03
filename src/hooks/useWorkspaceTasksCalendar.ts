import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useWorkspace } from '@/contexts/WorkspaceContext';

export interface WorkspaceTaskEvent {
  id: string;
  title: string;
  description?: string;
  type: 'task-start' | 'task-deadline' | 'task-conflict';
  date: string;
  startTime?: string;
  endTime?: string;
  projectId: string;
  projectName: string;
  taskId: string;
  priority: 'Low' | 'Medium' | 'High' | 'Critical';
  status: string;
  assignedResources: string[];
  isConflict?: boolean;
}

export const useWorkspaceTasksCalendar = (currentProjectId?: string) => {
  const [events, setEvents] = useState<WorkspaceTaskEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { currentWorkspace } = useWorkspace();

  useEffect(() => {
    const fetchWorkspaceTasks = async () => {
      if (!currentWorkspace) return;

      try {
        setLoading(true);
        setError(null);

        // Fetch all tasks from projects in the current workspace
        const { data: tasks, error: tasksError } = await supabase
          .from('project_tasks')
          .select(`
            id,
            name,
            description,
            start_date,
            end_date,
            priority,
            status,
            assigned_resources,
            project_id,
            projects!inner(
              id,
              name,
              workspace_id
            )
          `)
          .eq('projects.workspace_id', currentWorkspace.id)
          .neq('project_id', currentProjectId || '') // Exclude current project if specified
          .not('start_date', 'is', null)
          .not('end_date', 'is', null);

        if (tasksError) throw tasksError;

        // Transform tasks into calendar events
        const taskEvents: WorkspaceTaskEvent[] = [];

        tasks?.forEach((task) => {
          const projectName = (task.projects as any)?.name || 'Unknown Project';
          
          // Add task start event
          if (task.start_date) {
            taskEvents.push({
              id: `${task.id}-start`,
              title: `${task.name} (Start)`,
              description: task.description || '',
              type: 'task-start',
              date: task.start_date,
              projectId: task.project_id,
              projectName,
              taskId: task.id,
              priority: task.priority as 'Low' | 'Medium' | 'High' | 'Critical',
              status: task.status,
              assignedResources: task.assigned_resources || [],
            });
          }

          // Add task deadline event
          if (task.end_date) {
            taskEvents.push({
              id: `${task.id}-deadline`,
              title: `${task.name} (Due)`,
              description: task.description || '',
              type: 'task-deadline',
              date: task.end_date,
              projectId: task.project_id,
              projectName,
              taskId: task.id,
              priority: task.priority as 'Low' | 'Medium' | 'High' | 'Critical',
              status: task.status,
              assignedResources: task.assigned_resources || [],
            });
          }
        });

        // If we have a current project, fetch its tasks to detect conflicts
        if (currentProjectId) {
          const { data: currentProjectTasks } = await supabase
            .from('project_tasks')
            .select('id, name, start_date, end_date, assigned_resources')
            .eq('project_id', currentProjectId)
            .not('start_date', 'is', null)
            .not('end_date', 'is', null);

          // Mark conflicting events
          taskEvents.forEach((event) => {
            const hasConflict = currentProjectTasks?.some((currentTask) => {
              // Check for date overlap
              const eventDate = new Date(event.date);
              const currentStart = new Date(currentTask.start_date);
              const currentEnd = new Date(currentTask.end_date);
              
              const hasDateOverlap = eventDate >= currentStart && eventDate <= currentEnd;
              
              // Check for resource conflict
              const currentResources = currentTask.assigned_resources || [];
              const eventResources = event.assignedResources || [];
              const hasResourceOverlap = currentResources.some(resource => 
                eventResources.includes(resource)
              );

              return hasDateOverlap && hasResourceOverlap;
            });

            if (hasConflict) {
              event.isConflict = true;
              event.type = 'task-conflict';
            }
          });
        }

        setEvents(taskEvents);
      } catch (err) {
        console.error('Error fetching workspace tasks:', err);
        setError(err instanceof Error ? err.message : 'Failed to fetch workspace tasks');
      } finally {
        setLoading(false);
      }
    };

    fetchWorkspaceTasks();
  }, [currentWorkspace, currentProjectId]);

  return { events, loading, error };
};